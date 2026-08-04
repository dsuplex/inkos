import { BaseAgent } from "./base.js";
import type { ArchitectOutput } from "./architect.js";

export interface FoundationReviewResult {
  readonly passed: boolean;
  readonly totalScore: number;
  readonly dimensions: ReadonlyArray<{
    readonly name: string;
    readonly score: number;
    readonly feedback: string;
  }>;
  readonly overallFeedback: string;
}

const PASS_THRESHOLD = 80;
const DIMENSION_FLOOR = 60;

export class FoundationReviewerAgent extends BaseAgent {
  get name(): string {
    return "foundation-reviewer";
  }

  async review(params: {
    readonly foundation: ArchitectOutput;
    readonly mode: "original" | "fanfic" | "series";
    readonly sourceCanon?: string;
    readonly styleGuide?: string;
    readonly language: "zh" | "ko" | "en";
    readonly targetChapters?: number;
  }): Promise<FoundationReviewResult> {
    const canonBlock = params.sourceCanon
      ? `\n## 原作正典参照\n${params.sourceCanon}\n`
      : "";
    const styleBlock = params.styleGuide
      ? `\n## 原作风格参照\n${params.styleGuide}\n`
      : "";

    const dimensions = params.mode === "original"
      ? this.originalDimensions(params.language, params.targetChapters)
      : this.derivativeDimensions(params.language, params.mode);

    const systemPrompt = params.language === "en"
      ? this.buildEnglishReviewPrompt(dimensions, canonBlock, styleBlock)
      : params.language === "ko"
        ? this.buildKoreanReviewPrompt(dimensions, canonBlock, styleBlock)
        : this.buildChineseReviewPrompt(dimensions, canonBlock, styleBlock);

    const userPrompt = this.buildFoundationExcerpt(params.foundation, params.language);

    const response = await this.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], { temperature: 0.3 });

    return this.parseReviewResult(response.content, dimensions);
  }

  private originalDimensions(language: "zh" | "ko" | "en", targetChapters?: number): ReadonlyArray<string> {
    const target = Number.isFinite(targetChapters) && targetChapters && targetChapters > 0
      ? Math.round(targetChapters)
      : 40;
    const openingWindow = Math.min(5, target);
    const repeatWindow = Math.min(10, Math.max(3, target));
    if (language === "en") {
      return [
        `Core Conflict (Is there a clear, compelling central conflict that can sustain the requested ${target} chapters?)`,
        `Opening Momentum (Can the first ${openingWindow} chapters create a page-turning hook?)`,
        "World Coherence (Is the worldbuilding internally consistent and specific?)",
        "Character Differentiation (Are the main characters distinct in voice and motivation?)",
        `Pacing Feasibility (Does the outline fit the requested ${target} chapters and avoid repeating the same beat for ${repeatWindow} chapters?)`,
      ];
    }
    if (language === "ko") {
      return [
        `핵심 갈등(요청한 ${target}장을 지탱할 만큼 명확하고 팽팽한 중심 갈등이 있는가?)`,
        `오프닝 모멘텀(앞 ${openingWindow}장이 페이지를 넘기게 만드는 훅을 형성하는가?)`,
        "세계관 일관성(세계관이 내적으로 정합적이고 구체적인가?)",
        "캐릭터 구별도(주요 캐릭터의 목소리와 동기가 서로 다른가?)",
        `리듬 실현성(대본이 요청한 ${target}장에 맞고, 같은 비트가 ${repeatWindow}장 연속 반복되지 않는가?)`,
      ];
    }
    return [
      `核心冲突（是否有清晰且有足够张力的核心冲突支撑用户要求的${target}章？）`,
      `开篇节奏（前${openingWindow}章能否形成翻页驱动力？）`,
      "世界一致性（世界观是否内洽且具体？）",
      "角色区分度（主要角色的声音和动机是否各不相同？）",
      `节奏可行性（大纲是否适配用户要求的${target}章，并避免连续${repeatWindow}章同一种节拍？）`,
    ];
  }

  private derivativeDimensions(language: "zh" | "ko" | "en", mode: "fanfic" | "series"): ReadonlyArray<string> {
    const modeLabel = mode === "fanfic"
      ? (language === "en" ? "Fan Fiction" : language === "ko" ? "팬픽" : "同人")
      : (language === "en" ? "Series" : language === "ko" ? "시리즈" : "系列");

    if (language === "en") {
      return [
        `Source DNA Preservation (Does the ${modeLabel} respect the original's world rules, character personalities, and established facts?)`,
        `New Narrative Space (Is there a clear divergence point or new territory that gives the story room to be ORIGINAL, not a retelling?)`,
        "Core Conflict (Is the new story's central conflict compelling and distinct from the original?)",
        "Opening Momentum (Can the first 5 chapters create a page-turning hook without requiring 3 chapters of setup?)",
        `Pacing Feasibility (Does the outline avoid the trap of re-walking the original's plot beats?)`,
      ];
    }
    if (language === "ko") {
      return [
        `원작 DNA 보존(${modeLabel}이 원작의 세계 규칙, 캐릭터 성격, 확립된 사실을 존중하는가?)`,
        `새로운 서사 공간(명확한 분기점이나 새 영역이 있어 이야기가 복습이 아닌 창작이 되도록 하는가?)`,
        "핵심 갈등(새 이야기의 중심 갈등이 원작과 구별되며 매력적인가?)",
        "오프닝 모멘텀(첫 5장이 3장 분량의 설정 없이도 페이지를 넘기게 만드는 훅을 주는가?)",
        `리듬 실현성(대본이 원작의 플롯 비트를 되짚는 함정을 피하는가?)`,
      ];
    }
    return [
      `原作DNA保留（${modeLabel}是否尊重原作的世界规则、角色性格、已确立事实？）`,
      `新叙事空间（是否有明确的分岔点或新领域，让故事有原创空间，而非复述原作？）`,
      "核心冲突（新故事的核心冲突是否有足够张力且区别于原作？）",
      "开篇节奏（前5章能否形成翻页驱动力，不需要3章铺垫？）",
      `节奏可行性（卷纲是否避免了重走原作剧情节拍的陷阱？）`,
    ];
  }

  private buildKoreanReviewPrompt(
    dimensions: ReadonlyArray<string>,
    canonBlock: string,
    styleBlock: string,
  ): string {
    return `당신은 베테랑 소설 편집자입니다. 새 책의 기초 설정(세계관 + 대본 + 규칙)을 검토합니다.

다음 각 항목을 0-100점으로 채점하고 구체적 의견을 적으세요:

${dimensions.map((dim, i) => `${i + 1}. ${dim}`).join("\n")}

## 채점 기준
- 80점 이상 통과: 집필 시작 가능
- 60-79점: 명확한 문제 있음, 수정 필요
- 60점 미만: 방향성 오류, 재설계 필요

## 출력 형식(엄수)
=== DIMENSION: 1 ===
점수: {0-100}
의견: {구체적 피드백}

=== DIMENSION: 2 ===
점수: {0-100}
의견: {구체적 피드백}

...(각 항목마다 한 블록)

=== OVERALL ===
총점: {가중 평균}
통과: {예/아니오}
총평: {1-2문단, 가장 큰 문제와 가장 칭찬할 강점}
${canonBlock}${styleBlock}

엄격하게 채점하세요. 80점은 "수정 없이 바로 집필 가능"을 의미합니다.`;
  }

  private buildChineseReviewPrompt(
    dimensions: ReadonlyArray<string>,
    canonBlock: string,
    styleBlock: string,
  ): string {
    return `你是一位资深小说编辑，正在审核一本新书的基础设定（世界观 + 大纲 + 规则）。

你需要从以下维度逐项打分（0-100），并给出具体意见：

${dimensions.map((dim, i) => `${i + 1}. ${dim}`).join("\n")}

## 评分标准
- 80+ 通过，可以开始写作
- 60-79 有明显问题，需要修改
- <60 方向性错误，需要重新设计

## 输出格式（严格遵守）
=== DIMENSION: 1 ===
分数：{0-100}
意见：{具体反馈}

=== DIMENSION: 2 ===
分数：{0-100}
意见：{具体反馈}

...（每个维度一个 block）

=== OVERALL ===
总分：{加权平均}
通过：{是/否}
总评：{1-2段总结，指出最大的问题和最值得保留的优点}
${canonBlock}${styleBlock}

审核时要严格。不要因为"还行"就给高分。80分意味着"可以直接开写，不需要改"。`;
  }

  private buildEnglishReviewPrompt(
    dimensions: ReadonlyArray<string>,
    canonBlock: string,
    styleBlock: string,
  ): string {
    return `You are a senior fiction editor reviewing a new book's foundation (worldbuilding + outline + rules).

Score each dimension (0-100) with specific feedback:

${dimensions.map((dim, i) => `${i + 1}. ${dim}`).join("\n")}

## Scoring
- 80+ Pass — ready to write
- 60-79 Needs revision
- <60 Fundamental direction problem

## Output format (strict)
=== DIMENSION: 1 ===
Score: {0-100}
Feedback: {specific feedback}

=== DIMENSION: 2 ===
Score: {0-100}
Feedback: {specific feedback}

...

=== OVERALL ===
Total: {weighted average}
Passed: {yes/no}
Summary: {1-2 paragraphs — biggest problem and best quality}
${canonBlock}${styleBlock}

Be strict. 80 means "ready to write without changes."`;
  }

  private buildFoundationExcerpt(foundation: ArchitectOutput, language: "zh" | "ko" | "en"): string {
    if (language === "en") {
      return `## Story Bible\n${foundation.storyBible}\n\n## Volume Outline\n${foundation.volumeOutline}\n\n## Book Rules\n${foundation.bookRules}\n\n## Initial State\n${foundation.currentState}\n\n## Initial Hooks\n${foundation.pendingHooks}`;
    }
    if (language === "ko") {
      return `## 세계 설정\n${foundation.storyBible}\n\n## 볼 강령\n${foundation.volumeOutline}\n\n## 규칙\n${foundation.bookRules}\n\n## 초기 상태\n${foundation.currentState}\n\n## 초기 훅\n${foundation.pendingHooks}`;
    }
    return `## 世界设定\n${foundation.storyBible}\n\n## 卷纲\n${foundation.volumeOutline}\n\n## 规则\n${foundation.bookRules}\n\n## 初始状态\n${foundation.currentState}\n\n## 初始伏笔\n${foundation.pendingHooks}`;
  }

  private parseReviewResult(
    content: string,
    dimensions: ReadonlyArray<string>,
  ): FoundationReviewResult {
    const parsedDimensions: Array<{ readonly name: string; readonly score: number; readonly feedback: string }> = [];

    for (let i = 0; i < dimensions.length; i++) {
      const regex = new RegExp(
        `=== DIMENSION: ${i + 1} ===\\s*[\\s\\S]*?(?:分数|Score)[：:]\\s*(\\d+)[\\s\\S]*?(?:意见|Feedback)[：:]\\s*([\\s\\S]*?)(?==== |$)`,
      );
      const match = content.match(regex);
      parsedDimensions.push({
        name: dimensions[i]!,
        score: match ? parseInt(match[1]!, 10) : 50,
        feedback: match ? match[2]!.trim() : "(parse failed)",
      });
    }

    const totalScore = parsedDimensions.length > 0
      ? Math.round(parsedDimensions.reduce((sum, d) => sum + d.score, 0) / parsedDimensions.length)
      : 0;
    const anyBelowFloor = parsedDimensions.some((d) => d.score < DIMENSION_FLOOR);
    const passed = totalScore >= PASS_THRESHOLD && !anyBelowFloor;

    const overallMatch = content.match(
      /=== OVERALL ===[\s\S]*?(?:总评|Summary)[：:]\s*([\s\S]*?)$/,
    );
    const overallFeedback = overallMatch ? overallMatch[1]!.trim() : "(parse failed)";

    return { passed, totalScore, dimensions: parsedDimensions, overallFeedback };
  }
}
