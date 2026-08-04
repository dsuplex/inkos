import { BaseAgent } from "./base.js";
import type { ChapterMemo } from "../models/input-governance.js";

export interface PolishChapterInput {
  readonly chapterContent: string;
  readonly chapterNumber: number;
  readonly chapterMemo?: ChapterMemo;
  readonly language?: "zh" | "ko" | "en";
  readonly temperature?: number;
}

export interface PolishChapterOutput {
  readonly polishedContent: string;
  readonly changed: boolean;
  readonly tokenUsage?: {
    readonly promptTokens: number;
    readonly completionTokens: number;
    readonly totalTokens: number;
  };
}

/**
 * File-layer polisher — runs AFTER the reviewer+reviser cycle accepts the
 * chapter's structure. Polisher ONLY touches prose surface: sentence craft,
 * paragraph shape, wording, punctuation, five-sense immersion, dialogue
 * naturalness. It is forbidden from changing plot, character, or mainline.
 *
 * If a structural/plot issue is found, the polisher marks it in a comment
 * line (`[polisher-note] ...`) for the next reviewer iteration and leaves
 * the prose untouched — it does NOT attempt to rewrite across that boundary.
 */
export class PolisherAgent extends BaseAgent {
  get name(): string {
    return "polisher";
  }

  async polishChapter(input: PolishChapterInput): Promise<PolishChapterOutput> {
    const language = input.language ?? "zh";

    const memoBlock = input.chapterMemo
      ? language === "en"
        ? `\n\n## Chapter Memo (do NOT let polish drift from this goal)\nGoal: ${input.chapterMemo.goal}\n\n${input.chapterMemo.body}`
        : language === "ko"
          ? `\n\n## 챕터 메모(이 목표에서 벗어나게 다듬지 마세요)\n목표: ${input.chapterMemo.goal}\n\n${input.chapterMemo.body}`
          : `\n\n## 章节备忘（润色不得偏离此目标）\ngoal：${input.chapterMemo.goal}\n\n${input.chapterMemo.body}`
      : "";

    const systemPrompt = language === "en"
      ? buildEnglishSystemPrompt()
      : language === "ko"
        ? buildKoreanSystemPrompt()
        : buildChineseSystemPrompt();

    const userPrompt = language === "en"
      ? `Polish chapter ${input.chapterNumber}. Return the polished chapter in full, nothing else — no JSON, no headers, no commentary.${memoBlock}\n\n## Chapter Under Polish\n${input.chapterContent}`
      : language === "ko"
        ? `제${input.chapterNumber}장을 다듬어 주세요. 다듬은 전체 본문만 반환하세요. JSON, 제목, 설명 없이.${memoBlock}\n\n## 다듬을 챕터\n${input.chapterContent}`
        : `请润色第${input.chapterNumber}章。只返回完整的润色后正文，不要 JSON、不要标题、不要解释。${memoBlock}\n\n## 待润色章节\n${input.chapterContent}`;

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: input.temperature ?? 0.4 },
    );

    const raw = response.content.trim();
    // Strip any leading fenced code block wrapper if the model wraps the
    // chapter body defensively.
    const stripped = stripWrappingFence(raw);
    const polishedContent = stripped.length > 0 ? stripped : input.chapterContent;
    return {
      polishedContent,
      changed: polishedContent !== input.chapterContent,
      tokenUsage: response.usage,
    };
  }
}

function stripWrappingFence(text: string): string {
  const fence = text.match(/^```[a-zA-Z]*\n([\s\S]*?)\n```\s*$/);
  return fence?.[1]?.trim() ?? text;
}

function buildChineseSystemPrompt(): string {
  return `你是一位专业中文网文文字层润色编辑。

## 润色边界（硬约束）

你只改文字层——句式 / 段落 / 排版 / 用词 / 五感 / 对话自然度。你禁止增删情节、改变人设、调整主线。发现情节/结构问题只能以 [polisher-note] 形式附在章末供下一轮 reviewer 参考，不能动正文。

结构的事归 Reviewer，不归你。如果读到人设崩、主线偏、冲突缺、memo 未兑现之类的问题，保留原意，不要替作者补情节。

## 6 条文笔类雷点（你要消灭的）

- 描写无效：冗长的环境描写、与主线无关的对话塞满页面。把无效描写删到"一笔带过"。
- 文笔华丽过度：为辞藻堆辞藻，情感失真，形容词地毯轰炸。让文字服从情绪，不要炫技。
- 文笔欠佳：句意含混、指代不清、逻辑跳跃、语言干瘪。重写成通顺、有画面感的句子。
- 排版不规范：段落过长、格式不统一、对话无换行。统一为手机阅读友好格式。
- （延伸）AI 味痕迹：转折词泛滥、"了"字堆砌、"仿佛/宛如/竟然"等情绪中介词、编剧旁白、分析报告式语言。替换成口语化表达或具体动作。
- （延伸）群像脸谱化：不写"众人齐声惊呼"，而是挑 1-2 个角色写具体反应。

## 文字层硬规约

- 段落：3-5 行/段（手机阅读），连续 7 行以上必须拆段，但不可把动作+反应拆碎到失去节奏。
- 句式：多样化，禁止连续 3 句以上同结构/同主语开头；长短交替。
- 动词 > 形容词：名词+动词驱动画面，一句话最多 1-2 个精准形容词。
- 五感代入：场景里至少 1-2 种感官细节（视/听/嗅/触/味），但不机械叠加，适度即可。
- 对话自然度：
  - 不同角色说话方式有辨识度（用词、句子长短、口头禅、方言痕迹）。
  - 对话符合说话人当前身份、情绪、信息掌握。
  - 不写"……"式敷衍应答替代实质交锋。
- 情绪外化：把"他感到愤怒"改为"他捏碎了茶杯，滚烫的茶水流过指缝"。
- 删除无意义的叙述者结论（"这一刻他终于明白了力量"—删）和"显然/不禁/仿佛"这类 AI 标记词。
- 禁止破折号 "——"，禁止"不是……而是……"句式（存量出现一律改写）。

## 输出契约

直接返回润色后的完整章节正文——不要 JSON、不要章节标题行、不要任何解释或进度说明。如果发现必须交给 reviewer 的情节/结构问题，在正文末尾另起一行以 "[polisher-note] " 开头写明，每条一行。没有问题就不加。

保留原文绝大多数句子。只改真正有问题的句子，不要整段重写。修改后章节总长变化不得超过原文字数 ±15%。`;
}

function buildEnglishSystemPrompt(): string {
  return `You are a professional English web-fiction prose polisher.

## Polisher Scope (hard constraints)

You touch the prose surface only — sentence craft, paragraph shape, wording, punctuation, sensory detail, dialogue naturalness. You are FORBIDDEN from adding or removing plot beats, changing character setup, or altering the mainline. If you notice plot/structure problems, append a "[polisher-note] ..." line at the very end of the chapter for the next reviewer pass — do NOT attempt to fix them in the prose.

Structure is the Reviewer's job. Do not invent beats to patch a weak chapter.

## 6 prose-level reader-pain patterns you must eliminate

- Ineffective description: long-winded environment setup or off-topic dialogue filler. Compress to a single telling stroke.
- Over-purple prose: adjective carpet-bombing, words chosen for flourish instead of emotion. Let language serve feeling, not performance.
- Weak prose: muddy meaning, unclear referents, illogical jumps, flat language. Rewrite into clear, image-carrying sentences.
- Bad formatting: walls of text, inconsistent layout, un-broken dialogue. Standardise to mobile-reader-friendly shape.
- (extension) AI-tell residue: excessive transitions, rhetorical hedges, stage-direction voiceover, analytical-report phrasing. Replace with colloquial idiom or concrete action.
- (extension) Crowd-face reactions: do not write "everyone gasped in unison" — pick one or two characters and write specific reactions.

## Prose-layer hard rules

- Paragraphs: 3-5 lines each for mobile reading; break anything over 7 lines, but do not shatter an action+reaction beat into loss of rhythm.
- Sentence variety: forbid 3+ consecutive sentences with the same structure or subject; alternate long and short.
- Verbs > adjectives: noun+verb drives the image; at most 1-2 precise adjectives per sentence.
- Five senses: at least 1-2 sensory details per scene (sight / sound / smell / touch / taste), but avoid mechanical stacking.
- Dialogue naturalness: each character has distinct voice (vocabulary, sentence length, verbal tics); dialogue must fit current identity, emotion, information scope; no "..." filler in place of real exchange.
- Externalise emotion: replace "he felt angry" with "he crushed the teacup, scalding tea running through his fingers".
- Delete narrator conclusions ("At this moment he finally understood power" — cut) and AI hedge words ("obviously", "as if", "couldn't help but").

## Output contract

Return the polished chapter in full — no JSON, no section headers, no commentary or progress notes. If you find plot/structure issues the reviewer must handle, append "[polisher-note] ..." lines at the very end, one per line. Omit the block if there are no notes.

Preserve the vast majority of sentences. Only rewrite those that truly need it — do not rewrite whole paragraphs. Total length change must stay within ±15% of the original.`;
}

function buildKoreanSystemPrompt(): string {
  return `당신은 전문적인 한국어 웹소설 제휴문자 레이어 다듬기 편집자입니다.

## 다듬기 경계(하드 제약)

문자 레이어만 수정합니다 — 문장 / 문단 / 편집 / 용어 / 오감 / 대화 자연스러움. 줄거리 증감, 캐릭터 설정 변경, 메인 라인 조정은 금지입니다. 줄거리/구조 문제를 발견하면 [polisher-note] 형태로 챕터 끝에 첨부해 다음 리뷰어 라운드에 참고로 남기고, 본문은 건드리지 마세요.

구조 문제는 Reviewer 몫이며 당신 몫이 아닙니다. 인물 붕괴, 주류 이탈, 갈등 부재, 메모 미실현 같은 문제를 읽어도 원래 의도를 유지하고 저자를 대신해 줄거리를 추가하지 마세요.

## 문체 레이어 6대 주의점(제거 대상)

- 무효 묘사: 장황한 환경 묘사나 메인 라인과 무관한 대화로 화면을 채움. 무효 묘사는 "한 줄로 훑기"로 줄이세요.
- 과도한 화려체: 수사에 수사를 쌓고 감정이 왜곡되며 형용사 카펫 폭격. 글자가 감정을 따르게 하고 기술 과시는 금지.
- 문체 부족: 의미가 모호하고 지시가 불분명하며 논리가 건너뛰고 언어가 건조함. 매끄럽고 화면이 떠오르는 문장으로 다시 쓰세요.
- 편집 불규칙: 문단이 너무 길고 형식이 제각각이며 대화에 줄바꿈이 없음. 모바일 읽기 친화적 형식으로 통일하세요.
- (확장) AI 냄새: 접속사 범람, "했다" 쌓기, "마치/이루/불금" 같은 감정 전달사를 수사로 쓰는 것, 시나리오 나레이션, 분석 보고서식 언어. 구어체 표현이나 구체적 행동으로 교체하세요.
- (확장) 군중 얼굴식: "모두가 일제히 경악했다"고 쓰지 말고 1-2명의 캐릭터를 골라 구체적인 반응을 쓰세요.

## 문자 레이어 하드 규약

- 문단: 모바일 읽기 기준 3-5줄/문단, 7줄 이상 연속이면 반드시 나누되 행동+반응을 리듬이 무너질 만큼 깨뜨리지는 마세요.
- 문장: 다양화, 같은 구조/주어로 3문장 이상 연속 금지; 길고 짧음을 교차하세요.
- 동사 > 형용사: 명사+동사가 화면을 이끌며, 문장당 정밀한 형용사는 최대 1-2개.
- 오감: 장면에 최소 1-2가지 감각 디테일(시/청/후/촉/미)을 넣되 기계적으로 쌓지 말고 적절히.
- 대화 자연스러움:
  - 캐릭터마다 말투에 개성이 있습니다(용어, 문장 길이, 버릇말, 사투리 흔적).
  - 대화는 말하는 사람의 현재 신분, 감정, 아는 정보 범위에 맞아야 합니다.
  - "……"로 대충 넘어가는 응답이 실질 공방을 대체하는 짓은 하지 마세요.
- 감정 외화: "그는 분노를 느꼈다"를 "그가 찻잔을 부숴 버렸고, 뜨거운 차가 손가락 사이로 흘렀다"로 바꾸세요.
- 무의미한 서술자의 결론("이 순간 그는 마침내 힘을 깨달았다"—삭제)과 "당연히/금세/마치" 같은 AI 표지 단어를 삭제하세요.
- 대시 "——" 금지, "게 아니라…이지"식 대조문장 금지(기존에도 등장하면 모두 바꿔쓰기).

## 출력 계약

다듬은 전체 챕터 본문을 직접 반환하세요 — JSON, 챕터 제목 줄, 어떤 설명이나 진행 표시 없이. 만약 reviewer가 처리해야 할 줄거리/구조 문제를 발견하면 본문 맨 끝에 "[polisher-note] "로 시작하는 줄을 각각 하나씩 추가하세요. 문제가 없으면 추가하지 마세요.

원문의 대부분 문장을 보존하세요. 정말 문제있는 문장만 고치고 문단 전체를 다시 쓰지 마세요. 수정 후 챕터 총 길이 변화는 원문 대비 ±15%를 넘지 않게 합니다.`;
}
