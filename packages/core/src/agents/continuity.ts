import { BaseAgent } from "./base.js";
import type { GenreProfile } from "../models/genre-profile.js";
import type { BookRules } from "../models/book-rules.js";
import type { FanficMode } from "../models/book.js";
import type { ChapterMemo, ContextPackage, RuleStack } from "../models/input-governance.js";
import { readGenreProfile, readBookLanguage, readBookRules } from "./rules-reader.js";
import { getFanficDimensionConfig, FANFIC_DIMENSIONS } from "./fanfic-dimensions.js";
import { readFile, readdir } from "node:fs/promises";
import { filterHooks, filterSummaries, filterSubplots, filterEmotionalArcs, filterCharacterMatrix } from "../utils/context-filter.js";
import { buildGovernedMemoryEvidenceBlocks } from "../utils/governed-context.js";
import {
  readVolumeMap,
  readCharacterContext,
  readCurrentStateWithFallback,
} from "../utils/outline-paths.js";
import { join } from "node:path";

export interface AuditResult {
  readonly passed: boolean;
  readonly issues: ReadonlyArray<AuditIssue>;
  readonly summary: string;
  /** True when the auditor response itself was not parseable; callers must not auto-revise content from this result. */
  readonly parseFailed?: boolean;
  /** 0-100 overall quality score. Present when the auditor supports scoring. */
  readonly overallScore?: number;
  readonly tokenUsage?: {
    readonly promptTokens: number;
    readonly completionTokens: number;
    readonly totalTokens: number;
  };
}

export interface AuditIssue {
  readonly severity: "critical" | "warning" | "info";
  readonly category: string;
  readonly description: string;
  readonly suggestion: string;
  readonly repairScope?: "local" | "structural" | "unknown";
}

type PromptLanguage = "zh" | "ko" | "en";

function normalizeRepairScope(value: unknown): AuditIssue["repairScope"] {
  if (value === "local" || value === "structural" || value === "unknown") return value;
  return undefined;
}

const DIMENSION_LABELS: Record<number, { readonly zh: string; readonly ko: string; readonly en: string }> = {
  1: { zh: "OOC检查", ko: "OOC 검사", en: "OOC Check" },
  2: { zh: "时间线检查", ko: "타임라인 검사", en: "Timeline Check" },
  3: { zh: "设定冲突", ko: "설정 충돌", en: "Lore Conflict Check" },
  4: { zh: "战力崩坏", ko: "전력 붕괴", en: "Power Scaling Check" },
  5: { zh: "数值检查", ko: "수치 검사", en: "Numerical Consistency Check" },
  6: { zh: "伏笔检查", ko: "복선 검사", en: "Hook Check" },
  7: { zh: "节奏检查", ko: "리듬 검사", en: "Pacing Check" },
  8: { zh: "文风检查", ko: "문체 검사", en: "Style Check" },
  9: { zh: "信息越界", ko: "정보 경계 위반", en: "Information Boundary Check" },
  10: { zh: "词汇疲劳", ko: "어휘 피로", en: "Lexical Fatigue Check" },
  11: { zh: "利益链断裂", ko: "동기 체인 단절", en: "Incentive Chain Check" },
  12: { zh: "年代考据", ko: "시대 고증", en: "Era Accuracy Check" },
  13: { zh: "配角降智", ko: "조연 무지화", en: "Side Character Competence Check" },
  14: { zh: "配角工具人化", ko: "조연 도구화", en: "Side Character Instrumentalization Check" },
  15: { zh: "爽点虚化", ko: "카타르시스 희석", en: "Payoff Dilution Check" },
  16: { zh: "台词失真", ko: "대사 왜곡", en: "Dialogue Authenticity Check" },
  17: { zh: "流水账", ko: "일기식 서술", en: "Chronicle Drift Check" },
  18: { zh: "知识库污染", ko: "지식베이스 오염", en: "Knowledge Base Pollution Check" },
  19: { zh: "视角一致性", ko: "시점 일관성", en: "POV Consistency Check" },
  20: { zh: "段落等长", ko: "단락 등장", en: "Paragraph Uniformity Check" },
  21: { zh: "套话密度", ko: "상투적 표현 밀도", en: "Cliche Density Check" },
  22: { zh: "公式化转折", ko: "공식적 반전", en: "Formulaic Twist Check" },
  23: { zh: "列表式结构", ko: "목록형 구조", en: "List-like Structure Check" },
  24: { zh: "支线停滞", ko: "서브플롯 정체", en: "Subplot Stagnation Check" },
  25: { zh: "弧线平坦", ko: "호 평탄", en: "Arc Flatline Check" },
  26: { zh: "节奏单调", ko: "리듬 단조", en: "Pacing Monotony Check" },
  27: { zh: "敏感词检查", ko: "민감어 검사", en: "Sensitive Content Check" },
  28: { zh: "正传事件冲突", ko: "본편 사건 충돌", en: "Mainline Canon Event Conflict" },
  29: { zh: "未来信息泄露", ko: "미래 정보 누출", en: "Future Knowledge Leak Check" },
  30: { zh: "世界规则跨书一致性", ko: "세계 규칙 크로스북 일관성", en: "Cross-Book World Rule Check" },
  31: { zh: "番外伏笔隔离", ko: "외전 복선 격리", en: "Spinoff Hook Isolation Check" },
  32: { zh: "读者期待管理", ko: "독자 기대 관리", en: "Reader Expectation Check" },
  33: { zh: "章节备忘偏离", ko: "챕터 메모 이탈", en: "Chapter Memo Drift Check" },
  34: { zh: "角色还原度", ko: "캐릭터 재현도", en: "Character Fidelity Check" },
  35: { zh: "世界规则遵守", ko: "세계 규칙 준수", en: "World Rule Compliance Check" },
  36: { zh: "关系动态", ko: "관계 역학", en: "Relationship Dynamics Check" },
  37: { zh: "正典事件一致性", ko: "정전 사건 일관성", en: "Canon Event Consistency Check" },
};

function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/u.test(text);
}

function resolveGenreLabel(genreId: string, profileName: string, language: PromptLanguage): string {
  if (language === "zh" || !containsChinese(profileName)) {
    return profileName;
  }

  if (genreId === "other") {
    return "general";
  }

  return genreId.replace(/[_-]+/g, " ");
}

function dimensionName(id: number, language: PromptLanguage): string | undefined {
  return DIMENSION_LABELS[id]?.[language];
}

function joinLocalized(items: ReadonlyArray<string>, language: PromptLanguage): string {
  if (language === "en" || language === "ko") return items.join(", ");
  return items.join("、");
}

function formatFanficSeverityNote(
  severity: "critical" | "warning" | "info",
  language: PromptLanguage,
): string {
  if (language === "en") {
    return severity === "critical"
      ? "Strict check."
      : severity === "info"
        ? "Log only; do not fail the chapter."
        : "Warning level.";
  }
  if (language === "ko") {
    return severity === "critical"
      ? "엄격 검사."
      : severity === "info"
        ? "기록만 함; 챕터 실패로 처리하지 않음."
        : "경고 수준.";
  }
  return severity === "critical"
    ? "（严格检查）"
    : severity === "info"
      ? "（仅记录，不判定失败）"
      : "（警告级别）";
}

function buildDimensionNote(
  id: number,
  language: PromptLanguage,
  gp: GenreProfile,
  bookRules: BookRules | null,
  fanficMode: FanficMode | undefined,
  fanficConfig: ReturnType<typeof getFanficDimensionConfig> | undefined,
): string {
  const words = bookRules?.fatigueWordsOverride && bookRules.fatigueWordsOverride.length > 0
    ? bookRules.fatigueWordsOverride
    : gp.fatigueWords;

  if (fanficConfig?.notes.has(id) && (language === "zh" || language === "ko")) {
    return fanficConfig.notes.get(id)!;
  }

  if (id === 1 && fanficMode === "ooc") {
    return language === "en"
      ? "In OOC mode, personality drift can be intentional; record only, do not fail. Evaluate against the character dossiers in fanfic_canon.md."
      : language === "ko"
        ? "OOC 모드에서는 성격 이탈이 의도적일 수 있음; 기록만 하고 실패로 처리하지 않음. fanfic_canon.md 캐릭터 도감을 기준으로 편차 평가."
        : "OOC模式下角色可偏离性格底色，此维度仅记录不判定失败。参照 fanfic_canon.md 角色档案评估偏离程度。";
  }

  if (id === 1 && fanficMode === "canon") {
    return language === "en"
      ? "Canon-faithful fanfic: characters must stay close to their original personality core. Evaluate against fanfic_canon.md character dossiers."
      : language === "ko"
        ? "캐논 준수 팬픽: 캐릭터가 원작 성격 핵심에 가깝게 유지되어야 함. fanfic_canon.md 캐릭터 도감 기준으로 평가."
        : "原作向同人：角色必须严格遵守性格底色。参照 fanfic_canon.md 角色档案中的性格底色和行为模式。";
  }

  if (id === 10 && words.length > 0) {
    return language === "en"
      ? `Fatigue words: ${words.join(", ")}. Also check AI tell markers (仿佛/不禁/宛如/竟然/忽然/猛地); warn when any appears more than once per 3,000 words.`
      : language === "ko"
        ? `고피로어: ${words.join(", ")}. AI 텔 마커(아마/어쩌면/어느 정도/마치/것 같은/것만 같다/일 것 같다)도 체크; 3,000자당 1회 초과 시 경고.`
        : `高疲劳词：${words.join("、")}。同时检查AI标记词（仿佛/不禁/宛如/竟然/忽然/猛地）密度，每3000字超过1次即warning`;
  }

  if (id === 15 && gp.satisfactionTypes.length > 0) {
    return language === "en"
      ? `Payoff types: ${gp.satisfactionTypes.join(", ")}`
      : language === "ko"
        ? `쾌감 유형: ${gp.satisfactionTypes.join(", ")}`
        : `爽点类型：${gp.satisfactionTypes.join("、")}`;
  }

  if (id === 12 && bookRules?.eraConstraints) {
    const era = bookRules.eraConstraints;
    const parts = [era.period, era.region].filter(Boolean);
    if (parts.length > 0) {
      return language === "en"
        ? `Era: ${parts.join(", ")}`
        : language === "ko"
          ? `시대: ${parts.join(", ")}`
          : `年代：${parts.join("，")}`;
    }
  }

  // v10: Enhanced dimension notes with writing methodology awareness
  if (id === 7) {
    return language === "en"
      ? "Check pacing rhythm: Do the recent 3-5 chapters form a complete mini-goal cycle (build-up → escalation → climax → aftermath)? If 5+ consecutive chapters pass without a climax (payoff/reward/reversal), flag as pacing stagnation. If the previous chapter was a climax/big reversal, does this chapter show change (relationships shifted, status changed, costs paid)? If it jumps straight to new build-up without showing impact, flag as 'post-climax impact missing'. Daily/transition scenes must carry at least one task: plant a hook, advance a relationship, set up contrast, or prepare the next cycle."
      : language === "ko"
        ? "리듬 파형 체크: 최근 3-5장이 완전한 '축적→확대→폭발→여파' 사이클을 이루는가? 5장 연속 클라이맥스(회수/보상/반전) 없으면 리듬 정체로 플래그. 직전 장이 클라이맥스/대반전이면 이번 장에 변화(관계 변화, 지위 변화, 대가 지불)가 있는가? 여파 없이 바로 새 축적으로 가면 '클라이맥스 후 여파 누락'으로 플래그. 비갈등 장의 일상/전환/대화 단락은 최소 한 가지 임무(복선 심기, 관계 진전, 대비 구축, 다음 사이클 준비)라도 맡아야 함. 순수 물 일상은 흐름글 리스크로 플래그."
        : "检查节奏波形：最近 3-5 章是否形成了完整的「蓄压→升级→爆发→后效」周期？如果连续 5 章没有爆发（兑现/回报/翻转），标记为节奏停滞。如果上一章是爆发/高潮/大反转，本章是否写出了改变？如果直接跳到新蓄压而没有展示前一波爆发的影响，标记为「高潮后影响缺失」。非冲突章节中的日常/过渡/对话段落，是否至少承担了一项任务：埋伏笔、推关系、建立反差、准备下一轮蓄压。纯水日常标记为流水账风险。";
  }

  if (id === 15) {
    const base = gp.satisfactionTypes.length > 0
      ? (language === "en" ? `Payoff types: ${gp.satisfactionTypes.join(", ")}. ` : language === "ko" ? `쾌감 유형: ${gp.satisfactionTypes.join(", ")}. ` : `爽点类型：${gp.satisfactionTypes.join("、")}。`)
      : "";
    return language === "en"
      ? `${base}Check desire engine: Has the chapter created an emotional gap (reader wants release) OR delivered a payoff that exceeds expectations? A payoff that only satisfies 70% of built-up anticipation counts as diluted. If this chapter is in the aftermath phase of a mini-goal cycle, verify that consequences are shown — not just emotional reactions, but concrete changes to status, relationships, or resources.`
      : language === "ko"
        ? `${base}욕망 엔진 체크: 이번 장이 감정 갭(독자 해소 욕구)을 만들었나, 아니면 기대를 넘는 회수를 했나? 축적된 기대감의 70%만 채우는 회수는 쾌감 희석. 이번 장이 소목표 사이클의 여파 단계라면 결과가 보이는가 — 감정 반응뿐 아니라 지위/관계/자원의 실제 변화로.`
        : `${base}检查欲望驱动：本章是否制造了情绪缺口（读者渴望释放）或完成了超出预期的兑现？只满足读者70%期待的兑现等于爽点虚化。如果本章处于小目标周期的后效阶段，检查是否展示了具体改变——不只是情绪反应，而是地位、关系或资源的实际变化。`;
  }

  if (id === 25) {
    return language === "en"
      ? "Cross-check character behavior against the 3-question test: (1) Why does the character do this? (2) Does it match their established profile? (3) Would a reader who only read prior chapters find it jarring? Also check if character's emotional state progresses or stagnates."
      : language === "ko"
        ? "캐릭터 행동 3문항 검사: (1) 왜 이 행동을 하나? (2) 기존 프로필과 맞나? (3) 앞 장만 본 독자가 어색해하겠나? 동시에 캐릭터 감정 상태가 진전 중인지 정체 중인지도 체크."
        : "人设三问检查：(1)角色为什么这么做？(2)符合之前建立的人设吗？(3)只看过前面章节的读者会觉得突兀吗？同时检查角色情绪弧线是否在推进还是停滞。";
  }

  switch (id) {
    case 6:
      // Phase 7 — hook-debt escalation. Reviewer now reads pending_hooks.md
      // not just for "is this hook undelivered" but for causal/temporal
      // debt escalation. The ledger's status column carries "过期 (距=…/半衰=…)"
      // and "受阻于 …" markers emitted by the stale/blocked detector; this
      // dimension tells the reviewer how to escalate them.
      return language === "en"
        ? `Hook-debt escalation (Phase 7 + hotfixes 2/3). Read the pending_hooks.md ledger and escalate based on the stale / blocked / core_hook / depends_on / promoted columns, NOT only on "undelivered hook present":

• Critical severity only applies to hooks with promoted=true in the ledger. A stale/blocked non-promoted hook stays at info — the promotion flag is the gate that keeps reviewer noise down, because architect-seed emits many non-load-bearing seeds.
• A promoted core_hook=true hook that has been stale for over 10 chapters → escalate from warning to critical. The book has only 3-7 core hooks; letting one drift that long is the lead symptom of narrative rot.
• A promoted hook whose status cell contains "blocked on X (blocked Y chapters)" with Y >= 6 → warning. The literal "blocked Y chapters" token comes straight from the ledger — read it, don't guess. Call out the upstream hook id so the planner can route the resolution.
• At volume end (final chapter of any volume per volume_map) a promoted core_hook that is still open or stale without explicit "carried over to volume N+1" planning → critical.
• Any non-promoted stale hook → info-level log; do not fail the chapter on it, but note it so the planner can schedule cleanup.

Quote the exact hook_id in description and include the stale / blocked marker text verbatim. Structure check only — do not judge hook prose quality.`
        : language === "ko"
          ? `Phase 7 훅-부채 승격 규칙(핫픽스 2/3 포함). pending_hooks.md 장부를 읽을 때 '미회수 훅이 있나'만 보지 말고, stale/blocked 마커, core_hook 열, depends_on 열, 승격 열을 읽으세요:

• critical 등급은 장부에서 승급=true인 훅에만 적용. 승급 안 된 stale/blocked 훅은 info 유지 — 승격 플래그가 노이즈 차단 스위치, 아키텍트 시드가 비부담 훅 씨앗을 대량 생성하기 때문.
• 승급=yes이고 core_hook=yes인 훅이 10장 이상 방치 → warning에서 critical로 승격. 전권 3-7개 핵심 훅 중 하나라도 이만큼 방치면 망조.
• 승급=yes인 차단된 훅, 상태 칸에 "X에 의해 차단 (Y장 차단)"이고 Y ≥ 6 → warning. "Y장 차단" 토큰은 장부에서 그대로 읽음, 추측 금지. 상류 hook_id를 명시해 플래너가 해결 경로 잡게 함.
• 권말(volume_map 상 아무 권의 마지막 장)에도 승급=yes인 주선 훅이 open/stale 상태로 있고 'N+1권으로 이월' 명시적 계획 없음 → critical.
• 승급=no인 stale 훅 → info 레벨 로그만, 챕터 실패로 처리 안 함, 플래너가 정리 일정 잡도록 기록만 남김.

description에 정확한 hook_id 인용하고, 장부의 stale/blocked 마커 원문 그대로 복사. 구조만 검사, 훅 문장 품질은 평가 안 함.`
          : `Phase 7 hook-debt 升级规则（含 hotfix 2/3）。阅读 pending_hooks.md 伏笔池时不要只看"有没有悬而未决的伏笔"，要读状态列中的 stale / blocked 标记、core_hook 列、depends_on 列、以及升级列：

• critical 级别仅适用于升级=是（promoted=true）的伏笔。非升级的 stale/blocked 伏笔一律保持 info——升级标志是降噪的开关，因为架构师阶段会产出大量非承重的伏笔种子。
• 升级=是且 core_hook=是 的伏笔过期超过 10 章未回收 → warning 升级为 critical。全书只有 3-7 条核心伏笔，任何一条漂移这么久都是烂尾前兆。
• 升级=是的受阻伏笔，状态列中"受阻于 X (已阻 Y 章)"且 Y ≥ 6 → warning。"已阻 Y 章"这个字面 token 直接读自账本，不要猜。描述中要写出具体的上游 hook_id，让 planner 能安排落地路径。
• 卷尾（volume_map 中任一卷的末章）仍有升级=是的主线伏笔处于 open 或 stale 且没有显式"延至下一卷"规划 → critical。
• 升级=否的 stale 伏笔 → info 级记录，不判本章失败，但保留以便 planner 安排清理。

description 中要明确引用 hook_id，并把状态列中 stale / blocked 的原文标记字面抄进去。本维度只审结构，不评价伏笔文笔。`;
    case 19:
      return language === "en"
        ? "Check whether POV shifts are signaled clearly and stay consistent with the configured viewpoint."
        : language === "ko"
          ? "시점 전환이 명확히 신호되는지, 설정된 시점과 일관되는지 확인."
          : "检查视角切换是否有过渡、是否与设定视角一致";
    case 24:
      return language === "en"
        ? "Cross-check subplot_board and chapter_summaries: flag any subplot that stays dormant long enough to feel abandoned, or a recent run where every subplot is only restated instead of genuinely moving."
        : language === "ko"
          ? "subplot_board와 chapter_summaries 대조: 방치되어 잊혀진 듯 한 지선, 혹은 최근 연속으로만 반복 언급되고 실질적 진전이 없는 지선 플래그."
          : "对照 subplot_board 和 chapter_summaries：标记那些沉寂到接近被遗忘的支线，或近期连续只被重复提及、没有真实推进的支线。";
    case 25:
      return language === "en"
        ? "Cross-check emotional_arcs and chapter_summaries: flag any major character whose emotional line holds one pressure shape across a run instead of taking new pressure, release, reversal, or reinterpretation. Distinguish unchanged circumstances from unchanged inner movement."
        : language === "ko"
          ? "emotional_arcs와 chapter_summaries 대조: 주요 인물의 감정선이 한동안 같은 압력 형태에만 머물러 있고 새 압력/해소/반전/재해석이 없는 경우 플래그. '처지 불변'과 '내심 불변' 구분."
          : "对照 emotional_arcs 和 chapter_summaries：标记主要角色在一段时间内始终停留在同一种情绪压力形态、没有新压力、释放、转折或重估的情况。注意区分'处境未变'和'内心未变'。";
    case 26:
      return language === "en"
        ? "Cross-check chapter_summaries for chapter-type distribution: warn when the recent sequence stays in the same mode long enough to flatten rhythm, or when payoff / release beats disappear for too long. Explicitly list the recent type sequence."
        : language === "ko"
          ? "chapter_summaries의 장 유형 분포 대조: 최근 시퀀스가 같은 모드에 오래 머물러 리듬을 평탄화하거나, 회수/해소/클라이맥스 장이 장기 부재하면 warning. 최근 장 유형 시퀀스 명시."
          : "对照 chapter_summaries 的章节类型分布：当近期章节长时间停留在同一种模式、把节奏压平，或回收/释放/高潮章节缺席过久时给出 warning。请明确列出最近章节的类型序列。";
    case 28:
      return language === "en"
        ? "Check whether spinoff events contradict the mainline canon constraints."
        : language === "ko"
          ? "스핀오프 이벤트가 본편 정전 제약과 모순되는지 확인."
          : "检查番外事件是否与正典约束表矛盾";
    case 29:
      return language === "en"
        ? "Check whether characters reference information that should only be revealed after the divergence point (see the information-boundary table)."
        : language === "ko"
          ? "캐릭터가 분기점 이후에만 밝혀져야 할 정보를 인용하는지 확인(정보 경계표 참조)."
          : "检查角色是否引用了分歧点之后才揭示的信息（参照信息边界表）";
    case 30:
      return language === "en"
        ? "Check whether the spinoff violates mainline world rules (power system, geography, factions)."
        : language === "ko"
          ? "스핀오프가 본편 세계 규칙(힘 체계, 지리, 세력)을 위반하는지 확인."
          : "检查番外是否违反正传世界规则（力量体系、地理、阵营）";
    case 31:
      return language === "en"
        ? "Check whether the spinoff resolves mainline hooks without authorization (warning level)."
        : language === "ko"
          ? "스핀오프가 본편 훅을 무단 회수하는지 확인(경고 수준)."
          : "检查番外是否越权回收正传伏笔（warning级别）";
    case 32:
      return language === "en"
        ? "Check whether the ending renews curiosity, whether promised payoffs are landing on the cadence their hooks imply, whether pressure gets any release, and whether reader expectation gaps are accumulating faster than they are being satisfied. If a climax just occurred, check whether the aftermath chapters show concrete change before starting a new cycle."
        : language === "ko"
          ? "엔딩이 호기심을 되살리는지, 약속된 회수가 훅 고유 리듬대로 떨어지는지, 압력이 해소되는지, 독자 기대 갭이 해소보다 빨리 쌓이는지 체크. 직전 클라이맥스였다면 여파 장들이 새 사이클 들어가기 전 구체적 변화를 보여주는지 확인."
          : "检查：章尾是否重新点燃好奇心，已经承诺的回收是否按伏笔自身节奏落地，压力是否得到释放，读者期待缺口是在持续累积还是在被满足。如果刚经历高潮，检查后效章节是否在开启新周期前展示了具体改变。";
    case 33:
      return language === "en"
        ? "Cross-check the chapter_memo provided with the chapter. Does the final prose deliver the memo's goal and leave a visible trace for every one of the 7 sections it contains (tasks, pay-offs / held-back cards, daily/transition function map, three-question check, end-of-chapter concrete changes, hard-don'ts)? Missing or contradicted sections -> critical. Note: a sparse memo (breather chapter, goal + skeleton body only) is legitimate — only flag drift against sections that the memo actually populates. Never flag the memo itself for being sparse."
        : language === "ko"
          ? "제공된 chapter_memo와 대조. 완고가 memo의 goal을 이행했나, 7개 섹션(임무, 회수/보류, 일상/전환 기능, 핵심 선택 3문항, 장끝 필수 변화, 금기) 각각에 가시적 흔적을 남겼나? 누락/모순 섹션 → critical. 참고: 희소 memo 합법(숨고르기 장은 goal + 뼈대 body 가능), memo가 실제 쓴 섹션만 드리프트 체크, memo 자체가 희소하다고 incomplete 판정 금지."
          : "对照随章提供的 chapter_memo。成稿是否兑现了 memo 中的 goal，并在 7 段正文（当前任务 / 该兑现·暂不掀 / 日常过渡功能 / 关键抉择三连问 / 章尾必须发生的改变 / 不要做 等）中留下可见落地痕迹？任何段落缺失或被写反 → critical。提醒：稀疏 memo 合法（喘息章 memo 可以只有 goal + 骨架 body），只检查 memo 实际写出的段落，不能因为 memo 稀疏就判 incomplete。";
    case 34:
    case 35:
    case 36:
    case 37: {
      if (!fanficConfig) return "";
      const severity = fanficConfig.severityOverrides.get(id) ?? "warning";
      const baseNote = language === "en"
        ? {
            34: "Check whether dialogue tics, speaking style, and behavior remain consistent with the character dossiers in fanfic_canon.md. Deviations need clear situational motivation.",
            35: "Check whether the chapter violates world rules documented in fanfic_canon.md (geography, power system, faction relations).",
            36: "Check whether relationship beats remain plausible and aligned with, or meaningfully develop from, the key relationships documented in fanfic_canon.md.",
            37: "Check whether the chapter contradicts the key event timeline in fanfic_canon.md.",
          }[id]
        : language === "ko"
          ? {
              34: "대사 습관, 화법, 행동이 fanfic_canon.md 캐릭터 도감과 일관되는지 확인. 이탈엔 명확한 상황적 동기 필요.",
              35: "장이 fanfic_canon.md에 기록된 세계 규칙(지리, 힘 체계, 세력 관계)을 위반하는지 확인.",
              36: "관계 비트가 fanfic_canon.md에 기록된 핵심 관계들과 개연성 있게 유지되거나 의미 있게 발전하는지 확인.",
              37: "장이 fanfic_canon.md의 핵심 사건 타임라인과 모순되는지 확인.",
            }[id]
          : FANFIC_DIMENSIONS.find((dimension) => dimension.id === id)?.baseNote;

      return baseNote
        ? `${baseNote} ${formatFanficSeverityNote(severity, language)}`
        : "";
    }
    default:
      return "";
  }
}

function buildDimensionList(
  gp: GenreProfile,
  bookRules: BookRules | null,
  language: PromptLanguage,
  hasParentCanon = false,
  fanficMode?: FanficMode,
): ReadonlyArray<{ readonly id: number; readonly name: string; readonly note: string }> {
  const activeIds = new Set(gp.auditDimensions);

  // Add book-level additional dimensions (supports both numeric IDs and name strings)
  if (bookRules?.additionalAuditDimensions) {
    // Build reverse lookup: name → id
    const nameToId = new Map<string, number>();
    for (const [id, labels] of Object.entries(DIMENSION_LABELS)) {
      nameToId.set(labels.zh, Number(id));
      nameToId.set(labels.en, Number(id));
    }

    for (const d of bookRules.additionalAuditDimensions) {
      if (typeof d === "number") {
        activeIds.add(d);
      } else if (typeof d === "string") {
        // Try exact match first, then substring match
        const exactId = nameToId.get(d);
        if (exactId !== undefined) {
          activeIds.add(exactId);
        } else {
          // Fuzzy: find dimension whose name contains the string
          for (const [name, id] of nameToId) {
            if (name.includes(d) || d.includes(name)) {
              activeIds.add(id);
              break;
            }
          }
        }
      }
    }
  }

  // Always-active dimensions
  activeIds.add(32); // 读者期待管理 — universal
  activeIds.add(33); // 章节备忘偏离 — universal (replaces legacy volume-outline drift)

  // Conditional overrides
  if (gp.eraResearch || bookRules?.eraConstraints?.enabled) {
    activeIds.add(12);
  }

  // Spinoff dimensions — activated when parent_canon.md exists (but NOT in fanfic mode)
  if (hasParentCanon && !fanficMode) {
    activeIds.add(28); // 正传事件冲突
    activeIds.add(29); // 未来信息泄露
    activeIds.add(30); // 世界规则跨书一致性
    activeIds.add(31); // 番外伏笔隔离
  }

  // Fanfic dimensions — replace spinoff dims with fanfic-specific checks
  let fanficConfig: ReturnType<typeof getFanficDimensionConfig> | undefined;
  if (fanficMode) {
    fanficConfig = getFanficDimensionConfig(fanficMode, bookRules?.allowedDeviations);
    for (const id of fanficConfig.activeIds) {
      activeIds.add(id);
    }
    for (const id of fanficConfig.deactivatedIds) {
      activeIds.delete(id);
    }
  }

  const dims: Array<{ id: number; name: string; note: string }> = [];

  for (const id of [...activeIds].sort((a, b) => a - b)) {
    const name = dimensionName(id, language);
    if (!name) continue;

    const note = buildDimensionNote(id, language, gp, bookRules, fanficMode, fanficConfig);

    dims.push({ id, name, note });
  }

  return dims;
}

export class ContinuityAuditor extends BaseAgent {
  get name(): string {
    return "continuity-auditor";
  }

  async auditChapter(
    bookDir: string,
    chapterContent: string,
    chapterNumber: number,
    genre?: string,
    options?: {
      temperature?: number;
      chapterIntent?: string;
      chapterMemo?: ChapterMemo;
      contextPackage?: ContextPackage;
      ruleStack?: RuleStack;
      truthFileOverrides?: {
        currentState?: string;
        ledger?: string;
        hooks?: string;
      };
    },
  ): Promise<AuditResult> {
    const [diskCurrentState, diskLedger, diskHooks, styleGuideRaw, subplotBoard, emotionalArcs, characterMatrix, chapterSummaries, parentCanon, fanficCanon, volumeOutline] =
      await Promise.all([
        // Phase 5 consolidation: derive initial state from roles + seed hooks
        // when current_state.md is still the architect seed placeholder.
        readCurrentStateWithFallback(bookDir, "(文件不存在)"),
        this.readFileSafe(join(bookDir, "story/particle_ledger.md")),
        this.readFileSafe(join(bookDir, "story/pending_hooks.md")),
        this.readFileSafe(join(bookDir, "story/style_guide.md")),
        this.readFileSafe(join(bookDir, "story/subplot_board.md")),
        this.readFileSafe(join(bookDir, "story/emotional_arcs.md")),
        readCharacterContext(bookDir, "(文件不存在)"),
        this.readFileSafe(join(bookDir, "story/chapter_summaries.md")),
        this.readFileSafe(join(bookDir, "story/parent_canon.md")),
        this.readFileSafe(join(bookDir, "story/fanfic_canon.md")),
        readVolumeMap(bookDir, "(文件不存在)"),
      ]);
    const currentState = options?.truthFileOverrides?.currentState ?? diskCurrentState;
    const ledger = options?.truthFileOverrides?.ledger ?? diskLedger;
    const hooks = options?.truthFileOverrides?.hooks ?? diskHooks;

    const hasParentCanon = parentCanon !== "(文件不存在)";
    const hasFanficCanon = fanficCanon !== "(文件不存在)";

    // Load last chapter full text for fine-grained continuity checking
    const previousChapter = await this.loadPreviousChapter(bookDir, chapterNumber);

    // Load genre profile and book rules
    const genreId = genre ?? "other";
    const [{ profile: gp }, bookLanguage] = await Promise.all([
      readGenreProfile(this.ctx.projectRoot, genreId),
      readBookLanguage(bookDir),
    ]);
    const parsedRules = await readBookRules(bookDir);
    const bookRules = parsedRules?.rules ?? null;

    // Fallback: use book_rules body when style_guide.md doesn't exist.
    // Phase 5 hotfix 2: parsedRules.body is only populated for legacy
    // book_rules.md sources — story_frame.md frontmatter yields an empty
    // body, and an empty string is NOT a usable style guide. Treat
    // missing/empty body as "no fallback available".
    const legacyRulesBody = parsedRules?.body?.trim();
    const styleGuide = styleGuideRaw !== "(文件不存在)"
      ? styleGuideRaw
      : (legacyRulesBody || "(无文风指南)");

    const resolvedLanguage = bookLanguage ?? gp.language;
    const isEnglish = resolvedLanguage === "en";
    const fanficMode = hasFanficCanon ? (bookRules?.fanficMode as FanficMode | undefined) : undefined;
    const dimensions = buildDimensionList(gp, bookRules, resolvedLanguage, hasParentCanon, fanficMode);
    const dimList = dimensions
      .map((d) => `${d.id}. ${d.name}${d.note ? (isEnglish ? ` (${d.note})` : `（${d.note}）`) : ""}`)
      .join("\n");
    const genreLabel = resolveGenreLabel(genreId, gp.name, resolvedLanguage);

    const protagonistBlock = bookRules?.protagonist
      ? isEnglish
        ? `\n\nProtagonist lock: ${bookRules.protagonist.name}; personality locks: ${joinLocalized(bookRules.protagonist.personalityLock, resolvedLanguage)}; behavioral constraints: ${joinLocalized(bookRules.protagonist.behavioralConstraints, resolvedLanguage)}.`
        : `\n主角人设锁定：${bookRules.protagonist.name}，${bookRules.protagonist.personalityLock.join("、")}，行为约束：${bookRules.protagonist.behavioralConstraints.join("、")}`
      : "";

    const searchNote = gp.eraResearch
      ? isEnglish
        ? "\n\nYou have web-search capability (search_web / fetch_url). For real-world eras, people, events, geography, or policies, you must verify with search_web instead of relying on memory. Cross-check at least 2 sources."
        : "\n\n你有联网搜索能力（search_web / fetch_url）。对于涉及真实年代、人物、事件、地理、政策的内容，你必须用search_web核实，不可凭记忆判断。至少对比2个来源交叉验证。"
      : "";

    const systemPromptBase = isEnglish
      ? `You are a strict ${genreLabel} web-fiction structural editor. Audit the chapter for completion and structure, not for prose craft. ALL OUTPUT MUST BE IN ENGLISH.${protagonistBlock}${searchNote}

## Reviewer Scope (hard constraints)

You audit completion and structure only. Your job is to decide whether the chapter delivers the plan, keeps characters and timelines intact, and moves the book forward. Wording, sentence rhythm, paragraph shape, punctuation, imagery, and other prose-surface choices are NOT yours — those belong to the Polisher pass that runs after you. If you notice prose-surface issues, you may flag them with severity "info" so the Polisher can see them, but they do not count toward passed / overall_score and they must never be critical.

You audit twelve structural reader-pain patterns: dragging / flat openings, blurry worldbuilding disconnected from reality, contradictory character setup, tangled POV, mainline drift or stagnation, weak conflict with missing payoff, pacing loss of control and abrupt transitions, character inconsistency across the arc, thin/one-note characters without contrast, stiff emotion expression and abrupt relationship jumps, imbalanced cheats/power gifts, and settings that never land in concrete action. Alongside these, keep the engineering dimensions listed below (OOC, timeline coherence, information boundary, hook debt, cross-chapter repetition, lexical fatigue, length band, title fatigue, paragraph shape).

Sparse chapter_memo is legitimate. Breather / aftermath / transition chapters may ship a memo that only contains goal + a skeleton body — do NOT flag such memos as incomplete, and do NOT penalise the chapter for lacking content against sections the memo itself does not populate. Judge drift only against what the memo actually says.

If the chapter memo, rule stack, or supplied context specifies content proportions between lines (politics/romance, career/relationship, case/character, etc.), audit whether those lines appear as actual scenes, dialogue, action, or relationship movement. A line that is only summarized in one sentence counts as missing. Mark it critical only when the memo explicitly required it for this chapter.

For every issue, set repair_scope as a typed routing hint: "local" for wording, paragraph shape, small repetition, or narrow sentence-level fixes; "structural" for plot drift, timeline break, missing scene/payoff, character logic collapse, POV/knowledge boundary failure, or anything requiring a rewritten scene/chapter; "unknown" only when you genuinely cannot decide.

Audit dimensions:
${dimList}

Output format MUST be JSON:
{
  "passed": true/false,
  "overall_score": 0-100,
  "issues": [
	    {
	      "severity": "critical|warning|info",
	      "repair_scope": "local|structural|unknown",
	      "category": "dimension name",
	      "description": "specific issue description",
	      "suggestion": "fix suggestion"
	    }
  ],
  "summary": "one-sentence audit conclusion"
}

passed is false ONLY when critical-severity issues exist.

overall_score calibration:
- 95-100: Publishable as-is, no noticeable issues
- 85-94: Minor blemishes but smooth reading, the reader won't break immersion
- 75-84: Noticeable problems but the story backbone holds, needs revision but not urgent
- 65-74: Multiple issues hurt the reading experience, pacing or continuity has gaps
- < 65: Structural breakdown, needs major rewrite
Score holistically — do not let a single minor issue tank the score.`
      : `你是一位严格的${gp.name}网络小说结构审稿编辑。你只审完成度 + 结构，不审文笔。${protagonistBlock}${searchNote}

## 审稿边界（硬约束）

你不审文笔、不审排版、不审句式——这些归 Polisher。你发现的文笔问题只能以 severity="info" 标注供 Polisher 参考，不计入 reviewer 的 passed/overall_score，也绝不可标为 critical。

你审 12 条结构类雷点：开篇拖沓/平淡、世界观模糊脱现实、人设矛盾、视角杂乱、主线偏离/停滞、冲突乏力爽点缺失、节奏失控过渡生硬、人设前后矛盾、人物单薄无反差、情感表达生硬/关系突兀、金手指失衡、设定无落地。同时保留工程维度（OOC、timeline 一致、信息越界、hook-debt、跨章重复、词汇疲劳、章节字数、标题疲劳、段落形状）。

稀疏 memo 是合法状态。喘息章 / 后效章 / 过渡章的 memo 可以只有 goal + 骨架 body——此类 memo 不判 incomplete，也不能因为 memo 没写的段落就扣成稿的分。只按 memo 实际写出来的内容判偏离。

如果章节备忘、规则栈或输入上下文明确指定多条剧情线的比例（权谋/感情、事业/恋爱、案件/人物等），要审它们是否真正落成了场景、对话、行动或关系变化。只用一句总结带过的线，视为缺失。只有当 memo 明确要求本章必须推进该线时，才标 critical。

每条 issue 必须给 repair_scope 作为 typed 路由提示："local" 表示措辞、段落形状、小重复、句段级小修；"structural" 表示主线偏离、时间线断裂、场面/回报缺失、人物逻辑崩、视角/信息边界失败，或任何需要重写场景/整章的问题；只有确实无法判断时才写 "unknown"。

审查维度：
${dimList}

输出格式必须为 JSON：
{
  "passed": true/false,
  "overall_score": 0-100,
  "issues": [
	    {
	      "severity": "critical|warning|info",
	      "repair_scope": "local|structural|unknown",
	      "category": "审查维度名称",
	      "description": "具体问题描述",
	      "suggestion": "修改建议"
	    }
  ],
  "summary": "一句话总结审查结论"
}

只有当存在 critical 级别问题时，passed 才为 false。

overall_score 评分校准：
- 95-100：可直接发布，无明显问题
- 85-94：有小瑕疵但整体流畅可读，读者不会出戏
- 75-84：有明显问题但故事主干完整，需要修但不紧急
- 65-74：多处影响阅读体验的问题，节奏或连续性有断裂
- < 65：结构性问题，需要大幅重写
综合评分，不要因为单一小问题大幅拉低分数。`;
    const systemPrompt = await this.withPromptPackGuidance(systemPromptBase, "longform.auditor");

    const ledgerBlock = gp.numericalSystem
      ? isEnglish
        ? `\n## Resource Ledger\n${ledger}`
        : `\n## 资源账本\n${ledger}`
      : "";

    // Smart context filtering for auditor — same logic as writer
    const bookRulesForFilter = parsedRules?.rules ?? null;
    const filteredSubplots = filterSubplots(subplotBoard);
    const filteredArcs = filterEmotionalArcs(emotionalArcs, chapterNumber);
    const filteredMatrix = filterCharacterMatrix(characterMatrix, volumeOutline, bookRulesForFilter?.protagonist?.name);
    const filteredSummaries = filterSummaries(chapterSummaries, chapterNumber);
    const filteredHooks = filterHooks(hooks);

    const governedMemoryBlocks = options?.contextPackage
      ? buildGovernedMemoryEvidenceBlocks(options.contextPackage, resolvedLanguage)
      : undefined;

    const hooksBlock = governedMemoryBlocks?.hooksBlock
      ?? (filteredHooks !== "(文件不存在)"
        ? isEnglish
          ? `\n## Pending Hooks\n${filteredHooks}\n`
          : `\n## 伏笔池\n${filteredHooks}\n`
        : "");
    const subplotBlock = filteredSubplots !== "(文件不存在)"
      ? isEnglish
        ? `\n## Subplot Board\n${filteredSubplots}\n`
        : `\n## 支线进度板\n${filteredSubplots}\n`
      : "";
    const emotionalBlock = filteredArcs !== "(文件不存在)"
      ? isEnglish
        ? `\n## Emotional Arcs\n${filteredArcs}\n`
        : `\n## 情感弧线\n${filteredArcs}\n`
      : "";
    const matrixBlock = filteredMatrix !== "(文件不存在)"
      ? isEnglish
        ? `\n## Character Interaction Matrix\n${filteredMatrix}\n`
        : `\n## 角色交互矩阵\n${filteredMatrix}\n`
      : "";
    const summariesBlock = governedMemoryBlocks?.summariesBlock
      ?? (filteredSummaries !== "(文件不存在)"
        ? isEnglish
          ? `\n## Chapter Summaries (for pacing checks)\n${filteredSummaries}\n`
          : `\n## 章节摘要（用于节奏检查）\n${filteredSummaries}\n`
        : "");
    const volumeSummariesBlock = governedMemoryBlocks?.volumeSummariesBlock ?? "";

    const canonBlock = hasParentCanon
      ? isEnglish
        ? `\n## Mainline Canon Reference (for spinoff audit)\n${parentCanon}\n`
        : `\n## 正传正典参照（番外审查专用）\n${parentCanon}\n`
      : "";

    const fanficCanonBlock = hasFanficCanon
      ? isEnglish
        ? `\n## Fanfic Canon Reference (for fanfic audit)\n${fanficCanon}\n`
        : `\n## 同人正典参照（同人审查专用）\n${fanficCanon}\n`
      : "";

    const memoBlock = options?.chapterMemo
      ? isEnglish
        ? `\n## Chapter Memo (for memo drift checks)\nGoal: ${options.chapterMemo.goal}\n\n${options.chapterMemo.body}\n`
        : `\n## 章节备忘（用于 memo 偏离检测）\ngoal：${options.chapterMemo.goal}\n\n${options.chapterMemo.body}\n`
      : "";
    const reducedControlBlock = options?.chapterIntent && options.contextPackage && options.ruleStack
      ? this.buildReducedControlBlock(options.chapterIntent, options.contextPackage, options.ruleStack, resolvedLanguage)
      : "";
    const styleGuideBlock = reducedControlBlock.length === 0
      ? isEnglish
        ? `\n## Style Guide\n${styleGuide}`
        : `\n## 文风指南\n${styleGuide}`
      : "";

    const prevChapterBlock = previousChapter
      ? isEnglish
        ? `\n## Previous Chapter Full Text (for transition checks)\n${previousChapter}\n`
        : `\n## 上一章全文（用于衔接检查）\n${previousChapter}\n`
      : "";

    const userPrompt = isEnglish
      ? `Review chapter ${chapterNumber}.

## Current State Card
${currentState}
${ledgerBlock}
${hooksBlock}${volumeSummariesBlock}${subplotBlock}${emotionalBlock}${matrixBlock}${summariesBlock}${canonBlock}${fanficCanonBlock}${reducedControlBlock}${memoBlock}${prevChapterBlock}${styleGuideBlock}

## Chapter Content Under Review
${chapterContent}`
      : `请审查第${chapterNumber}章。

## 当前状态卡
${currentState}
${ledgerBlock}
${hooksBlock}${volumeSummariesBlock}${subplotBlock}${emotionalBlock}${matrixBlock}${summariesBlock}${canonBlock}${fanficCanonBlock}${reducedControlBlock}${memoBlock}${prevChapterBlock}${styleGuideBlock}

## 待审章节内容
${chapterContent}`;

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];
    const chatOptions = { temperature: options?.temperature ?? 0.3 };

    // Use web search for fact verification when eraResearch is enabled
    const response = gp.eraResearch
      ? await this.chatWithSearch(chatMessages, chatOptions)
      : await this.chat(chatMessages, chatOptions);

    const result = this.parseAuditResult(response.content, resolvedLanguage);
    return { ...result, tokenUsage: response.usage };
  }

  private parseAuditResult(content: string, language: PromptLanguage): AuditResult {
    // Try multiple JSON extraction strategies (handles small/local models)

    // Strategy 1: Find balanced JSON object (not greedy)
    const balanced = this.extractBalancedJson(content);
    if (balanced) {
      const result = this.tryParseAuditJson(balanced, language);
      if (result) return result;
    }

    // Strategy 2: Try the whole content as JSON (some models output pure JSON)
    const trimmed = content.trim();
    if (trimmed.startsWith("{")) {
      const result = this.tryParseAuditJson(trimmed, language);
      if (result) return result;
    }

    // Strategy 3: Look for ```json code blocks
    const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      const result = this.tryParseAuditJson(codeBlockMatch[1]!.trim(), language);
      if (result) return result;
    }

    // Strategy 4: Try to extract individual fields via regex (last resort fallback)
    const passedMatch = content.match(/"passed"\s*:\s*(true|false)/);
    const issuesMatch = content.match(/"issues"\s*:\s*\[([\s\S]*?)\]/);
    const summaryMatch = content.match(/"summary"\s*:\s*"([^"]*)"/);
    if (passedMatch) {
      const issues: AuditIssue[] = [];
      if (issuesMatch) {
        // Try to parse individual issue objects
        const issuePattern = /\{[^{}]*"severity"\s*:\s*"[^"]*"[^{}]*\}/g;
        let match: RegExpExecArray | null;
        while ((match = issuePattern.exec(issuesMatch[1]!)) !== null) {
          try {
            const issue = JSON.parse(match[0]);
	            issues.push({
	              severity: issue.severity ?? "warning",
	              category: issue.category ?? (language === "en" ? "Uncategorized" : "未分类"),
	              description: issue.description ?? "",
	              suggestion: issue.suggestion ?? "",
	              repairScope: normalizeRepairScope(issue.repair_scope ?? issue.repairScope),
	            });
          } catch {
            // skip malformed individual issue
          }
        }
      }
      return {
        passed: passedMatch[1] === "true",
        issues,
        summary: summaryMatch?.[1] ?? "",
      };
    }

    return {
      passed: false,
      parseFailed: true,
      issues: [{
        severity: "critical",
        category: language === "en" ? "System Error" : "系统错误",
        description: language === "en"
          ? "Audit output format was invalid and could not be parsed as JSON."
          : "审稿输出格式异常，无法解析为 JSON",
        suggestion: language === "en"
          ? "The model may not support reliable structured output. Try a stronger model or inspect the API response format."
          : "可能是模型不支持结构化输出。尝试换一个更大的模型，或检查 API 返回格式。",
      }],
      summary: language === "en" ? "Audit output parsing failed" : "审稿输出解析失败",
    };
  }

  private buildReducedControlBlock(
    chapterIntent: string,
    contextPackage: ContextPackage,
    ruleStack: RuleStack,
    language: PromptLanguage,
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

  private extractBalancedJson(text: string): string | null {
    const start = text.indexOf("{");
    if (start === -1) return null;
    let depth = 0;
    for (let i = start; i < text.length; i++) {
      if (text[i] === "{") depth++;
      if (text[i] === "}") depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
    return null;
  }

  private tryParseAuditJson(json: string, language: PromptLanguage = "zh"): AuditResult | null {
    try {
      const parsed = JSON.parse(json);
      if (typeof parsed.passed !== "boolean" && parsed.passed !== undefined) return null;
      const rawScore = parsed.overall_score ?? parsed.overallScore;
      const overallScore = typeof rawScore === "number" && Number.isFinite(rawScore)
        ? Math.round(Math.max(0, Math.min(100, rawScore)))
        : undefined;
      return {
        passed: Boolean(parsed.passed ?? false),
        issues: Array.isArray(parsed.issues)
	          ? parsed.issues.map((i: Record<string, unknown>) => ({
	              severity: (i.severity as string) ?? "warning",
	              category: (i.category as string) ?? (language === "en" ? "Uncategorized" : "未分类"),
	              description: (i.description as string) ?? "",
	              suggestion: (i.suggestion as string) ?? "",
	              repairScope: normalizeRepairScope(i.repair_scope ?? i.repairScope),
	            }))
          : [],
        summary: String(parsed.summary ?? ""),
        overallScore,
      };
    } catch {
      return null;
    }
  }

  private async loadPreviousChapter(bookDir: string, currentChapter: number): Promise<string> {
    if (currentChapter <= 1) return "";
    const chaptersDir = join(bookDir, "chapters");
    try {
      const files = await readdir(chaptersDir);
      const paddedPrev = String(currentChapter - 1).padStart(4, "0");
      const prevFile = files.find((f) => f.startsWith(paddedPrev) && f.endsWith(".md"));
      if (!prevFile) return "";
      return await readFile(join(chaptersDir, prevFile), "utf-8");
    } catch {
      return "";
    }
  }

  private async readFileSafe(path: string): Promise<string> {
    try {
      return await readFile(path, "utf-8");
    } catch {
      return "(文件不存在)";
    }
  }
}
