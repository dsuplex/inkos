import type { BookConfig } from "../models/book.js";
import type { GenreProfile } from "../models/genre-profile.js";
import type { BookRules } from "../models/book-rules.js";

export function buildSettlerSystemPrompt(
  book: BookConfig,
  genreProfile: GenreProfile,
  bookRules: BookRules | null,
  language?: "zh" | "ko" | "en",
): string {
  const resolvedLang = language ?? genreProfile.language;
  const isEnglish = resolvedLang === "en";
  const isKorean = resolvedLang === "ko";

  const numericalBlock = genreProfile.numericalSystem
    ? isEnglish
      ? `\n- This genre has a numerical/resource system; you MUST track every resource change appearing in the prose in UPDATED_LEDGER
- Numerical verification iron law: opening + delta = closing, all three must be verifiable`
      : isKorean
        ? `\n- 본 장르에는 수치/자원 시스템이 있습니다. 본문에 나타나는 모든 자원 변동을 UPDATED_LEDGER에 반드시 추적하세요
- 수치 검증 철칙: 기초 + 증감 = 기말, 세 항목 모두 검증 가능해야 합니다`
        : `\n- 本题材有数值/资源体系，你必须在 UPDATED_LEDGER 中追踪正文中出现的所有资源变动
- 数值验算铁律：期初 + 增量 = 期末，三项必须可验算`
    : isEnglish
      ? `\n- This genre has no numerical system; leave UPDATED_LEDGER empty`
      : isKorean
        ? `\n- 본 장르에는 수치 시스템이 없습니다. UPDATED_LEDGER는 비워 두세요`
        : `\n- 本题材无数值系统，UPDATED_LEDGER 留空`;

  const hookRules = isEnglish
    ? `
## Hook Tracking Rules (Strict)

- New hook: only add a hook_id when the prose introduces an unresolved question that continues to later chapters and has a concrete payoff direction. Do NOT create a new hook for rephrasing, restating, or abstract summarizing of an existing hook
- Mention hook: an existing hook is mentioned in this chapter but adds no new information and does not change reader/character understanding → put in mention array, do NOT update last advanced
- Advance hook: an existing hook gets new facts, evidence, relationship change, risk escalation, or scope narrowing in this chapter → MUST update "lastAdvancedChapter" to current chapter, update status and notes
- Resolve hook: a hook is explicitly revealed, solved, or no longer holds in this chapter → status becomes "resolved", note resolution method
- Defer hook: only mark "deferred" when the prose explicitly shelves the thread, moves it to background, or defers it by plot; do NOT defer mechanically just because "several chapters have passed"
- Brand-new unresolved thread: do NOT invent a new hookId directly. Put candidates in newHookCandidates; the system decides if it maps to an old hook, becomes a genuine new hook, or is rejected as a restatement
- payoffTiming uses semantic pacing, NOT hard chapter numbers: only immediate / near-term / mid-arc / slow-burn / endgame
- **Iron law**: do NOT treat "mentioned again", "rephrased", "abstract recap" as advance. Only update lastAdvancedChapter if the state truly changed. Merely appearing old hooks go in mention array.`
    : isKorean
      ? `
## 훅 추적 규칙(엄수)

- 신규 훅: 본문에 후속 장으로 이어질 미해결 질문이 구체적 회수 방향과 함께 등장할 때만 hook_id 추가. 기존 훅의 재표현·재진술·추상 요약으로 새 훅을 만들지 마세요
- 훅 언급: 기존 훅이 본장에서 언급되나 새 정보가 없고 독자/캐릭터 이해에 변화 없음 → mention 배열에 넣고 최근 추진 갱신 안 함
- 훅 추진: 기존 훅이 본장에서 새로운 사실·증거·관계 변화·위험 고조·범위 축소로 이어짐 → 반드시 "lastAdvancedChapter"를 현재 장으로 갱신, 상태와 비고 갱신
- 훅 회수: 훅이 본장에서 명시적으로 밝혀지거나 해결되거나 더 이상 성립하지 않음 → 상태를 "resolved"로, 비고에 회수 방식 기록
- 훅 보류: 본문이 명시적으로 해당 선을 보류/후경화/극적으로 미룰 때만 "deferred" 표기; 단순히 "몇 장 지났다"는 이유로 기계적으로 보류하지 마세요
- 완전히 새로운 미해결 실마리: 새 hookId를 직접 발명하지 마세요. 후보를 newHookCandidates에 넣으세요. 시스템이 기존 훅 매핑·진짜 신규 훅·중복 재진술 여부를 판단합니다
- payoffTiming은 의미적 템포로, 하드 장 번호는 쓰지 않음: immediate / near-term / mid-arc / slow-burn / endgame만 허용
- **철칙**: "다시 언급" "재표현" "추상 복기"를 추진으로 취급하지 마세요. 상태가 진짜 변했을 때만 lastAdvancedChapter 갱신. 단순 등장 기존 훅은 mention 배열로.`
      : `
## 伏笔追踪规则（严格执行）

- 新伏笔：只有当正文中出现一个会延续到后续章节、且有具体回收方向的未解问题时，才新增 hook_id。不要为旧 hook 的换说法、重述、抽象总结再开新 hook
- 提及伏笔：已有伏笔在本章被提到，但没有新增信息、没有改变读者或角色对该问题的理解 → 放入 mention 数组，不要更新最近推进
- 推进伏笔：已有伏笔在本章出现了新的事实、证据、关系变化、风险升级或范围收缩 → **必须**更新"最近推进"列为当前章节号，更新状态和备注
- 回收伏笔：伏笔在本章被明确揭示、解决、或不再成立 → 状态改为"已回收"，备注回收方式
- 延后伏笔：只有当正文明确显示该线被主动搁置、转入后台、或被剧情压后时，才标注"延后"；不要因为"已经过了几章"就机械延后
- brand-new unresolved thread：不要直接发明新的 hookId。把候选放进 newHookCandidates，由系统决定它是映射到旧 hook、变成真正新 hook，还是被拒绝为重述
- payoffTiming 使用语义节奏，不用硬写章节号：只允许 immediate / near-term / mid-arc / slow-burn / endgame
- **铁律**：不要把"再次提到""换个说法重述""抽象复盘"当成推进。只有状态真的变了，才更新最近推进。只是出现过的旧 hook，放进 mention 数组。`;

  const fullCastBlock = bookRules?.enableFullCastTracking
    ? isEnglish
      ? `\n## Full Cast Tracking\nPOST_SETTLEMENT must additionally include: list of characters appearing this chapter, inter-character relationship changes, characters mentioned but not appearing.`
      : isKorean
        ? `\n## 전체 캐스트 추적\nPOST_SETTLEMENT에 반드시 추가: 본장 출현 캐릭터 목록, 캐릭터 간 관계 변화, 미출현이나 언급된 캐릭터.`
        : `\n## 全员追踪\nPOST_SETTLEMENT 必须额外包含：本章出场角色清单、角色间关系变动、未出场但被提及的角色。`
    : "";

const langPrefix = isEnglish
    ? `【LANGUAGE OVERRIDE】ALL output (state card, hooks, summaries, subplots, emotional arcs, character matrix) MUST be in English. The === TAG === markers remain unchanged.\n\n`
    : isKorean
      ? `【언어 재정의】모든 출력(상태 카드, 훅, 요약, 지선, 감정 아크, 캐릭터 매트릭스)은 반드시 한국어로 작성하세요. === TAG === 표식은 그대로 유지.\n\n`
      : "";

  const role = isEnglish ? "You are a state-tracking analyst." : isKorean ? "당신은 상태 추적 분석가입니다." : "你是状态追踪分析师。";
  const taskIntro = isEnglish
    ? `Given the new chapter prose and current truth files, your task is to produce the updated truth files.

## Work Mode

You are NOT writing. Your task is:
1. Read the prose carefully and extract ALL state changes
2. Make incremental updates based on the "current tracking files"
3. Output STRICTLY in the === TAG === format

## Analysis Dimensions

Extract the following from the prose:
- Character appearances, exits, state changes (injury/breakthrough/death, etc.)
- Location moves, scene transitions
- Item/resource gains and consumption
- Hook planting, advancement, resolution
- Emotional arc shifts
- Subplot progress
- Inter-character relationship changes, new information boundaries

## Book Info

- Title: ${book.title}
- Genre: ${genreProfile.name} (${book.genre})
- Platform: ${book.platform}
${numericalBlock}
${hookRules}${fullCastBlock}

## Output Format (MUST Follow Exactly)

${buildSettlerOutputFormat(genreProfile)}

## Key Rules

1. State card and hook pool MUST be incremental updates based on "current tracking files", NOT from scratch
2. EVERY factual change in the prose MUST be reflected in the corresponding tracking file
3. Do NOT miss details: numerical changes, location changes, relationship changes, information changes — all recorded
4. The "information boundary" in the character matrix MUST be accurate — a character only knows what happened in their presence

## Iron Law: Record ONLY What Actually Happens in the Prose (Strict)

- **Extract ONLY events and state changes explicitly described in the prose**. Do NOT infer, predict, or supplement what the prose does not say
- If the prose only says a character walks to the door but hasn't entered, the state card must NOT say "character has entered the room"
- If the prose only implies a possibility but does not confirm it, do NOT record it as a fact that happened
- Do NOT supplement the state card with plot from volume outlines or outlines that the prose has not yet reached
- Do NOT delete or modify existing hooks unrelated to this chapter — only update hooks touched by this chapter's prose
- Chapter 1 especially: initial tracking files may contain pre-generated content from outlines; keep ONLY what the prose actually supports, do NOT keep presets the prose never touches
- **Hook exception**: unresolved questions, suspense, foreshadowing threads appearing in the prose MUST be recorded in hooks. This is NOT "inference" — it is "extracting narrative promises from the prose". If the prose implies a mystery/conflict/secret but does not answer it, that IS a hook and MUST be recorded`
    : isKorean
      ? `새 장 본문과 현재 truth 파일을 주어졌을 때, 당신의 임무는 업데이트된 truth 파일을 산출하는 것입니다.

## 작업 모드

당신은 글을 쓰지 않습니다. 당신의 작업은:
1. 본문을 꼼꼼히 읽고 모든 상태 변화를 추출하세요
2. "현재 추적 파일"을 기반으로 증분 업데이트하세요
3. === TAG === 형식을 엄격히 준수해 출력하세요

## 분석 차원

본문에서 다음 정보를 추출하세요:
- 캐릭터 출현·퇴장·상태 변화(부상/돌파/사망 등)
- 위치 이동, 장면 전환
- 아이템/자원 획득과 소비
- 훅 매설·추진·회수
- 감정 아크 변화
- 지선 진행
- 캐릭터 간 관계 변화, 새로운 정보 경계

## 도서 정보

- 제목: ${book.title}
- 장르: ${genreProfile.name} (${book.genre})
- 플랫폼: ${book.platform}
${numericalBlock}
${hookRules}${fullCastBlock}

## 출력 형식(반드시 준수)

${buildSettlerOutputFormat(genreProfile)}

## 핵심 규칙

1. 상태 카드와 훅 풀은 "현재 추적 파일" 기준 증분 업데이트만, 백지부터 다시 쓰지 마세요
2. 본문의 모든 사실적 변화는 해당 추적 파일에 반드시 반영되어야 합니다
3. 세부 사항을 빠뜨리지 마세요: 수치 변화, 위치 변화, 관계 변화, 정보 변화 모두 기록
4. 캐릭터 상호작용 매트릭스의 "정보 경계"는 정확해야 합니다——캐릭터는 자신이 현장에 있던 일만 압니다

## 철칙: 본문에서 실제로 일어난 일만 기록(엄수)

- **본문에 명시적으로 서술된 사건과 상태 변화만 추출하세요**. 추론, 예측, 본문에 없는 내용 보충 금지
- 본문이 캐릭터가 문 앞까지 갔으나 들어가지 않았다까지만 썼다면, 상태 카드에 "캐릭터가 방에 들어옴"이라고 쓰면 안 됩니다
- 본문이 가능성만 암시하고 확정하지 않았다면, 그것을 일어난 사실로 기록하지 마세요
- 볼강이나 대본에서 본문이 아직 도달하지 않은 줄거리를 상태 카드에 보충하지 마세요
- 본장과 무관한 기존 훅을 삭제하거나 수정하지 마세요——본장 본문이 건드린 훅만 업데이트하세요
- 1장 특히 주의: 초기 추적 파일에 대본에서 미리 생성된 내용이 있을 수 있습니다. 본문이 실제 뒷받침하는 부분만 남기고, 본문이 다루지 않은 예비 설정은 남기지 마세요
- **훅 예외**: 본문에 등장하는 미해결 의문, 서스펜스, 복선 실마리는 반드시 훅에 기록하세요. 이것은 "추론"이 아니라 "본문의 서사적 약속 추출"입니다. 본문이 수수께끼/갈등/비밀을 암시했으나 답하지 않았다면 그것은 훅이며 반드시 기록해야 합니다`
      : `给定新章节正文和当前 truth 文件，你的任务是产出更新后的 truth 文件。

## 工作模式

你不是在写作。你的任务是：
1. 仔细阅读正文，提取所有状态变化
2. 基于"当前追踪文件"做增量更新
3. 严格按照 === TAG === 格式输出

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
${hookRules}${fullCastBlock}

## 输出格式（必须严格遵循）

${buildSettlerOutputFormat(genreProfile)}

## 关键规则

1. 状态卡和伏笔池必须基于"当前追踪文件"做增量更新，不是从零开始
2. 正文中的每一个事实性变化都必须反映在对应的追踪文件中
3. 不要遗漏细节：数值变化、位置变化、关系变化、信息变化都要记录
4. 角色交互矩阵中的"信息边界"要准确——角色只知道他在场时发生的事

## 铁律：只记录正文中实际发生的事（严格执行）

- **只提取正文中明确描写的事件和状态变化**。不要推断、预测、或补充正文没有写到的内容
- 如果正文只写到角色走到门口还没进去，状态卡就不能写"角色已进入房间"
- 如果正文只暗示了某种可能性但没有确认，不要把它当作已发生的事实记录
- 不要从卷纲或大纲中补充正文尚未到达的剧情到状态卡
- 不要删除或修改已有 hooks 中与本章无关的内容——只更新本章正文涉及的 hooks
- 第 1 章尤其注意：初始追踪文件可能包含从大纲预生成的内容，只保留正文实际支持的部分，不要保留正文未涉及的预设
- **伏笔例外**：正文中出现的未解疑问、悬念、伏笔线索必须在 hooks 中记录。这不是"推断"，而是"提取正文中的叙事承诺"。如果正文暗示了一个谜题/冲突/秘密但没有解答，那就是一个 hook，必须记录`;

  return `${langPrefix}${role}

${taskIntro}`;
}

function buildSettlerOutputFormat(gp: GenreProfile): string {
  const chapterTypeExample = gp.chapterTypes.length > 0
    ? gp.chapterTypes[0]
    : "主线推进";

  return `=== POST_SETTLEMENT ===
（简要说明本章有哪些状态变动、伏笔推进、结算注意事项；允许 Markdown 表格或要点）

=== RUNTIME_STATE_DELTA ===
（必须输出 JSON，不要输出 Markdown，不要加解释）
\`\`\`json
{
  "chapter": 12,
  "currentStatePatch": {
    "currentLocation": "可选",
    "protagonistState": "可选",
    "currentGoal": "可选",
    "currentConstraint": "可选",
    "currentAlliances": "可选",
    "currentConflict": "可选"
  },
  "hookOps": {
    "upsert": [
      {
        "hookId": "mentor-oath",
        "startChapter": 8,
        "type": "relationship",
        "status": "progressing",
        "lastAdvancedChapter": 12,
        "expectedPayoff": "揭开师债真相",
        "payoffTiming": "slow-burn",
        "notes": "本章为何推进/延后/回收"
      }
    ],
    "mention": ["本章只是被提到、没有真实推进的 hookId"],
    "resolve": ["已回收的 hookId"],
    "defer": ["需要标记延后的 hookId"]
  },
  "newHookCandidates": [
    {
      "type": "mystery",
      "expectedPayoff": "新伏笔未来要回收到哪里",
      "payoffTiming": "near-term",
      "notes": "本章为什么会形成新的未解问题"
    }
  ],
  "chapterSummary": {
    "chapter": 12,
    "title": "本章标题",
    "characters": "角色1,角色2",
    "events": "一句话概括关键事件",
    "stateChanges": "一句话概括状态变化",
    "hookActivity": "mentor-oath advanced",
    "mood": "紧绷",
    "chapterType": "${chapterTypeExample}"
  },
  "subplotOps": [],
  "emotionalArcOps": [],
  "characterMatrixOps": [],
  "notes": []
}
\`\`\`

规则：
1. 只输出增量，不要重写完整 truth files
2. 所有章节号字段都必须是整数，不能写自然语言
3. hookOps.upsert 里只能写“当前伏笔池里已经存在”的 hookId，不允许发明新的 hookId
4. brand-new unresolved thread 一律写进 newHookCandidates，不要自造 hookId
5. 如果旧 hook 只是被提到、没有真实状态变化，把它放进 mention，不要更新 lastAdvancedChapter
6. 如果本章推进了旧 hook，lastAdvancedChapter 必须等于当前章号
7. 如果回收或延后 hook，必须放在 resolve / defer 数组里
8. chapterSummary.chapter 必须等于当前章节号`;
}

export function buildSettlerUserPrompt(params: {
  readonly chapterNumber: number;
  readonly title: string;
  readonly content: string;
  readonly currentState: string;
  readonly ledger: string;
  readonly hooks: string;
  readonly chapterSummaries: string;
  readonly subplotBoard: string;
  readonly emotionalArcs: string;
  readonly characterMatrix: string;
  readonly volumeOutline: string;
  readonly observations?: string;
  readonly selectedEvidenceBlock?: string;
  readonly governedControlBlock?: string;
  readonly validationFeedback?: string;
  readonly language?: "zh" | "ko" | "en";
}): string {
  const lang = params.language ?? "zh";
  const isEnglish = lang === "en";
  const isKorean = lang === "ko";

  const notCreated = isEnglish ? "(file not created yet)" : isKorean ? "(파일 미생성)" : "(文件尚未创建)";

  const ledgerBlock = params.ledger
    ? `\n## ${isEnglish ? "Current Resource Ledger" : isKorean ? "현재 자원 장부" : "当前资源账本"}\n${params.ledger}\n`
    : "";

  const summariesBlock = params.chapterSummaries !== notCreated
    ? `\n## ${isEnglish ? "Existing Chapter Summaries" : isKorean ? "기존 장 요약" : "已有章节摘要"}\n${params.chapterSummaries}\n`
    : "";

  const subplotBlock = params.subplotBoard !== notCreated
    ? `\n## ${isEnglish ? "Current Subplot Board" : isKorean ? "현재 지선 진행판" : "当前支线进度板"}\n${params.subplotBoard}\n`
    : "";

  const emotionalBlock = params.emotionalArcs !== notCreated
    ? `\n## ${isEnglish ? "Current Emotional Arcs" : isKorean ? "현재 감정 아크" : "当前情感弧线"}\n${params.emotionalArcs}\n`
    : "";

  const matrixBlock = params.characterMatrix !== notCreated
    ? `\n## ${isEnglish ? "Current Character Interaction Matrix" : isKorean ? "현재 캐릭터 상호작용 매트릭스" : "当前角色交互矩阵"}\n${params.characterMatrix}\n`
    : "";

  const observationsBlock = params.observations
    ? `\n## ${isEnglish ? "Observation Log (extracted by Observer, all fact changes this chapter)" : isKorean ? "관찰 로그(Observer 추출, 본장 모든 사실 변화)" : "观察日志（由 Observer 提取，包含本章所有事实变化）"}\n${params.observations}\n\n${isEnglish ? "Based on the above observation log and prose, update all tracking files. Ensure every change in the observation log is reflected in the corresponding file." : isKorean ? "위 관찰 로그와 본문을 바탕으로 모든 추적 파일을 업데이트하세요. 관찰 로그의 모든 변화가 해당 파일에 반영되게 하세요." : "基于以上观察日志和正文，更新所有追踪文件。确保观察日志中的每一项变化都反映在对应的文件中。"}\n`
    : "";
  const selectedEvidenceBlock = params.selectedEvidenceBlock
    ? `\n## ${isEnglish ? "Selected Long-Range Evidence" : isKorean ? "선택된 장거리 증거" : "已选长程证据"}\n${params.selectedEvidenceBlock}\n`
    : "";
  const controlBlock = params.governedControlBlock ?? "";
  const outlineBlock = controlBlock.length === 0
    ? `\n## ${isEnglish ? "Volume Outline" : isKorean ? "볼 강령" : "卷纲"}\n${params.volumeOutline}\n`
    : "";
  const validationFeedbackBlock = params.validationFeedback
    ? `\n## ${isEnglish ? "State Validation Feedback" : isKorean ? "상태 검증 피드백" : "状态校验反馈"}\n${params.validationFeedback}\n\n${isEnglish ? "Strictly correct these contradictions; only fix truth files, do not rewrite prose, do not introduce new facts not in the prose." : isKorean ? "이 모순들을 엄격히 수정하세요. truth files만 수정하고, 본문은 고치지 마세요. 본문에 없는 새 사실을 도입하지 마세요." : "请严格纠正这些矛盾，只修正 truth files，不要改写正文，不要引入正文中不存在的新事实。"}\n`
    : "";

  if (isEnglish) {
    return `Analyze the prose of Chapter ${params.chapterNumber} "${params.title}" and update all tracking files.
${observationsBlock}
${validationFeedbackBlock}
## Chapter Prose

${params.content}
${controlBlock}

## Current State Card
${params.currentState}
${ledgerBlock}
## Current Hook Pool
${params.hooks}
${selectedEvidenceBlock}${summariesBlock}${subplotBlock}${emotionalBlock}${matrixBlock}
${outlineBlock}

Output the settlement result STRICTLY in the === TAG === format.`;
  }
  if (isKorean) {
    return `제${params.chapterNumber}장 「${params.title}」 본문을 분석해 모든 추적 파일을 업데이트하세요.
${observationsBlock}
${validationFeedbackBlock}
## 본장 본문

${params.content}
${controlBlock}

## 현재 상태 카드
${params.currentState}
${ledgerBlock}
## 현재 훅 풀
${params.hooks}
${selectedEvidenceBlock}${summariesBlock}${subplotBlock}${emotionalBlock}${matrixBlock}
${outlineBlock}

=== TAG === 형식으로 엄격히 구조화해 출력하세요.`;
  }
  return `请分析第${params.chapterNumber}章「${params.title}」的正文，更新所有追踪文件。
${observationsBlock}
${validationFeedbackBlock}
## 本章正文

${params.content}
${controlBlock}

## 当前状态卡
${params.currentState}
${ledgerBlock}
## 当前伏笔池
${params.hooks}
${selectedEvidenceBlock}${summariesBlock}${subplotBlock}${emotionalBlock}${matrixBlock}
${outlineBlock}

请严格按照 === TAG === 格式输出结算结果。`;
}
