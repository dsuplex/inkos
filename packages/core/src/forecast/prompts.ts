// Bilingual prompt builders for the narrative forecast agent, organized the
// same way as prompts/short-fiction.ts: each builder switches on language.

export type ForecastLanguage = "zh" | "ko" | "en";

export interface ForecastPromptInput {
  readonly contextMarkdown: string;
  readonly divergence: string;
  readonly branchCount: number;
  readonly horizon: number;
  readonly baseChapter: number;
}

export function buildForecastSystemPrompt(language: ForecastLanguage): string {
  if (language === "ko") {
    return [
      "당신은 장편 소설의 서사 추론 도우미입니다.",
      "작업: 정사 컨텍스트와 작가가 제시한 분기점에서 출발해, 서로 격리된 비-정사 후보 미래 분기를 여러 개 추론해 작가가 병렬로 비교할 수 있게 합니다.",
      "규칙:",
      "- 분기는 서로 배타적입니다: 각 분기는 분기점에 다른 전개를 가정하며, 형제 분기를 참조하거나 의존하지 마세요.",
      "- 분기는 계획 자료이지 본문이 아닙니다: 비트는 '무슨 일이 일어나는가'만 쓰고, 장면 단위의 디테일은 쓰지 마세요.",
      "- 정사를 존중하세요: 모든 추론은 기존 사실, 캐릭터 고정, 세계 규칙과 일치해야 합니다; 필요하다면 반드시 risks에 적으세요.",
      "- JSON 객체 하나만 출력하세요. 설명, 마크다운 제목, 코드 펜스는 금지합니다.",
    ].join("\n");
  }
  if (language === "en") {
    return [
      "You are the narrative forecast assistant for a long-form novel.",
      "Task: starting from the canonical context and the author's divergence point, project several mutually isolated, non-canonical candidate futures for the author to compare.",
      "Rules:",
      "- Branches are mutually exclusive: each assumes a different resolution of the divergence point and must not reference or depend on sibling branches.",
      "- Branches are planning material, not prose: beats describe what happens, not scene-level detail.",
      "- Respect canon: every projection must stay consistent with established facts, character locks, and world rules; any necessary conflict must be listed under risks.",
      "- Output exactly one JSON object. No explanations, no markdown headings, no code fences.",
    ].join("\n");
  }
  return [
    "你是长篇小说的叙事推演助手。",
    "任务：从正史上下文和作者给出的分歧点出发，推演多个相互隔离的非正史候选未来分支，供作者并排比较。",
    "规则：",
    "- 分支之间互斥：每个分支对分歧点做出不同走向的假设，不得引用或依赖其他分支。",
    "- 分支是规划材料，不是正文：节拍只写“发生了什么”，不写场景级细节。",
    "- 尊重正史：所有推演必须与既有事实、人设锁和世界规则一致；确需冲突时必须写进 risks。",
    "- 只输出一个 JSON 对象，不要输出解释、markdown 标题或代码围栏。",
  ].join("\n");
}

export function buildForecastUserPrompt(input: ForecastPromptInput, language: ForecastLanguage): string {
  const firstChapter = input.baseChapter + 1;
  if (language === "en") {
    return [
      input.contextMarkdown,
      "",
      "## Divergence point",
      "",
      input.divergence,
      "",
      "## Output requirements",
      "",
      `Produce exactly ${input.branchCount} candidate branches. Each branch covers roughly ${input.horizon} future chapters starting at chapter ${firstChapter}.`,
      "Return JSON with exactly this shape (field names must match):",
      forecastJsonShape(firstChapter, "en"),
    ].join("\n");
  }
  if (language === "ko") {
    return [
      input.contextMarkdown,
      "",
      "## 분기점",
      "",
      input.divergence,
      "",
      "## 출력 요구사항",
      "",
      `정확히 ${input.branchCount}개의 후보 분기를 생성하세요. 각 분기는 제${firstChapter}장부터 시작해 약 ${input.horizon}장 분량의 미래 전개를 다룹니다.`,
      "다음 형태의 JSON을 출력하세요 (필드명 정확히 일치):",
      forecastJsonShape(firstChapter, "ko"),
    ].join("\n");
  }
  return [
    input.contextMarkdown,
    "",
    "## 分歧点",
    "",
    input.divergence,
    "",
    "## 输出要求",
    "",
    `生成恰好 ${input.branchCount} 个候选分支。每个分支覆盖从第 ${firstChapter} 章开始、约 ${input.horizon} 章的未来走向。`,
    "输出 JSON，结构如下（字段名必须完全一致）：",
    forecastJsonShape(firstChapter, "zh"),
  ].join("\n");
}

export function buildForecastRepairPrompt(validationError: string, language: ForecastLanguage): string {
  if (language === "en") {
    return [
      `Your previous output failed validation: ${validationError}`,
      "Re-output the complete JSON object only, fixing the problem above. No explanations, no code fences.",
    ].join("\n");
  }
  if (language === "ko") {
    return [
      `이전 출력이 검증을 통과하지 못했습니다: ${validationError}`,
      "위 문제를 수정한 뒤 완전한 JSON 객체만 다시 출력하세요. 설명, 코드 펜스 금지.",
    ].join("\n");
  }
  return [
    `你上一次的输出未通过校验：${validationError}`,
    "请修正上述问题后重新输出完整 JSON 对象，只输出 JSON，不要解释，不要代码围栏。",
  ].join("\n");
}

function forecastJsonShape(firstChapter: number, language: ForecastLanguage): string {
  if (language === "en") {
    return [
      "{",
      '  "branches": [',
      "    {",
      '      "title": "short branch title",',
      '      "premise": "the assumption this branch makes about the divergence point",',
      `      "beats": [{ "chapter": integer chapter number starting at ${firstChapter}, "summary": "what happens in that chapter" }],`,
      '      "characterDecisions": [{ "character": "name", "decision": "the key decision this character makes" }],',
      '      "projectedChanges": {',
      '        "characters": ["projected character state changes"],',
      '        "relationships": ["projected relationship changes"],',
      '        "world": ["projected world/faction changes"],',
      '        "hooks": ["which hooks advance, fire, or break"]',
      "      },",
      '      "risks": [{ "kind": "continuity|causality|character", "description": "consistency risk" }],',
      '      "uncertainties": ["open uncertainties"],',
      '      "intentAlignment": { "score": integer 0-100, "rationale": "how well this matches the author intent and current focus" }',
      "    }",
      "  ]",
      "}",
    ].join("\n");
  }
  if (language === "ko") {
    return [
      "{",
      '  "branches": [',
      "    {",
      '      "title": "분기 짧은 제목",',
      '      "premise": "이 분기가 분기점에 대해 가정하는 전제",',
      `      "beats": [{ "chapter": ${firstChapter}부터 시작하는 정수 장 번호, "summary": "해당 장에서 일어나는 일" }],`,
      '      "characterDecisions": [{ "character": "인물명", "decision": "이 인물이 내리는 핵심 결정" }],',
      '      "projectedChanges": {',
      '        "characters": ["인물 상태 예상 변화"],',
      '        "relationships": ["관계 예상 변화"],',
      '        "world": ["세계/세력 예상 변화"],',
      '        "hooks": ["어떤 훅이 추진·발화·파괴되는가"]',
      "      },",
      '      "risks": [{ "kind": "continuity|causality|character", "description": "일관성 위험" }],',
      '      "uncertainties": ["불확실 요소"],',
      '      "intentAlignment": { "score": 0에서 100 사이 정수, "rationale": "작가 의도와 현재 초점과의 부합도 설명" }',
      "    }",
      "  ]",
      "}",
    ].join("\n");
  }
  return [
    "{",
    '  "branches": [',
    "    {",
    '      "title": "分支短标题",',
    '      "premise": "该分支对分歧点做出的前提与假设",',
    `      "beats": [{ "chapter": 从 ${firstChapter} 开始的整数章号, "summary": "该章发生什么" }],`,
    '      "characterDecisions": [{ "character": "人物名", "decision": "该人物做出的关键决策" }],',
    '      "projectedChanges": {',
    '        "characters": ["人物状态预计变化"],',
    '        "relationships": ["关系预计变化"],',
    '        "world": ["世界/势力预计变化"],',
    '        "hooks": ["哪些伏笔被推进、引爆或破坏"]',
    "      },",
    '      "risks": [{ "kind": "continuity|causality|character", "description": "一致性风险" }],',
    '      "uncertainties": ["不确定因素"],',
    '      "intentAlignment": { "score": 0到100的整数, "rationale": "与作者意图和当前聚焦的匹配说明" }',
    "    }",
    "  ]",
    "}",
  ].join("\n");
}
