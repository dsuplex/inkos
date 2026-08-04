export type ShortFictionLanguage = "zh" | "ko" | "en";

export interface ShortFictionReferencePromptInput {
  readonly text?: string;
}

export interface ShortFictionOutlinePromptInput {
  readonly direction: string;
  readonly chapterCount: number;
  readonly charsPerChapter: number;
  readonly reference?: ShortFictionReferencePromptInput;
}

export interface ShortFictionOutlineReviewPromptInput {
  readonly direction: string;
  readonly outline: {
    readonly rawContent: string;
  };
  readonly reference?: ShortFictionReferencePromptInput;
}

export interface ShortFictionOutlineRevisionPromptInput extends ShortFictionOutlineReviewPromptInput {
  readonly review: string;
  readonly chapterCount: number;
  readonly charsPerChapter: number;
}

export interface ShortFictionDraftPromptInput {
  readonly direction: string;
  readonly outlineMarkdown: string;
  readonly chapterCount: number;
  readonly charsPerChapter: number;
}

export interface ShortFictionDraftContinuationPromptInput extends ShortFictionDraftPromptInput {
  readonly existingDraftMarkdown: string;
  readonly missingChapters: readonly number[];
}

export interface ShortFictionDraftReviewPromptInput extends ShortFictionDraftPromptInput {
  readonly draftMarkdown: string;
}

export interface ShortFictionDraftRevisionPromptInput extends ShortFictionDraftPromptInput {
  readonly review: string;
}

export interface ShortFictionPackagePromptInput {
  readonly direction: string;
  readonly outlineMarkdown: string;
  readonly draftMarkdown: string;
  readonly draftTitle: string;
}

export function buildShortFictionOutlineSystemPrompt(language: ShortFictionLanguage = "zh"): string {
  if (language === "en") {
    return [
      "You are the managing editor for short web fiction. Your job is to turn one creative direction into a complete short-story plan.",
      "Work only from this direction and any reference text the user supplied; never claim to have read, quoted, or inherited material that was not provided.",
      "Content comes first: the title, the opening, the pressure on the protagonist, the evidence/relationship/identity leverage, the escalation chain, the reversal chain, and the payoff landing must be strong enough to carry a single-pass full draft.",
      "Do not over-structure and do not output JSON/YAML. Write human-readable Markdown, but the chapter plan must be dense enough that a writer can draft the whole story in one pass.",
      "A short defaults to 12-18 chapters at roughly 600-800 words per chapter. The story must be complete — not the first five chapters of a novel starter kit.",
    ].join("\n");
  }
  if (language === "ko") {
    return [
      "당신은 단편소설 수석 편집자로, 하나의 창작 방향을 완전한 단편 이야기 기획으로 만드는 일을 맡습니다.",
      "이번 창작 방향과 사용자가 제공한 참고 텍스트만 바탕으로 작업합니다. 제공되지 않은 자료를 읽었거나 인용하거나 이어받았다고 주장하지 마세요.",
      "목표는 콘텐츠 우선입니다. 제목, 도입, 인물의 압박, 증거/관계/정체 레버리지, 고조 체인, 반전 체인, 보상 지점이 한 번에 전체를 완성하는 초안을 버틸 만큼 강해야 합니다.",
      "과도하게 구조화하지 말고 JSON/YAML을 출력하지 마세요. 사람이 읽을 수 있는 Markdown으로 쓰되, 장별 계획은 필자가 한 번에 전부 쓸 수 있을 만큼 조밀해야 합니다.",
      "단편은 기본 12-18장, 장당 약 900-1200자입니다. 이야기는 완결되어야 하며, 장편 전반 5장 스타터 킷이어서는 안 됩니다.",
    ].join("\n");
  }
  return [
    "你是短篇小说总编，负责把一个创作方向做成完整短篇故事方案。",
    "只基于本次创作方向和用户提供的参考文本创作；没有提供的资料，不要声称读过、引用过或继承过。",
    "目标是内容优先：标题、开篇、人物压力、证据/关系/身份杠杆、升级链、反转链和回报落点必须能支撑一次写完整篇。",
    "不要过度结构化，不要输出 JSON/YAML。用人能读的 Markdown，但章节方案必须足够密，写手拿到后能直接一次写完。",
    "短篇默认 12-18 章，每章约 900-1200 字。故事要完整，不是长篇前 5 章启动包。",
  ].join("\n");
}

export function buildShortFictionOutlineUserPrompt(
  input: ShortFictionOutlinePromptInput,
  language: ShortFictionLanguage = "zh",
): string {
  if (language === "en") {
    return [
      "## Creative Direction",
      input.direction,
      "",
      "## Target Spec",
      `A complete short story of ${input.chapterCount} chapters, about ${input.charsPerChapter} words per chapter.`,
      "",
      input.reference?.text ? "## Optional Reference Text\n" + input.reference.text.trim() + "\n" : "",
      "## Deliverable",
      "Start with one platform-ready clickable title, then the full story plan. The plan must make clear why the protagonist is pinned down, what payoff the reader is waiting for, how the protagonist turns the tables, how evidence/relationships/identity/rules escalate step by step, why the antagonist strikes back, and how the ending lands.",
      "The chapter plan must spell out, chapter by chapter: the direction of the chapter title, the key on-page scene, the characters' actions, the escalation or payoff, and the reason to keep reading at the chapter break.",
      "Tags are allowed, but do not enumerate a tag table; tags serve premise selection and writing — they never replace the story.",
      "",
      "## Output Format",
      "=== SHORT_FICTION_PLAN_TITLE ===",
      "Exactly one platform-ready title on a single line",
      "=== SHORT_FICTION_PLAN ===",
      "The full story plan in Markdown, covering: genre/audience, title direction, the opening hook, characters and relationships, the core pressure, how the protagonist wins, the escalation chain, the reversal chain, the ending payoff, and the chapter-by-chapter plan.",
    ].filter(Boolean).join("\n");
  }
if (language === "ko") {
    return [
      "## 창작 방향",
      input.direction,
      "",
      "## 목표 스펙",
      `완전한 단편 ${input.chapterCount}장, 장당 약 ${input.charsPerChapter}자.`,
      "",
      input.reference?.text ? "## 선택 참고 텍스트\n" + input.reference.text.trim() + "\n" : "",
      "## 산출 요건",
      "먼저 플랫폼 감각이 있는 제목을 하나 주고, 완전한 이야기 기획을 주세요. 기획은 주인공이 왜 옥죄이는지, 독자가 어떤 보상을 기다리는지, 주인공이 어떻게 반격하는지, 증거/관계/정체/규칙이 어떻게 단계적으로 고조되는지, 반동인물이 왜 되받아치는지, 결말이 어떻게 떨어지는지 명확히 해야 합니다.",
      "장별 기획은 각 장의 제목 방향, 그 장에서 벌어지는 핵심 장면, 캐릭터의 행동, 압박 고조 또는 보상, 장이 끝날 때 계속 읽고 싶게 만드는 이유를 반드시 밝혀야 합니다.",
      "태그를 붙일 수는 있지만 태그 목록을 늘어놓지 마세요. 태그는 소재 선정과 집필을 돕는 것이지 이야기를 대체하지 않습니다.",
      "",
      "## 출력 형식",
      "=== SHORT_FICTION_PLAN_TITLE ===",
      "플랫폼 감각이 있는 제목을 한 줄만",
      "=== SHORT_FICTION_PLAN ===",
      "Markdown으로 완전한 이야기 기획을 쓰세요. 소재/독자층, 제목 방향, 도입 훅, 인물과 관계, 핵심 압박, 주인공의 승리법, 고조 체인, 반전 체인, 결말 보상, 장별 기획을 포함합니다.",
    ].filter(Boolean).join("\n");
  }
  return [
    "## 创作方向",
    input.direction,
    "",
    "## 目标规格",
    `完整短篇 ${input.chapterCount} 章，每章约 ${input.charsPerChapter} 字。`,
    "",
    input.reference?.text ? "## 可选参考文本\n" + input.reference.text.trim() + "\n" : "",
    "## 产出要求",
    "先给一个平台感标题，再给完整故事方案。大纲要讲清楚主角为什么被压住、读者想看什么回报、主角靠什么翻盘、证据/关系/身份/规则如何递进、反派为什么会反扑、结尾如何落地。",
    "章节方案必须逐章写清：章节标题方向、当章发生的关键场面、角色动作、压力升级或回报、章尾继续读的理由。",
    "可以给标签，但不要穷举标签表；标签服务选题和写作，不替代故事。",
    "",
    "## 输出格式",
    "=== SHORT_FICTION_PLAN_TITLE ===",
    "只写一行平台感标题",
    "=== SHORT_FICTION_PLAN ===",
    "用 Markdown 写完整故事方案，包含：题材/受众、标题方向、开篇小钩子、人物与关系、核心压力、主角赢法、升级链、反转链、结尾回报、逐章方案。",
  ].filter(Boolean).join("\n");
}

export function buildShortFictionOutlineReviewSystemPrompt(language: ShortFictionLanguage = "zh"): string {
  if (language === "en") {
    return [
      "You are a short-fiction outline reviewer. You do not assign scores and you do not police plagiarism.",
      "Your job is to judge whether this story plan can carry a single-pass full draft: is the genre engine clear, do character motivations hold, does the pressure chain escalate, is the antagonist's counterattack believable, is the ending payoff big enough.",
      "Review like a real reader and a real editor, not a checklist machine.",
      "Output Markdown. Name the flaws that would make the finished draft fall flat, and the strengths worth keeping.",
    ].join("\n");
  }
if (language === "ko") {
    return [
      "당신은 단편소설 기획 심사 편집자입니다. 점수를 매기지도 않고 표절 여부를 판단하지도 않습니다.",
      "당신의 임무는 이 이야기 기획이 한 번에 전체 초안을 쓸 만큼 버티는지 판단하는 것입니다. 소재 엔진이 명확한지, 인물 동기가 성립하는지, 압박 체인이 고조되는지, 반동인물의 반격이 신뢰할 만한지, 결말 보상이 충분한지.",
      "체크리스트 기계가 아니라 진짜 독자이자 편집자처럼 심사하세요.",
      "Markdown으로 출력하세요. 완성된 초안이 처질 만한 결함과 꼭 살려야 할 장점을 직접 짚으세요.",
    ].join("\n");
  }
  return [
    "你是短篇审纲编辑。你不负责打分，也不负责判抄。",
    "你的任务是判断这个故事方案能不能支撑一次写完整篇：题材发动机是否清楚、人物动机是否成立、压力链是否递进、反派反扑是否可信、结尾回报是否够。",
    "审稿要像真实读者和编辑，不要只列工程检查项。",
    "输出 Markdown，直接指出会导致成稿不好看的硬伤和可保留优点。",
  ].join("\n");
}

export function buildShortFictionOutlineReviewUserPrompt(
  input: ShortFictionOutlineReviewPromptInput,
  language: ShortFictionLanguage = "zh",
): string {
  if (language === "en") {
    return [
      "## Creative Direction",
      input.direction,
      "",
      input.reference?.text ? "## Optional Reference Text\n" + input.reference.text.trim() + "\n" : "",
      "## Story Plan Under Review",
      input.outline.rawContent,
      "",
      "## Review Focus",
      "- Is this a complete short story, rather than a partial tryout plan?",
      "- Do the title, the opening, and the first three chapters give readers a reason to click and keep reading?",
      "- Is the outline dense enough, or will the writer run out of material in the back half?",
      "- Do the key scenes contain character action, counterattack, and payoff, instead of bare result summaries?",
      "- Will readers be thrown out of the story by timeline, relationship, evidence-access, physical-state, or common-sense problems?",
    ].filter(Boolean).join("\n");
  }
  if (language === "ko") {
    return [
      "## 창작 방향",
      input.direction,
      "",
      input.reference?.text ? "## 선택 참고 텍스트\n" + input.reference.text.trim() + "\n" : "",
      "## 심사 대상 이야기 기획",
      input.outline.rawContent,
      "",
      "## 심사 중점",
      "- 이게 완전한 단편 이야기인지, 아니면 부분 시험 기획인지.",
      "- 제목, 도입, 처음 세 장이 독자에게 클릭하고 계속 읽을 이유를 주는지.",
      "- 기획이 충분히 조밀한지, 아니면 필자가 후반부에 탈진할지.",
      "- 핵심 장면들에 캐릭터의 행동, 반격, 보상이 있는지, 아니면 단순 결과 요약인지.",
      "- 독자가 시간선, 관계, 증거 접근권, 신체 상태, 상식 문제로 이야기에서 튕겨 나가지는 않는지.",
    ].join("\n");
  }
  return [
    "## 创作方向",
    input.direction,
    "",
    input.reference?.text ? "## 可选参考文本\n" + input.reference.text.trim() + "\n" : "",
    "## 待审故事方案",
    input.outline.rawContent,
    "",
    "## 审查重点",
    "- 这是不是完整短篇故事，而不是局部试写方案。",
    "- 标题、开篇、前三章是否有点击和追读理由。",
    "- 大纲是否足够密，写手是否会在后半段泄气。",
    "- 关键场面有没有人物行动、反扑和回报，不是纯结果摘要。",
    "- 读者会不会因为时间线、人物关系、证据权限、身体状态、常识问题出戏。",
  ].join("\n");
}

export function buildShortFictionOutlineRevisionFollowup(
  input: ShortFictionOutlineRevisionPromptInput,
  language: ShortFictionLanguage = "zh",
): string {
  if (language === "en") {
    return [
      "Based on the outline review above, produce the complete second version of the story plan.",
      "This is round two of the same project: do not start over from scratch, and do not output a list of edits instead of the plan.",
      `Keep the structure at ${input.chapterCount} chapters of about ${input.charsPerChapter} words each.`,
      "Keep the genre engine and relationships that work; fix the flaws that would make the finished draft fall flat.",
      "",
      "## Outline Review",
      input.review.trim(),
      "",
      "## Output Format",
      "=== SHORT_FICTION_PLAN_TITLE ===",
      "Exactly one platform-ready title on a single line",
      "=== SHORT_FICTION_PLAN ===",
      "The complete second-version story plan in Markdown.",
    ].join("\n");
  }
  if (language === "ko") {
    return [
      "위의 기획 심사 의견을 바탕으로 완전한 두 번째 버전 이야기 기획을 내놓으세요.",
      "같은 창작의 2차 시도입니다. 처음부터 다시 만들지 말고, 수정 사항 목록만 출력하지도 마세요.",
      `여전히 ${input.chapterCount}장, 장당 약 ${input.charsPerChapter}자로 구성하세요.`,
      "통하는 소재 엔진과 인물 관계는 유지하고, 완성된 초안을 처지게 할 결함은 고치세요.",
      "",
      "## 기획 심사 의견",
      input.review.trim(),
      "",
      "## 출력 형식",
      "=== SHORT_FICTION_PLAN_TITLE ===",
      "플랫폼 감각이 있는 제목을 한 줄만",
      "=== SHORT_FICTION_PLAN ===",
      "Markdown으로 완전한 두 번째 버전 이야기 기획을 쓰세요.",
    ].join("\n");
  }
  return [
    "根据上面的审纲意见，继续给出第二版完整故事方案。",
    "这是同一次创作的第二轮，不要另起炉灶，不要只写修改说明。",
    `仍然按 ${input.chapterCount} 章、每章约 ${input.charsPerChapter} 字来组织。`,
    "保留能打的题材发动机和人物关系，修掉会导致成稿不好看的硬伤。",
    "",
    "## 审纲意见",
    input.review.trim(),
    "",
    "## 输出格式",
    "=== SHORT_FICTION_PLAN_TITLE ===",
    "只写一行平台感标题",
    "=== SHORT_FICTION_PLAN ===",
    "用 Markdown 写完整第二版故事方案。",
  ].join("\n");
}

export function buildShortFictionWriterSystemPrompt(language: ShortFictionLanguage = "zh"): string {
  if (language === "en") {
    return [
      "You are an English short-fiction BatchWriter. You write the complete short story in one API pass, following the story plan.",
      "Write natural, native English prose. Vary sentence length; mix short punchy sentences with longer flowing ones, and keep the narrative voice consistent throughout.",
      "This is not serialized-novel continuation and not chapter synopsis. Every chapter needs drama happening on the page: character action, dialogue or reaction, a shift in the situation, and a reason to keep reading at the chapter break.",
      "Keep the drama dialed up, web-fiction style: real-world pressure may be amplified as far as readers will still believe, but never so absurd that immersion breaks.",
      "The story title and chapter titles must read like platform content, not literary summaries. Keep the prose paced for mobile reading — short paragraphs, but never telegram-style fragments.",
      "The word count is a calibration, not an averaging exercise. Big scenes may run long and transitions short; a clearly short chapter usually means you wrote a synopsis and must add real scenes.",
      "Output must strictly use the specified blocks. No author notes, no word-count remarks, no review comments, no format explanations.",
    ].join("\n");
  }
  if (language === "ko") {
    return [
      "당신은 한국어 단편소설 BatchWriter입니다. 이야기 기획에 따라 한 번의 API 호출로 완전한 단편 본문을 씁니다.",
      "이것은 장편 연재 이어쓰기도 아니고 장 요약도 아닙니다. 모든 장에는 그 자리에서 벌어지는 드라마가 있어야 합니다. 인물의 행동, 대화나 반응, 상황 변화, 장이 끝날 때 계속 읽고 싶은 이유.",
      "웹소설식 드라마 강도를 유지하세요. 현실의 압박은 독자가 믿을 만한 한도까지 키울 수 있지만, 몰입을 깨뜨릴 정도로 어이가 없으면 안 됩니다.",
      "제목과 장 제목은 플랫폼 콘텐츠처럼 읽혀야 하며, 문학적 요약이 되어서는 안 됩니다. 본문은 모바일 리딩에 맞는 속도로 쓰세요. 단락은 짧게 하되 전보체 단편은 쓰지 마세요.",
      "글자 수는 보정 기준이지 평균 맞추기용이 아닙니다. 큰 장면은 조금 길어도 되고, 전환 장면은 짧아도 됩니다. 확실히 짧은 장은 보통 요약을 썼다는 뜻이니 실제 장면을 채워야 합니다.",
      "출력은 반드시 지정된 블록만 사용하세요. 작가 메모, 글자 수 언급, 심사 의견, 형식 설명을 쓰지 마세요.",
    ].join("\n");
  }
  return [
    "你是中文短篇 BatchWriter。你要根据故事方案一次 API 写完整短篇正文。",
    "这不是长篇连载续写，也不是章节梗概。每章都要有当场发生的戏：人物行动、对话或反应、局面变化、章尾继续读的理由。",
    "网文戏剧性要足：现实压力可以放大到读者愿意信的程度，但不能荒诞到失去代入。",
    "标题和章节标题要像平台内容，不要文艺化总结。正文保持移动端节奏，段落短但不要写成电报体。",
    "字数是校准，不是平均数学题。大场面可略长，过渡章可略短；明显偏短通常说明写成了梗概，必须补有效场面。",
    "输出必须严格使用指定 block，不要写作者说明、字数说明、审稿意见或格式解释。",
  ].join("\n");
}

export function buildShortFictionWriterUserPrompt(
  input: ShortFictionDraftPromptInput,
  language: ShortFictionLanguage = "zh",
): string {
  if (language === "en") {
    return [
      "## Task",
      `Write the complete ${input.chapterCount}-chapter story in one pass, about ${input.charsPerChapter} words per chapter.`,
      "Read the full story plan before writing. The prose must carry the plan's pressure chain, evidence chain, reversal chain, and emotional payoff — do not swerve into a different story midway.",
      "",
      buildShortFictionCraftPrompt("en"),
      "",
      "## Creative Direction",
      input.direction,
      "",
      "## Story Plan",
      input.outlineMarkdown,
      "",
      "## Output Format",
      "=== SHORT_FICTION_TITLE ===",
      "The story title — plain text, platform-ready, nothing else",
      "=== SHORT_FICTION_OPENING_HOOK ===",
      "An optional pre-story hook of about 130 words; if no standalone teaser is needed, still write the small first-screen scene that opens chapter 1",
      ...Array.from({ length: input.chapterCount }, (_, index) => {
        const chapter = index + 1;
        return [
          `=== CHAPTER ${chapter} TITLE ===`,
          "Chapter title — plain text only, no #, no \"Chapter N\" prefix",
          `=== CHAPTER ${chapter} CONTENT ===`,
          `Chapter ${chapter} prose — full scenes, no synopsis, no author notes`,
        ].join("\n");
      }),
    ].join("\n");
  }
if (language === "ko") {
    return [
      "## 작업",
      `완전한 ${input.chapterCount}장을 한 번에 쓰세요. 장당 약 ${input.charsPerChapter}자.`,
      "글을 쓰기 전에 전체 이야기 기획을 끝까지 읽으세요. 본문은 기획의 압박 체인, 증거 체인, 반전 체인, 감정적 보상을 이어받아야 하며, 중간에 엉뚱한 이야기로 빠져서는 안 됩니다.",
      "",
      buildShortFictionCraftPrompt("ko"),
      "",
      "## 창작 방향",
      input.direction,
      "",
      "## 이야기 기획",
      input.outlineMarkdown,
      "",
      "## 출력 형식",
      "=== SHORT_FICTION_TITLE ===",
      "단편 제목. 순수 텍스트로 플랫폼에 어울리게, 다른 것은 쓰지 않기",
      "=== SHORT_FICTION_OPENING_HOOK ===",
      "선택 사항인 이야기 전 훅으로 약 200자; 독립적인 티저가 필요 없다면 1장 첫 화면의 입장 장면을 써라",
      ...Array.from({ length: input.chapterCount }, (_, index) => {
        const chapter = index + 1;
        return [
          `=== CHAPTER ${chapter} TITLE ===`,
          "장 제목. 순수 텍스트만, # 없이, '제N장' 접두어 없이",
          `=== CHAPTER ${chapter} CONTENT ===`,
          `${chapter}장 본문. 완전한 장면을 쓰고, 요약이나 작가 메모를 쓰지 마세요`,
        ].join("\n");
      }),
    ].join("\n");
  }
  return [
    "## 任务",
    `一次写完整 ${input.chapterCount} 章，每章约 ${input.charsPerChapter} 字。`,
    "先读完整故事方案，再写正文。正文要承接大纲的压力链、证据链、反转链和情绪回报，不要临时改成另一种故事。",
    "",
    buildShortFictionCraftPrompt(),
    "",
    "## 创作方向",
    input.direction,
    "",
    "## 故事方案",
    input.outlineMarkdown,
    "",
    "## 输出格式",
    "=== SHORT_FICTION_TITLE ===",
    "短篇标题，只写纯文本平台标题",
    "=== SHORT_FICTION_OPENING_HOOK ===",
    "可选正文前小钩子，约 200 字；如果不需要独立引子，也要写第 1 章第一屏的入局小场面",
    ...Array.from({ length: input.chapterCount }, (_, index) => {
      const chapter = index + 1;
      return [
        `=== CHAPTER ${chapter} TITLE ===`,
        "章节标题，只写纯文本，不要 #，不要第几章前缀",
        `=== CHAPTER ${chapter} CONTENT ===`,
        `第${chapter}章正文，写完整场面，不要梗概，不要作者备注`,
      ].join("\n");
    }),
  ].join("\n");
}

export function buildShortFictionDraftContinuationUserPrompt(
  input: ShortFictionDraftContinuationPromptInput,
  language: ShortFictionLanguage = "zh",
): string {
  const missing = input.missingChapters.join(", ");
  if (language === "en") {
    return [
      "## Task",
      `The previous draft was truncated or skipped chapters. Write ONLY the missing chapters: ${missing}.`,
      `Stay calibrated to the complete ${input.chapterCount}-chapter short at about ${input.charsPerChapter} words per chapter.`,
      "Do not rewrite finished chapters, do not write summary notes, do not apologize, do not output review comments.",
      "",
      buildShortFictionCraftPrompt("en"),
      "",
      "## Creative Direction",
      input.direction,
      "",
      "## Story Plan",
      input.outlineMarkdown,
      "",
      "## Existing Draft (for continuity only — do not rewrite)",
      input.existingDraftMarkdown,
      "",
      "## Output Format",
      ...input.missingChapters.map((chapter) => [
        `=== CHAPTER ${chapter} TITLE ===`,
        "Chapter title — plain text only, no #, no \"Chapter N\" prefix",
        `=== CHAPTER ${chapter} CONTENT ===`,
        `Chapter ${chapter} prose — full scenes, no synopsis, no author notes`,
      ].join("\n")),
    ].join("\n");
  }
if (language === "ko") {
    return [
      "## 작업",
      `이전 초안이 잘리거나 장이 누락되었습니다. 누락된 장만 보충하세요: ${missing}.`,
      `여전히 완전한 단편 ${input.chapterCount}장, 장당 약 ${input.charsPerChapter}자로 맞추세요.`,
      "완성된 장을 다시 쓰지 말고, 요약 메모를 쓰지 말고, 사과하지 말고, 심사 의견을 출력하지 마세요.",
      "",
      buildShortFictionCraftPrompt("ko"),
      "",
      "## 창작 방향",
      input.direction,
      "",
      "## 이야기 기획",
      input.outlineMarkdown,
      "",
      "## 기존 초안 (이어가기용으로만, 다시 쓰지 말 것)",
      input.existingDraftMarkdown,
      "",
      "## 출력 형식",
      ...input.missingChapters.map((chapter) => [
        `=== CHAPTER ${chapter} TITLE ===`,
        "장 제목. 순수 텍스트만, # 없이, '제N장' 접두어 없이",
        `=== CHAPTER ${chapter} CONTENT ===`,
        `${chapter}장 본문. 완전한 장면을 쓰고, 요약이나 작가 메모를 쓰지 마세요`,
      ].join("\n")),
    ].join("\n");
  }
  return [
    "## 任务",
    `上一次正文被截断或漏章。现在只补写缺失章节：${missing}。`,
    `仍然按完整短篇 ${input.chapterCount} 章、每章约 ${input.charsPerChapter} 字校准。`,
    "不要重写已完成章节，不要写总结说明，不要道歉，不要输出审稿意见。",
    "",
    buildShortFictionCraftPrompt(),
    "",
    "## 创作方向",
    input.direction,
    "",
    "## 故事方案",
    input.outlineMarkdown,
    "",
    "## 已有正文（只用于承接，不要重写）",
    input.existingDraftMarkdown,
    "",
    "## 输出格式",
    ...input.missingChapters.map((chapter) => [
      `=== CHAPTER ${chapter} TITLE ===`,
      "章节标题，只写纯文本，不要 #，不要第几章前缀",
      `=== CHAPTER ${chapter} CONTENT ===`,
      `第${chapter}章正文，写完整场面，不要梗概，不要作者备注`,
    ].join("\n")),
  ].join("\n");
}

export function buildShortFictionDraftReviewSystemPrompt(language: ShortFictionLanguage = "zh"): string {
  if (language === "en") {
    return [
      "You are a short-fiction draft reviewer.",
      "You judge only whether the content can sell, reads smoothly, and keeps pulling the reader forward; do not turn the review into deterministic scoring.",
      "Focus on: the title, chapter titles, the opening, character motivation, the timeline, relationships, evidence and access, escalating pressure, the antagonist's counterattack, whether the back half sags, and whether the ending payoff lands.",
      "Output Markdown. Separate the problems that would visibly stop readers from reading on from the small blemishes that are acceptable.",
    ].join("\n");
  }
  if (language === "ko") {
    return [
      "당신은 단편소설 완성 초안 심사 편집자입니다.",
      "당신은 콘텐츠가 팔릴 수 있는지, 매끄럽게 읽히는지, 독자를 끌고 가는지 여부만 판단합니다. 심사를 결정적 스코어링으로 만들지 마세요.",
      "제목, 장 제목, 도입, 인물 동기, 시간선, 관계, 증거와 접근권, 고조되는 압박, 반동인물의 반격, 후반부가 처지는지, 결말 보상이 제대로 들어맞는지에 집중하세요.",
      "Markdown으로 출력하세요. 독자가 확실히 더 읽기를 멈추게 할 문제와, 감수할 만한 사소한 흠을 구분해서 쓰세요.",
    ].join("\n");
  }
  return [
    "你是短篇成稿审稿编辑。",
    "你只看内容是否能卖、是否顺、是否有继续读的欲望；不要把审稿变成确定性打分。",
    "重点看标题、章节标题、开篇、人物动机、时间线、人物关系、证据/权限、压力递进、反派反扑、后半段是否泄气、结尾回报是否落地。",
    "输出 Markdown，写清哪些问题会明显影响读者读下去，哪些只是可接受的小瑕疵。",
  ].join("\n");
}

export function buildShortFictionDraftReviewUserPrompt(
  input: ShortFictionDraftReviewPromptInput,
  language: ShortFictionLanguage = "zh",
): string {
  if (language === "en") {
    return [
      "## Creative Direction",
      input.direction,
      "",
      "## Original Story Plan",
      input.outlineMarkdown,
      "",
      "## Draft Under Review",
      input.draftMarkdown,
      "",
      "## Review Instructions",
      "Talk like a person: where does this story pull, where does it break immersion, where does it read like a synopsis, where does the back half sag, which title or chapter titles would nobody tap?",
      "Never condemn a chapter just for running slightly short or long; judge first whether the content is complete, dramatic, and paying off.",
    ].join("\n");
  }
  if (language === "ko") {
    return [
      "## 창작 방향",
      input.direction,
      "",
      "## 원래 이야기 기획",
      input.outlineMarkdown,
      "",
      "## 심사 대상 초안",
      input.draftMarkdown,
      "",
      "## 심사 지침",
      "사람처럼 말하세요. 이 이야기가 어디서 끌리는지, 어디서 몰입이 깨지는지, 어디가 요약처럼 읽히는지, 후반부가 어디서 처지는지, 어느 제목이나 장 제목을 아무도 누르지 않을지에 대해.",
      "장이 살짝 짧거나 길다는 이유만으로 단죄하지 마세요. 먼저 콘텐츠가 완결되고 드라마틱하며 보상이 되는지 판단하세요.",
    ].join("\n");
  }
  return [
    "## 创作方向",
    input.direction,
    "",
    "## 原故事方案",
    input.outlineMarkdown,
    "",
    "## 待审正文",
    input.draftMarkdown,
    "",
    "## 审稿要求",
    "直接说人话：这本读起来哪里有欲望、哪里出戏、哪里像梗概、哪里后半段泄气、哪里标题或章节标题不想点。",
    "不要因为某章略短或略长就判死；先判断内容是否完整、有戏、有回报。",
  ].join("\n");
}

export function buildShortFictionDraftRevisionFollowup(
  input: ShortFictionDraftRevisionPromptInput,
  language: ShortFictionLanguage = "zh",
): string {
  if (language === "en") {
    return [
      "Based on the review notes, write the complete second-version draft.",
      "This is round two of the same story: keep what worked in the last version, fix what breaks immersion or kills the desire to keep reading.",
      "Do not output a list of suggested edits, and do not patch just a few chapters — output the complete draft.",
      "",
      "## Review Notes",
      input.review.trim(),
      "",
      "## Round-Two Priorities",
      "- Fix the immersion-breaking problems: timeline, logic, relationships, evidence access, physical state.",
      "- Add real scenes to the back half; never close on result summaries.",
      "- Keep the title, opening, chapter titles, and main title consistent with the prose, though the title may be re-sharpened from the final draft for platform click appeal.",
      "- Word count is calibration only: pad short chapters with real scenes; trim long ones by cutting explanation and repeated reactions.",
      "",
      "## Output Format",
      "=== SHORT_FICTION_TITLE ===",
      "The story title — plain text, platform-ready, nothing else",
      "=== SHORT_FICTION_OPENING_HOOK ===",
      "An optional pre-story hook of about 130 words; if no standalone teaser is needed, still write the small first-screen scene that opens chapter 1",
      ...Array.from({ length: input.chapterCount }, (_, index) => {
        const chapter = index + 1;
        return [
          `=== CHAPTER ${chapter} TITLE ===`,
          "Chapter title — plain text only, no #, no \"Chapter N\" prefix",
          `=== CHAPTER ${chapter} CONTENT ===`,
          `Chapter ${chapter} prose — full scenes, no synopsis, no author notes`,
        ].join("\n");
      }),
    ].join("\n");
  }
if (language === "ko") {
    return [
      "심사 의견을 바탕으로 완전한 두 번째 버전 초안을 쓰세요.",
      "같은 이야기의 2차 시도입니다. 지난 버전에서 통한 것은 유지하고, 몰입을 깨뜨리거나 계속 읽고 싶은 욕구를 죽이는 문제는 고치세요.",
      "수정 제안 목록을 출력하지 말고, 몇 장만 패치하지도 마세요. 완전한 초안을 출력하세요.",
      "",
      "## 심사 의견",
      input.review.trim(),
      "",
      "## 2차 시도 중점",
      "- 몰입을 깨뜨리는 문제를 고치세요. 시간선, 논리, 관계, 증거 접근권, 신체 상태.",
      "- 후반부에 실제 장면을 채우고, 결과 요약으로 끝내지 마세요.",
      "- 제목, 도입, 장 제목, 본문의 주 제목이 본문과 일치하게 유지하세요. 다만 플랫폼 클릭 감각을 위해 최종 초안을 기준으로 제목을 더 예리하게 다듬을 수는 있습니다.",
      "- 글자 수는 보정 기준일 뿐입니다. 짧은 장은 실제 장면으로 채우고, 긴 장은 설명과 반복된 반응을 줄여 다듬으세요.",
      "",
      "## 출력 형식",
      "=== SHORT_FICTION_TITLE ===",
      "단편 제목. 순수 텍스트로 플랫폼에 어울리게, 다른 것은 쓰지 않기",
      "=== SHORT_FICTION_OPENING_HOOK ===",
      "선택 사항인 이야기 전 훅으로 약 200자; 독립적인 티저가 필요 없다면 1장 첫 화면의 입장 장면을 써라",
      ...Array.from({ length: input.chapterCount }, (_, index) => {
        const chapter = index + 1;
        return [
          `=== CHAPTER ${chapter} TITLE ===`,
          "장 제목. 순수 텍스트만, # 없이, '제N장' 접두어 없이",
          `=== CHAPTER ${chapter} CONTENT ===`,
          `${chapter}장 본문. 완전한 장면을 쓰고, 요약이나 작가 메모를 쓰지 마세요`,
        ].join("\n");
      }),
    ].join("\n");
  }
  return [
    "根据审稿意见，继续写第二版完整正文。",
    "这是同一篇的第二轮写作：保留上一版能打的地方，修掉会让读者出戏或不想读的问题。",
    "不要只列修改建议，不要只改几章片段，输出完整正文。",
    "",
    "## 审稿意见",
    input.review.trim(),
    "",
    "## 第二轮重点",
    "- 修时间线、逻辑、人物关系、证据权限、身体状态等会让读者出戏的问题。",
    "- 补后半段有效场面，不要用结果摘要收尾。",
    "- 保持标题、开篇、章节标题和正文主标题一致，但标题可以基于正文重新压得更有平台点击感。",
    "- 字数只做校准：偏短补有效场面，偏长删解释和重复反应。",
    "",
    "## 输出格式",
    "=== SHORT_FICTION_TITLE ===",
    "短篇标题，只写纯文本平台标题",
    "=== SHORT_FICTION_OPENING_HOOK ===",
    "可选正文前小钩子，约 200 字；如果不需要独立引子，也要写第 1 章第一屏的入局小场面",
    ...Array.from({ length: input.chapterCount }, (_, index) => {
      const chapter = index + 1;
      return [
        `=== CHAPTER ${chapter} TITLE ===`,
        "章节标题，只写纯文本，不要 #，不要第几章前缀",
        `=== CHAPTER ${chapter} CONTENT ===`,
        `第${chapter}章正文，写完整场面，不要梗概，不要作者备注`,
      ].join("\n");
    }),
  ].join("\n");
}

export function buildShortFictionPackageSystemPrompt(language: ShortFictionLanguage = "zh"): string {
  if (language === "en") {
    return [
      "You are a short-fiction packaging editor. From the final draft you produce the synopsis, the selling points, and the cover-image prompt.",
      "Never invent a main title different from the draft's. All packaging must revolve around the draft's actual title and plot.",
      "Think of the cover prompt as a mobile portrait book cover: 3:4 vertical, a large title zone, strong character emotion, one or two instantly recognizable props, high-contrast colors — not a movie poster.",
    ].join("\n");
  }
  if (language === "ko") {
    return [
      "당신은 단편소설 패키징 편집자입니다. 최종 초안에서 소개, 판매 포인트, 커버 이미지 프롬프트를 만듭니다.",
      "초안과 다른 주 제목을 절대 지어내지 마세요. 모든 패키징은 초안의 실제 제목과 줄거리를 중심으로 해야 합니다.",
      "커버 프롬프트는 모바일 세로형 책 표지로 생각하세요. 3:4 세로, 넓은 제목 영역, 강한 인물 감정, 한두 가지 단번에 알아볼 수 있는 소품, 고대비 색상. 영화 포스터가 아닙니다.",
    ].join("\n");
  }
  return [
    "你是短篇小说包装编辑，负责根据最终正文生成简介、卖点和封面提示词。",
    "不要另起一个和正文不同的主标题。包装必须围绕正文实际标题和剧情。",
    "封面提示词按手机端竖版书封思考：3:4 竖图、大标题区、强人物情绪、少量一眼可识别道具、高对比色彩，不要影视海报感。",
  ].join("\n");
}

export function buildShortFictionPackageUserPrompt(
  input: ShortFictionPackagePromptInput,
  language: ShortFictionLanguage = "zh",
): string {
  if (language === "en") {
    return [
      "## Creative Direction",
      input.direction,
      "",
      "## Story Plan",
      input.outlineMarkdown.trim(),
      "",
      "## Final Draft",
      input.draftMarkdown.trim(),
      "",
      "## Output Format",
      "=== SHORT_FICTION_PACKAGE_TITLE ===",
      input.draftTitle,
      "=== SHORT_FICTION_INTRO ===",
      "A 70-120 word platform synopsis that grabs the conflict, the pressure, and the payoff — never a spoiler-filled play-by-play.",
      "=== SHORT_FICTION_SELLING_POINTS ===",
      "- 3 to 6 selling points, one per line",
      "=== SHORT_FICTION_COVER_PROMPT ===",
      "An English cover-generation prompt: 3:4 portrait, main title zone, character emotion, props, color palette, typography style, and what to avoid.",
    ].join("\n");
  }
  if (language === "ko") {
    return [
      "## 창작 방향",
      input.direction,
      "",
      "## 이야기 기획",
      input.outlineMarkdown.trim(),
      "",
      "## 최종 초안",
      input.draftMarkdown.trim(),
      "",
      "## 출력 형식",
      "=== SHORT_FICTION_PACKAGE_TITLE ===",
      input.draftTitle,
      "=== SHORT_FICTION_INTRO ===",
      "100-180자 플랫폼 소개. 갈등, 압박, 보상을 직접 잡아야 하며 스포일러 가득한 줄거리 나열이 되어서는 안 됩니다.",
      "=== SHORT_FICTION_SELLING_POINTS ===",
      "- 3~6개의 판매 포인트, 각각 한 줄",
      "=== SHORT_FICTION_COVER_PROMPT ===",
      "한국어 커버 생성 프롬프트: 3:4 세로, 주 제목 영역, 인물 감정, 소품, 색상 팔레트, 타이포그래피 스타일, 피해야 할 것.",
    ].join("\n");
  }
  return [
    "## 创作方向",
    input.direction,
    "",
    "## 故事方案",
    input.outlineMarkdown.trim(),
    "",
    "## 最终正文",
    input.draftMarkdown.trim(),
    "",
    "## 输出格式",
    "=== SHORT_FICTION_PACKAGE_TITLE ===",
    input.draftTitle,
    "=== SHORT_FICTION_INTRO ===",
    "100-180字平台简介，直接抓冲突、压迫和回报，不要剧透成流水账。",
    "=== SHORT_FICTION_SELLING_POINTS ===",
    "- 3到6条卖点，每条一行",
    "=== SHORT_FICTION_COVER_PROMPT ===",
    "中文封面生成提示词：3:4竖图，主标题区，人物情绪，道具，配色，字体风格，避免事项。",
  ].join("\n");
}

function buildShortFictionCraftPrompt(language: ShortFictionLanguage = "zh"): string {
  if (language === "en") {
    return [
      "## Craft Reminders",
      "- Salt dissolves in the soup: values and ambition show through action, never through slogans.",
      "- Show, don't tell: let behavior, evidence, concrete detail, and staging make the reader feel a character's state.",
      "- Simile restraint: do not lean on \"like / as if / as though\" as default rhetoric — at most one simile per scene; prefer a precise verb and a concrete action over a figure of speech.",
      "- Anti-AI wording: ration AI-tell words (delve, tapestry, testament, intricate, pivotal); do not use the \"It wasn't X; it was Y\" construction as a crutch; keep analytical report language (\"core motivation\", \"strategic advantage\") out of the prose.",
      "- No padding: every scene must advance conflict, causality, emotion, evidence, pressure, payoff, or a relationship.",
      "- The climax is a scene, not a recap: eruptions of conflict, reversals, life-or-death beats, and reveals must play out beat by beat on the page (action, dialogue, the five senses). The heavier a chapter's information load, the more its key beat must be staged as a full scene — never compressed into one line like \"then he saved her and the rival was arrested.\"",
      "- Payoffs need setup: every reversal, comeuppance, reconciliation, revenge, or identity reveal must ride a chain of evidence and causality.",
      "- Side characters need motives: even the oppressor acts from interest, misjudgment, or fear — never a brainless plot device.",
      "- Everyday detail must become bait: each detail carries evidence, emotion, characterization, or a later reversal.",
      "- Mobile-first: short paragraphs, dense information, no vague lyricism or decorative filler.",
    ].join("\n");
  }
if (language === "ko") {
    return [
      "## 집필 요령",
      "- 소금은 국에 녹는다. 인물의 가치관과 야망은 구호가 아니라 행동으로 드러난다.",
      "- 보여주고 말하라. 행동, 증거, 구체적인 디테일, 무대 장치로 독자가 인물의 상태를 느끼게 하라.",
      "- 직유 절제. '마치/처럼/마치 ~인 것처럼'을 기본 수사로 남용하지 말고, 장면당 직유는 최대 1회. 비유보다 정확한 동사와 구체적인 행동을 우선하라.",
      "- AI 느낌 나는 문구 자제. (delve, tapestry, testament, intricate, pivotal) 류의 AI가 잘 쓰는 단어를 절약하고, '그건 X가 아니라 Y였다' 식의 문장을 버팀목으로 쓰지 말며, 분석적인 보고식 표현('핵심 동기', '전략적 우위')은 본문에서 빼라.",
      "- 물타기 금지. 모든 장면은 갈등, 인과, 감정, 증거, 압박, 보상, 또는 관계를 앞으로 끌어야 한다.",
      "- 절정은 요약이 아니라 장면이다. 갈등 폭발, 반전, 생사, 폭로 같은 핵심 비트는 페이지 위에서 비트 하나하나를 연기해야 한다(행동, 대화, 오감). 장의 정보량이 많을수록 가장 핵심인 비트를 완전한 장면으로 무대화하라. '그러자 그가 그녀를 구했고 라이벌은 체포되었다' 같은 한 줄로 압축하지 마라.",
      "- 보상에는 장치가 필요하다. 모든 반전, 응징, 화해, 복수, 정체 폭로는 증거 체인과 인과 체인을 타야 한다.",
      "- 조연에도 동기가 필요하다. 압제자조차 이익, 오판, 두려움에서 움직인다. 멍청한 플롯 도구로 쓰지 마라.",
      "- 일상 디테일은 미끼가 되어야 한다. 각 디테일은 증거, 감정, 인물화, 혹은 이후 반전의 기능을 담는다.",
      "- 모바일 우선. 단락은 짧게, 정보는 조밀하게, 모호한 서정이나 장식적인 잡담은 줄여라.",
    ].join("\n");
  }
  return [
    "## 写法提醒",
    "- 盐溶于汤：人物价值观和野心靠行动表现，不靠口号。",
    "- Show don't tell：用行为、证据、细节和场景让读者自己感到人物状态。",
    "- 明喻节制：别把「像/仿佛/如同」当默认修辞反复用，每个场景最多 1 处；优先用准确的动词和具体动作，而不是比喻。",
    "- 反注水：每个场景都推动冲突、因果、情绪、证据、压迫、回报或关系。",
    "- 高潮即场景，不是概述：冲突爆发、反转、生死、揭露这些关键拍必须当场一拍一拍演出（动作、对话、五感）。本章信息量越大越要把最关键那拍写成完整场面，绝不能用「然后他救了人、对手落网」这种一句话带过。",
    "- 回报要有铺垫：反转、打脸、和解、复仇、身份揭露都要有证据链和因果链。",
    "- 配角要有动机：压迫者也有利益、误判或恐惧，不要写成无脑工具人。",
    "- 日常细节要变成饵：细节承担证据、情绪、人物差异或后续反转功能。",
    "- 移动端优先：段落短，信息密，少写空泛抒情和装饰性废话。",
  ].join("\n");
}
