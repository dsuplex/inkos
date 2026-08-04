import type { BookConfig } from "../models/book.js";
import type { GenreProfile } from "../models/genre-profile.js";

/**
 * Observer phase: extract ALL facts from the chapter.
 * Intentionally over-extracts — better to catch too much than miss something.
 * The Reflector phase will merge observations into truth files with cross-validation.
 */
export function buildObserverSystemPrompt(
  book: BookConfig,
  genreProfile: GenreProfile,
  language?: "zh" | "ko" | "en",
): string {
  const lang = language ?? genreProfile.language;
  const isEnglish = lang === "en";
  const isKorean = lang === "ko";

  let langPrefix = "";
  if (isEnglish) {
    langPrefix = "【LANGUAGE OVERRIDE】ALL output MUST be in English.\n\n";
  } else if (isKorean) {
    langPrefix = "【언어 재정의】모든 출력은 반드시 한국어로 작성하세요.\n\n";
  }

  let role = "";
  let task = "";
  if (isEnglish) {
    role = "You are a fact extraction specialist. ";
    task = "Read the chapter text and extract EVERY observable fact change.";
  } else if (isKorean) {
    role = "당신은 사실 추출 전문가입니다. ";
    task = "챕터 본문을 읽고 모든 관찰 가능한 사실 변화를 추출하세요.";
  } else {
    role = "你是一个事实提取专家。";
    task = "阅读章节正文，提取每一个可观察到的事实变化。";
  }

  let catTitle = "";
  if (isEnglish) catTitle = "## Extraction Categories";
  else if (isKorean) catTitle = "## 추출 범주";
  else catTitle = "## 提取类别";

  let catContent = "";
  if (isEnglish) {
    catContent = `1. **Character actions**: Who did what, to whom, why
2. **Location changes**: Who moved where, from where
3. **Resource changes**: Items gained, lost, consumed, quantities
4. **Relationship changes**: New encounters, trust/distrust shifts, alliances, betrayals
5. **Emotional shifts**: Character mood before → after, trigger event
6. **Information flow**: Who learned what, who is still unaware
7. **Plot threads**: New mysteries planted, existing threads advanced, threads resolved
8. **Time progression**: How much time passed, time markers mentioned
9. **Physical state**: Injuries, healing, fatigue, power changes`;
  } else if (isKorean) {
    catContent = `1. **캐릭터 행동**: 누가 무엇을, 누구에게, 왜 했는가
2. **위치 변화**: 누가 어디로, 어디서 이동했는가
3. **자원 변화**: 아이템 획득, 상실, 소비, 수량
4. **관계 변화**: 새로운 만남, 신뢰/불신 변화, 동맹, 배신
5. **감정 변화**: 캐릭터 기분 전→후, 계기 사건
6. **정보 흐름**: 누가 무엇을 알게 되었는가, 누가 여전히 모르는가
7. **줄거리 실마리**: 새로 심어진 미스터리, 기존 실마리 진전, 실마리 해소
8. **시간 경과**: 얼마나 시간이 흘렀나, 언급된 시간 표식
9. **신체 상태**: 부상, 회복, 피로, 전투력 변화`;
  } else {
    catContent = `1. **角色行为**：谁做了什么，对谁，为什么
2. **位置变化**：谁去了哪里，从哪里来
3. **资源变化**：获得、失去、消耗了什么，具体数量
4. **关系变化**：新相遇、信任/不信任转变、结盟、背叛
5. **情绪变化**：角色情绪从X到Y，触发事件是什么
6. **信息流动**：谁知道了什么新信息，谁仍然不知情
7. **剧情线索**：新埋下的悬念、已有线索的推进、线索的解答
8. **时间推进**：过了多少时间，提到的时间标记
9. **身体状态**：受伤、恢复、疲劳、战力变化`;
  }

  let rulesTitle = "";
  if (isEnglish) rulesTitle = "## Rules";
  else if (isKorean) rulesTitle = "## 규칙";
  else rulesTitle = "## 规则";

  let rulesContent = "";
  if (isEnglish) {
    rulesContent = `- Extract from the TEXT ONLY — do not infer what might happen
- Over-extract: if unsure whether something is significant, include it
- Be specific: "Lin Chen's left arm fractured" not "Lin Chen got hurt"
- Include chapter-internal time markers
- Note which characters are present in each scene`;
  } else if (isKorean) {
    rulesContent = `- 오직 본문에서만 추출——앞으로 일어날 일을 추측하지 말 것
- 과잉 추출: 중요할지 불확실해도 포함할 것
- 구체화: "이진욱 왼쪽 팔 골절"이 아닌 "이진욱 다침"
- 장 내부 시간 표식 포함
- 각 장면에 등장한 캐릭터 표기`;
  } else {
    rulesContent = `- 只从正文提取——不推测可能发生的事
- 宁多勿少：不确定是否重要时也要记录
- 具体化："陆承烬左肩旧伤开裂" 而非 "陆承烬受伤了"
- 记录章节内的时间标记
- 标注每个场景中在场的角色`;
  }

  let formatTitle = "";
  if (isEnglish) formatTitle = "## Output Format";
  else if (isKorean) formatTitle = "## 출력 형식";
  else formatTitle = "## 输出格式";

  let formatContent = "";
  if (isEnglish) {
    formatContent = `[CHARACTERS]
- <name>: <action/state change> (scene: <location>)

[LOCATIONS]
- <character> moved from <A> to <B>

[RESOURCES]
- <character> gained/lost <item> (quantity: <n>)

[RELATIONSHIPS]
- <charA> → <charB>: <change description>

[EMOTIONS]
- <character>: <before> → <after> (trigger: <event>)

[INFORMATION]
- <character> learned: <fact> (source: <how>)
- <character> still unaware of: <fact>

[PLOT_THREADS]
- NEW: <description>
- ADVANCED: <existing thread> — <progress>
- RESOLVED: <thread> — <resolution>

[TIME]
- <time markers, duration>

[PHYSICAL_STATE]
- <character>: <injury/healing/fatigue/power change>`;
  } else if (isKorean) {
    formatContent = `[캐릭터]
- <이름>: <행동/상태 변화> (장면: <위치>)

[위치 변화]
- <캐릭터> <A>에서 <B>로 이동

[자원 변화]
- <캐릭터> <아이템> 획득/상실 (수량: <n>)

[관계 변화]
- <캐릭터A> → <캐릭터B>: <변화 설명>

[감정 변화]
- <캐릭터>: <이전> → <이후> (계기: <사건>)

[정보 흐름]
- <캐릭터> 알게 됨: <사실> (출처: <경로>)
- <캐릭터> 여전히 모름: <사실>

[줄거리 실마리]
- 신규: <설명>
- 진전: <기존 실마리> — <진전>
- 해소: <실마리> — <해소>

[시간]
- <시간 표식, 소요 시간>

[신체 상태]
- <캐릭터>: <부상/회복/피로/전투력 변화>`;
  } else {
    formatContent = `[角色行为]
- <角色名>: <行为/状态变化> (场景: <地点>)

[位置变化]
- <角色> 从 <A> 到 <B>

[资源变化]
- <角色> 获得/失去 <物品> (数量: <n>)

[关系变化]
- <角色A> → <角色B>: <变化描述>

[情绪变化]
- <角色>: <之前> → <之后> (触发: <事件>)

[信息流动]
- <角色> 得知: <事实> (来源: <途径>)
- <角色> 仍不知: <事实>

[剧情线索]
- 新埋: <描述>
- 推进: <已有线索> — <进展>
- 回收: <线索> — <解答>

[时间]
- <时间标记、时长>

[身体状态]
- <角色>: <受伤/恢复/疲劳/战力变化>`;
  }

  return `${langPrefix}${role}${task}

${catTitle}

${catContent}

${rulesTitle}

${rulesContent}

${formatTitle}

=== OBSERVATIONS ===

${formatContent}`;
}

export function buildObserverUserPrompt(
  chapterNumber: number,
  title: string,
  content: string,
  language?: "zh" | "ko" | "en",
): string {
  const lang = language ?? "zh";
  if (lang === "en") {
    return `Extract all facts from Chapter ${chapterNumber} "${title}":\n\n${content}`;
  }
  if (lang === "ko") {
    return `제${chapterNumber}장 「${title}」의 모든 사실을 추출하세요:\n\n${content}`;
  }
  return `请提取第${chapterNumber}章「${title}」中的所有事实：\n\n${content}`;
}