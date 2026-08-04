import { BaseAgent } from "./base.js";
import type { BookConfig } from "../models/book.js";
import type { GenreProfile } from "../models/genre-profile.js";
import type { ContextPackage, RuleStack } from "../models/input-governance.js";
import { readGenreProfile, readBookRules } from "./rules-reader.js";
import { parseWriterOutput, type ParsedWriterOutput } from "./writer-parser.js";
import { buildGovernedMemoryEvidenceBlocks } from "../utils/governed-context.js";
import {
  buildGovernedCharacterMatrixWorkingSet,
  buildGovernedHookWorkingSet,
} from "../utils/governed-working-set.js";
import { filterEmotionalArcs, filterSubplots } from "../utils/context-filter.js";
import { countChapterLength, resolveLengthCountingMode } from "../utils/length-metrics.js";
import { retrieveMemorySelection } from "../utils/memory-retrieval.js";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  readStoryFrame,
  readVolumeMap,
  readCharacterContext,
  readCurrentStateWithFallback,
} from "../utils/outline-paths.js";

export interface AnalyzeChapterInput {
  readonly book: BookConfig;
  readonly bookDir: string;
  readonly chapterNumber: number;
  readonly chapterContent: string;
  readonly chapterTitle?: string;
  readonly chapterIntent?: string;
  readonly contextPackage?: ContextPackage;
  readonly ruleStack?: RuleStack;
}

export type AnalyzeChapterOutput = ParsedWriterOutput;

export class ChapterAnalyzerAgent extends BaseAgent {
  get name(): string {
    return "chapter-analyzer";
  }

  async analyzeChapter(input: AnalyzeChapterInput): Promise<AnalyzeChapterOutput> {
    const { book, bookDir, chapterNumber, chapterContent, chapterTitle } = input;
    const { profile: genreProfile, body: genreBody } =
      await readGenreProfile(this.ctx.projectRoot, book.genre);
    const resolvedLanguage = book.language ?? genreProfile.language;

    // Read current truth files (same set as writer.ts). Phase 5: prefer the
    // new prose outline (story_frame / volume_map) and roles/ directory.
    const placeholder = this.missingFilePlaceholder(resolvedLanguage);
    const [
      currentState, ledger, hooks,
      subplotBoard, emotionalArcs, characterMatrix,
      storyBible, volumeOutline,
    ] = await Promise.all([
      // Phase 5 consolidation: derive initial state from roles + seed hooks
      // when current_state.md is still the architect seed placeholder.
      readCurrentStateWithFallback(bookDir, placeholder),
      this.readFileOrDefault(join(bookDir, "story/particle_ledger.md"), resolvedLanguage),
      this.readFileOrDefault(join(bookDir, "story/pending_hooks.md"), resolvedLanguage),
      this.readFileOrDefault(join(bookDir, "story/subplot_board.md"), resolvedLanguage),
      this.readFileOrDefault(join(bookDir, "story/emotional_arcs.md"), resolvedLanguage),
      readCharacterContext(bookDir, placeholder),
      readStoryFrame(bookDir, placeholder),
      readVolumeMap(bookDir, placeholder),
    ]);
    const parsedBookRules = await readBookRules(bookDir);
    const bookRulesBody = parsedBookRules?.body ?? "";
    const bookRules = parsedBookRules?.rules;
    const governedMode = Boolean(input.chapterIntent && input.contextPackage && input.ruleStack);
    const memorySelection = await retrieveMemorySelection({
      bookDir,
      chapterNumber,
      goal: this.buildMemoryGoal(chapterTitle, chapterContent),
      outlineNode: this.findOutlineNode(volumeOutline, chapterNumber),
    });
    const chapterSummaries = this.renderSummarySnapshot(
      memorySelection.summaries,
      resolvedLanguage,
    );
    const governedMemoryBlocks = input.contextPackage
      ? buildGovernedMemoryEvidenceBlocks(input.contextPackage, resolvedLanguage)
      : undefined;
    const hooksWorkingSet = governedMode && input.contextPackage
      ? buildGovernedHookWorkingSet({
          hooksMarkdown: hooks,
          contextPackage: input.contextPackage,
          chapterIntent: input.chapterIntent,
          chapterNumber,
          language: resolvedLanguage,
        })
      : hooks;
    const subplotWorkingSet = governedMode
      ? filterSubplots(subplotBoard)
      : subplotBoard;
    const emotionalWorkingSet = governedMode
      ? filterEmotionalArcs(emotionalArcs, chapterNumber)
      : emotionalArcs;
    const matrixWorkingSet = governedMode && input.chapterIntent && input.contextPackage
      ? buildGovernedCharacterMatrixWorkingSet({
          matrixMarkdown: characterMatrix,
          chapterIntent: input.chapterIntent,
          contextPackage: input.contextPackage,
          protagonistName: bookRules?.protagonist?.name,
        })
      : characterMatrix;
    const reducedControlBlock = governedMode && input.chapterIntent && input.contextPackage && input.ruleStack
      ? this.buildReducedControlBlock(input.chapterIntent, input.contextPackage, input.ruleStack, resolvedLanguage)
      : "";

    const systemPrompt = this.buildSystemPrompt(
      book,
      genreProfile,
      genreBody,
      bookRulesBody,
      resolvedLanguage,
    );

    const userPrompt = this.buildUserPrompt({
      language: resolvedLanguage,
      chapterNumber,
      chapterContent,
      chapterTitle,
      currentState,
      ledger: genreProfile.numericalSystem ? ledger : "",
      hooks: hooksWorkingSet,
      chapterSummaries,
      subplotBoard: subplotWorkingSet,
      emotionalArcs: emotionalWorkingSet,
      characterMatrix: matrixWorkingSet,
      bibleBlock: !governedMode && storyBible !== this.missingFilePlaceholder(resolvedLanguage)
        ? resolvedLanguage === "en"
          ? `\n## Story Bible\n${storyBible}\n`
          : `\n## 世界观设定\n${storyBible}\n`
        : "",
      outlineOrControlBlock: reducedControlBlock || (
        volumeOutline !== this.missingFilePlaceholder(resolvedLanguage)
          ? resolvedLanguage === "en"
            ? `\n## Volume Outline\n${volumeOutline}\n`
            : `\n## 卷纲\n${volumeOutline}\n`
          : ""
      ),
      hooksBlock: governedMemoryBlocks?.hooksBlock
        ?? (
          hooksWorkingSet !== this.missingFilePlaceholder(resolvedLanguage)
            ? resolvedLanguage === "en"
              ? `\n## Current Hooks\n${hooksWorkingSet}\n`
              : `\n## 当前伏笔池\n${hooksWorkingSet}\n`
            : ""
        ),
      summariesBlock: governedMemoryBlocks?.summariesBlock
        ?? (
          chapterSummaries !== this.missingFilePlaceholder(resolvedLanguage)
            ? resolvedLanguage === "en"
              ? `\n## Existing Chapter Summaries\n${chapterSummaries}\n`
              : `\n## 已有章节摘要\n${chapterSummaries}\n`
            : ""
        ),
      volumeSummariesBlock: governedMemoryBlocks?.volumeSummariesBlock ?? "",
      subplotBlock: subplotWorkingSet !== this.missingFilePlaceholder(resolvedLanguage)
        ? resolvedLanguage === "en"
          ? `\n## Current Subplot Board\n${subplotWorkingSet}\n`
          : `\n## 当前支线进度板\n${subplotWorkingSet}\n`
        : "",
      emotionalBlock: emotionalWorkingSet !== this.missingFilePlaceholder(resolvedLanguage)
        ? resolvedLanguage === "en"
          ? `\n## Current Emotional Arcs\n${emotionalWorkingSet}\n`
          : `\n## 当前情感弧线\n${emotionalWorkingSet}\n`
        : "",
      matrixBlock: matrixWorkingSet !== this.missingFilePlaceholder(resolvedLanguage)
        ? resolvedLanguage === "en"
          ? `\n## Current Character Matrix\n${matrixWorkingSet}\n`
          : `\n## 当前角色交互矩阵\n${matrixWorkingSet}\n`
        : "",
    });

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.3 },
    );

    const countingMode = resolveLengthCountingMode(book.language ?? genreProfile.language);
    const output = parseWriterOutput(chapterNumber, response.content, genreProfile, countingMode);
    const canonicalContent = chapterContent;
    const canonicalWordCount = countChapterLength(canonicalContent, countingMode);

    // If LLM didn't return a title, use the one from input or derive from chapter number
    if (
      chapterTitle
      && (
        output.title === this.defaultChapterTitle(chapterNumber, resolvedLanguage)
        || output.title === `第${chapterNumber}章`
      )
    ) {
      return {
        ...output,
        title: chapterTitle,
        content: canonicalContent,
        wordCount: canonicalWordCount,
      };
    }

    return {
      ...output,
      content: canonicalContent,
      wordCount: canonicalWordCount,
    };
  }

  private buildSystemPrompt(
    book: BookConfig,
    genreProfile: GenreProfile,
    genreBody: string,
    bookRulesBody: string,
    language: "zh" | "ko" | "en",
  ): string {
    if (language === "en") {
      const numericalBlock = genreProfile.numericalSystem
        ? "\n- This genre tracks numerical/resources systems; UPDATED_LEDGER must capture every resource change shown in the chapter."
        : "\n- This genre has no numerical system; leave UPDATED_LEDGER empty.";

      return `【LANGUAGE OVERRIDE】ALL output MUST be in English. The === TAG === markers remain unchanged.

You are a fiction continuity analyst. Analyze a finished chapter, extract every state change, and update the tracking files.

## Working Mode

You are not writing new prose. You are reading completed chapter text and updating the book's truth files.
1. Read the chapter carefully and extract all important facts.
2. Update the existing tracking files incrementally rather than rebuilding them from scratch.
3. Keep the output contract identical to the writer pipeline.

## What To Extract

- Character entrances, exits, injuries, breakthroughs, deaths, and other status changes
- Location movement and scene transitions
- Item or resource gains and losses
- Hook setup, advancement, and payoff
- Emotional arc movement
- Subplot progress
- Relationship changes and information-boundary changes

## Book Information

- Title: ${book.title}
- Genre: ${genreProfile.name} (${book.genre})
- Platform: ${book.platform}
${numericalBlock}

## Genre Guidance

${genreBody}

${bookRulesBody ? `## Book Rules\n\n${bookRulesBody}` : ""}

## Output Format

Use === TAG === delimiters exactly as shown:

=== CHAPTER_TITLE ===
(Extract or infer the chapter title. Output title text only.)

=== CHAPTER_CONTENT ===
(Repeat the original chapter content exactly. Do not rewrite.)

=== PRE_WRITE_CHECK ===
(Leave empty in analysis mode.)

=== POST_SETTLEMENT ===
(Leave empty in analysis mode.)

=== UPDATED_STATE ===
Updated state card as a Markdown table reflecting the end-of-chapter state:
| Field | Value |
| --- | --- |
| Current Chapter | {chapter_number} |
| Current Location | ... |
| Protagonist State | ... |
| Current Goal | ... |
| Current Constraint | ... |
| Current Alliances | ... |
| Current Conflict | ... |

=== UPDATED_LEDGER ===
(If the genre has a numerical system: output the fully updated resource ledger table. Otherwise leave empty.)

=== UPDATED_HOOKS ===
Updated hooks pool as a Markdown table with the latest status of every known hook:
| hook_id | start_chapter | type | status | last_advanced_chapter | expected_payoff | payoff_timing | notes |

=== CHAPTER_SUMMARY ===
Single Markdown table row:
| Chapter | Title | Characters | Key Events | State Changes | Hook Activity | Mood | Chapter Type |

=== UPDATED_SUBPLOTS ===
Updated subplot board (Markdown table)

=== UPDATED_EMOTIONAL_ARCS ===
Updated emotional arcs (Markdown table)

=== UPDATED_CHARACTER_MATRIX ===
Updated character matrix (one ## section per character, bullet-list fields):

## Character Name
- **Role**: protagonist / antagonist / ally / minor / mentioned
- **Tags**: core identity tags
- **Contrast**: distinctive details that defy expectations
- **Speech**: speaking style summary
- **Personality**: core personality traits
- **Motivation**: fundamental driving force
- **Current**: immediate goal this chapter
- **Relationships**: OtherChar(type/Ch#) | ...
- **Known**: what this character knows (only witnessed or told)
- **Unknown**: what this character does not know

(Repeat for each character. Add new characters; keep existing ones updated.)

## Rules

1. UPDATED_STATE and UPDATED_HOOKS must be incremental updates based on the current tracking files.
2. Every factual change in the chapter must appear in the corresponding tracking file.
3. Do not miss resource changes, movement, relationship changes, or information changes.
4. Information boundaries in the character matrix must stay exact: each character only knows what they directly witnessed or learned.`;
    }
    if (language === "ko") {
      const numericalBlock = genreProfile.numericalSystem
        ? "\n- 본 장르에는 수치/자원 시스템이 있습니다. UPDATED_LEDGER에 본문에 나온 모든 자원 변동을 반드시 기록하세요."
        : "\n- 본 장르에는 수치 시스템이 없습니다. UPDATED_LEDGER는 비워 두세요.";

      return `【언어 재정의】모든 출력은 반드시 한국어로 작성하세요. === TAG === 표식은 그대로 유지.

당신은 소설 연속성 분석가입니다. 완료된 장을 분석해 모든 상태 변화를 추출하고 추적 파일을 업데이트합니다.

## 작업 모드

새 글을 쓰는 게 아닙니다. 이미 완성된 장 본문을 읽고 책의 진실 파일을 갱신합니다.
1. 장을 꼼꼼히 읽고 모든 중요 사실을 추출하세요.
2. 기존 추적 파일을 기반으로 증분 업데이트하세요(백지에서 다시 쓰지 마세요).
3. 출력 계약은 작가 파이프라인과 동일하게 유지하세요.

## 추출 대상

- 캐릭터 출현/퇴장, 부상/돌파/사망 등 상태 변화
- 위치 이동, 장면 전환
- 아이템/자원의 획득과 손실
- 훅 매설, 추진, 회수
- 감정 아크 변화
- 지선 진행
- 관계 변화, 정보 경계 변화

## 도서 정보

- 제목: ${book.title}
- 장르: ${genreProfile.name} (${book.genre})
- 플랫폼: ${book.platform}
${numericalBlock}

## 장르 가이드

${genreBody}

${bookRulesBody ? `## 도서 규칙\n\n${bookRulesBody}` : ""}

## 출력 형식

=== TAG === 구분자를 아래와 정확히 맞춰 사용하세요:

=== CHAPTER_TITLE ===
(장 제목을 추출하거나 추론. 제목 텍스트만 출력)

=== CHAPTER_CONTENT ===
(원본 장 내용을 그대로 반복. 재작성 금지.)

=== PRE_WRITE_CHECK ===
(분석 모드에서는 비움)

=== POST_SETTLEMENT ===
(분석 모드에서는 비움)

=== UPDATED_STATE ===
장 끝 시점의 최신 상태를 반영한 Markdown 표로 갱신된 상태 카드:
| 필드 | 값 |
| --- | --- |
| 현재 장 | {장_번호} |
| 현재 위치 | ... |
| 주인공 상태 | ... |
| 현재 목표 | ... |
| 현재 제약 | ... |
| 현재 관계 | ... |
| 현재 갈등 | ... |

=== UPDATED_LEDGER ===
(장르에 수치 시스템이 있으면: 완전 갱신된 자원 장부 표. 없으면 비움)

=== UPDATED_HOOKS ===
모든 알려진 훅의 최신 상태를 담은 Markdown 표로 갱신된 훅 풀:
| 훅_id | 시작 장 | 유형 | 상태 | 최근 추진 장 | 예상 회수 | 회수 리듬 | 비고 |

=== CHAPTER_SUMMARY ===
단일 Markdown 표 행:
| 장 | 제목 | 출현 인물 | 핵심 사건 | 상태 변화 | 훅 동태 | 감정 기조 | 장 유형 |

=== UPDATED_SUBPLOTS ===
갱신된 지선 보드 (Markdown 표)

=== UPDATED_EMOTIONAL_ARCS ===
갱신된 감정 아크 (Markdown 표)

=== UPDATED_CHARACTER_MATRIX ===
갱신된 캐릭터 매트릭스 (캐릭터당 ## 섹션 1개, bullet list 필드):

## 캐릭터명
- **역할**: 주인공 / 적대자 / 협력자 / 조연 / 언급
- **태그**: 핵심 정체성 태그
- **반차**: 기대를 벗어나는 독특한 디테일
- **말투**: 화법 요약
- **성격**: 성격 핵심
- **동기**: 근본 동력
- **현재**: 이번 장 즉각적 목표
- **관계**: 다른캐릭터(관계종류/장#) | ...
- **알고 있는 것**: 이 캐릭터가 아는 것(직접 목격하거나 전해 들은 것만)
- **모르는 것**: 이 캐릭터가 모르는 것

(모든 캐릭터 반복. 새 캐릭터는 새 ## 블록으로 추가, 기존 캐릭터는 증분 갱신.)

## 규칙

1. UPDATED_STATE와 UPDATED_HOOKS는 "현재 추적 파일" 기준 증분 업데이트여야 함.
2. 장의 모든 사실적 변화는 해당 추적 파일에 반드시 반영되어야 함.
3. 자원 변화, 이동, 관계 변화, 정보 변화 어느 것도 빠뜨리지 말 것.
4. 캐릭터 매트릭스의 "알고 있는 것/모르는 것"은 정확해야 함: 각 캐릭터는 직접 목격하거나 전해 들은 것만 압니다.`;
    }

    const numericalBlock = genreProfile.numericalSystem
      ? `\n- 本题材有数值/资源体系，你必须在 UPDATED_LEDGER 中追踪正文中出现的所有资源变动`
      : `\n- 本题材无数值系统，UPDATED_LEDGER 留空`;

    return `你是小说连续性分析师。你的任务是分析一章已完成的小说正文，从中提取所有状态变化并更新追踪文件。

## 工作模式

你不是在写作，而是在分析已有正文。你需要：
1. 仔细阅读正文，提取所有关键信息
2. 基于"当前追踪文件"做增量更新
3. 输出格式与写作模块完全一致

## 分析维度

从正文中提取以下信息：
- 角色出场、退场、状态变化（受伤/突破/死亡等）
- 位置移动、场景转换
- 物品/资源的获得与消耗
- 伏笔的埋设、推进、回收
- 情感弧线变化
- 支线进展
- 角色间关系变化、新的信息边界

## 书籍信息

- 标题：${book.title}
- 题材：${genreProfile.name}（${book.genre}）
- 平台：${book.platform}
${numericalBlock}

## 题材特征

${genreBody}

${bookRulesBody ? `## 本书规则\n\n${bookRulesBody}` : ""}

## 输出格式（必须严格遵循）

使用 === TAG === 分隔各部分，与写作模块完全一致：

=== CHAPTER_TITLE ===
（从正文标题行提取或推断章节标题，只输出标题文字）

=== CHAPTER_CONTENT ===
（原样输出正文内容，不做任何修改）

=== PRE_WRITE_CHECK ===
（留空，分析模式不需要写作自检）

=== POST_SETTLEMENT ===
（留空，分析模式不需要写后结算）

=== UPDATED_STATE ===
更新后的状态卡（Markdown表格），反映本章结束时的最新状态：
| 字段 | 值 |
|------|-----|
| 当前章节 | {章节号} |
| 当前位置 | ... |
| 主角状态 | ... |
| 当前目标 | ... |
| 当前限制 | ... |
| 当前敌我 | ... |
| 当前冲突 | ... |

=== UPDATED_LEDGER ===
（如有数值系统：更新后的完整资源账本表格；无则留空）

=== UPDATED_HOOKS ===
更新后的伏笔池（Markdown表格），包含所有已知伏笔的最新状态：
| hook_id | 起始章节 | 类型 | 状态 | 最近推进 | 预期回收 | 回收节奏 | 备注 |

=== CHAPTER_SUMMARY ===
本章摘要（Markdown表格行）：
| 章节 | 标题 | 出场人物 | 关键事件 | 状态变化 | 伏笔动态 | 情绪基调 | 章节类型 |

=== UPDATED_SUBPLOTS ===
更新后的支线进度板（Markdown表格）

=== UPDATED_EMOTIONAL_ARCS ===
更新后的情感弧线（Markdown表格）

=== UPDATED_CHARACTER_MATRIX ===
更新后的角色矩阵（每个角色一个 ## 块，字段用 bullet list）：

## 角色名
- **定位**: 主角 / 反派 / 盟友 / 配角 / 提及
- **标签**: 核心身份标签
- **反差**: 打破刻板印象的独特细节
- **说话**: 说话风格概述
- **性格**: 性格底色
- **动机**: 根本驱动力
- **当前**: 本章即时目标
- **关系**: 某角色(关系性质/Ch#) | ...
- **已知**: 该角色已知的信息（仅限亲历或被告知）
- **未知**: 该角色不知道的信息

（每个角色重复以上格式。新角色追加新 ## 块，已有角色做增量更新。）

## 关键规则

1. 状态卡和伏笔池必须基于"当前追踪文件"做增量更新，不是从零开始
2. 正文中的每一个事实性变化都必须反映在对应的追踪文件中
3. 不要遗漏细节：数值变化、位置变化、关系变化、信息变化都要记录
4. 角色矩阵中的"已知/未知"要准确——角色只知道他在场时发生的事`;
  }

  private buildUserPrompt(params: {
    readonly language: "zh" | "ko" | "en";
    readonly chapterNumber: number;
    readonly chapterContent: string;
    readonly chapterTitle?: string;
    readonly currentState: string;
    readonly ledger: string;
    readonly hooks: string;
    readonly chapterSummaries: string;
    readonly subplotBoard: string;
    readonly emotionalArcs: string;
    readonly characterMatrix: string;
    readonly hooksBlock: string;
    readonly summariesBlock: string;
    readonly volumeSummariesBlock: string;
    readonly subplotBlock: string;
    readonly emotionalBlock: string;
    readonly matrixBlock: string;
    readonly bibleBlock: string;
    readonly outlineOrControlBlock: string;
  }): string {
    if (params.language === "en") {
      const titleLine = params.chapterTitle
        ? `Chapter Title: ${params.chapterTitle}\n`
        : "";

      const ledgerBlock = params.ledger
        ? `\n## Current Resource Ledger\n${params.ledger}\n`
        : "";

      return `Analyze chapter ${params.chapterNumber} and update all tracking files.
${titleLine}
## Chapter Content

${params.chapterContent}

## Current State
${params.currentState}
${ledgerBlock}
${params.hooksBlock}${params.volumeSummariesBlock}${params.subplotBlock}${params.emotionalBlock}${params.matrixBlock}${params.summariesBlock}${params.outlineOrControlBlock}${params.bibleBlock}

Please return the result strictly in the === TAG === format.`;
    }
    if (params.language === "ko") {
      const titleLine = params.chapterTitle
        ? `장 제목: ${params.chapterTitle}\n`
        : "";

      const ledgerBlock = params.ledger
        ? `\n## 현재 자원 장부\n${params.ledger}\n`
        : "";

      return `${params.chapterNumber}장 본문을 분석해 모든 추적 파일을 업데이트하세요.
${titleLine}
## 장 본문

${params.chapterContent}

## 현재 상태카드
${params.currentState}
${ledgerBlock}
${params.hooksBlock}${params.volumeSummariesBlock}${params.subplotBlock}${params.emotionalBlock}${params.matrixBlock}${params.summariesBlock}${params.outlineOrControlBlock}${params.bibleBlock}

=== TAG === 형식으로 엄격히 결과를 반환하세요.`;
    }

    const titleLine = params.chapterTitle
      ? `章节标题：${params.chapterTitle}\n`
      : "";

    const ledgerBlock = params.ledger
      ? `\n## 当前资源账本\n${params.ledger}\n`
      : "";

    return `请分析第${params.chapterNumber}章正文，更新所有追踪文件。
${titleLine}
## 正文内容

${params.chapterContent}

## 当前状态卡
${params.currentState}
${ledgerBlock}
${params.hooksBlock}${params.volumeSummariesBlock}${params.subplotBlock}${params.emotionalBlock}${params.matrixBlock}${params.summariesBlock}${params.outlineOrControlBlock}${params.bibleBlock}

请严格按照 === TAG === 格式输出分析结果。`;
  }

  private buildReducedControlBlock(
    chapterIntent: string,
    contextPackage: ContextPackage,
    ruleStack: RuleStack,
    language: "zh" | "ko" | "en",
  ): string {
    const selectedContext = contextPackage.selectedContext
      .map((entry) => `- ${entry.source}: ${entry.reason}${entry.excerpt ? ` | ${entry.excerpt}` : ""}`)
      .join("\n");
    const overrides = ruleStack.activeOverrides.length > 0
      ? ruleStack.activeOverrides
        .map((override) => `- ${override.from} -> ${override.to}: ${override.reason} (${override.target})`)
        .join("\n")
      : "- none";

    return language === "en"
      ? `\n## Chapter Control Inputs (compiled by Planner/Composer)
${chapterIntent}

### Selected Context
${selectedContext || "- none"}

### Rule Stack
- Hard guardrails: ${ruleStack.sections.hard.join(", ") || "(none)"}
- Soft constraints: ${ruleStack.sections.soft.join(", ") || "(none)"}
- Diagnostic rules: ${ruleStack.sections.diagnostic.join(", ") || "(none)"}

### Active Overrides
${overrides}\n`
      : `\n## 本章控制输入（由 Planner/Composer 编译）
${chapterIntent}

### 已选上下文
${selectedContext || "- none"}

### 规则栈
- 硬护栏：${ruleStack.sections.hard.join("、") || "(无)"}
- 软约束：${ruleStack.sections.soft.join("、") || "(无)"}
- 诊断规则：${ruleStack.sections.diagnostic.join("、") || "(无)"}

### 当前覆盖
${overrides}\n`;
  }

  private buildMemoryGoal(chapterTitle: string | undefined, chapterContent: string): string {
    return [chapterTitle ?? "", chapterContent]
      .filter((part) => part.trim().length > 0)
      .join("\n\n");
  }

  private findOutlineNode(volumeOutline: string, chapterNumber: number): string | undefined {
    if (!volumeOutline || volumeOutline === this.missingFilePlaceholder("zh") || volumeOutline === this.missingFilePlaceholder("en")) {
      return undefined;
    }

    const lines = volumeOutline.split("\n").map((line) => line.trim()).filter(Boolean);
    const chapterPatterns = [
      new RegExp(`^#+\\s*Chapter\\s*${chapterNumber}\\b`, "i"),
      new RegExp(`^#+\\s*第\\s*${chapterNumber}\\s*章`),
    ];

    const heading = lines.find((line) => chapterPatterns.some((pattern) => pattern.test(line)));
    if (!heading) return undefined;

    const headingIndex = lines.indexOf(heading);
    const nextLine = lines[headingIndex + 1];
    return nextLine && !nextLine.startsWith("#") ? nextLine : heading.replace(/^#+\s*/, "");
  }

  private renderSummarySnapshot(
    summaries: ReadonlyArray<{
      chapter: number;
      title: string;
      characters: string;
      events: string;
      stateChanges: string;
      hookActivity: string;
      mood: string;
      chapterType: string;
    }>,
    language: "zh" | "ko" | "en",
  ): string {
    if (summaries.length === 0) {
      return this.missingFilePlaceholder(language);
    }

    let header: string[];
    if (language === "en") {
      header = [
        "| Chapter | Title | Characters | Key Events | State Changes | Hook Activity | Mood | Chapter Type |",
        "| --- | --- | --- | --- | --- | --- | --- | --- |",
      ];
    } else if (language === "ko") {
      header = [
        "| 장 | 제목 | 출현 인물 | 핵심 사건 | 상태 변화 | 훅 동태 | 감정 기조 | 장 유형 |",
        "| --- | --- | --- | --- | --- | --- | --- | --- |",
      ];
    } else {
      header = [
        "| 章节 | 标题 | 出场人物 | 关键事件 | 状态变化 | 伏笔动态 | 情绪基调 | 章节类型 |",
        "| --- | --- | --- | --- | --- | --- | --- | --- |",
      ];
    }

    const rows = summaries.map((summary) => [
      summary.chapter,
      summary.title,
      summary.characters,
      summary.events,
      summary.stateChanges,
      summary.hookActivity,
      summary.mood,
      summary.chapterType,
    ].map((cell) => this.escapeTableCell(String(cell))).join(" | "));

    return [
      ...header,
      ...rows.map((row) => `| ${row} |`),
    ].join("\n");
  }

  private escapeTableCell(value: string): string {
    return value.replace(/\|/g, "\\|").replace(/\n/g, "<br>");
  }

  private async readFileOrDefault(path: string, language: "zh" | "ko" | "en"): Promise<string> {
    try {
      return await readFile(path, "utf-8");
    } catch {
      return this.missingFilePlaceholder(language);
    }
  }

  private missingFilePlaceholder(language: "zh" | "ko" | "en"): string {
    if (language === "en") return "(file not created yet)";
    if (language === "ko") return "(파일 미생성)";
    return "(文件尚未创建)";
  }

  private defaultChapterTitle(chapterNumber: number, language: "zh" | "ko" | "en"): string {
    if (language === "en") return `Chapter ${chapterNumber}`;
    if (language === "ko") return `제${chapterNumber}장`;
    return `第${chapterNumber}章`;
  }
}
