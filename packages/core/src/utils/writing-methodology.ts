/**
 * Full writing methodology for style_guide.md injection.
 * This is the complete reference material (with examples) that the
 * compact "craft card" in the system prompt summarizes.
 *
 * Injected once during initBook/generateStyleGuide, then read by
 * writer on every chapter as part of the style_guide context.
 */
export function buildWritingMethodologySection(language: "zh" | "ko" | "en"): string {
  if (language === "en") {
    return buildEnglishMethodology();
  }
  if (language === "ko") {
    return buildKoreanMethodology();
  }
  return buildChineseMethodology();
}

function buildKoreanMethodology(): string {
  return `---

# 글쓰기 방법론 참고 (전체판)

아래 방법론은 글쓰기 품질의 완전한 참고 자료입니다. 집필 시 이 원칙들을 내면화해야 합니다.

## 1. AI 맛 제거: 정반례 대조

### 감정 묘사
| 반례 (AI맛) | 정례 (사람맛) | 요점 |
|---|---|---|
| 그는 매우 화가 났다. | 그는 손에 쥔 찻잔을 으스러뜨렸다. 끓는 차가 손가락 사이로 흘러내렸지만 그는 아무렇지도 않은 듯했다. | 행동으로 감정 외화 |
| 그녀는 마음이 너무 슬퍼서 눈물이 흘렀다. | 그녀는 휴대폰을 꽉 쥐어 손가락 마디가 하얗게 변했고, 화면의 채팅 기록이 흐릿하게 뭉개졌다. | 신체 디테일로 직설적 라벨 대체 |
| 그는 문득 두려움을 느꼈다. | 등 뒤로 소름이 돋았고, 발바닥이 얼음 위에 놓인 듯했다. | 오감으로 공포 전달 |

### 전환과 연결
| 반례 | 정례 | 요점 |
|---|---|---|
| 비록 그가 강하지만, 그래도 졌다. | 그는 확실히 강하다. 하지만 저쪽 노친네가 더 더럽다. | 구어체 전환 |
| 그러나, 일은 그리 단순하지 않았다. | 그렇게 호락호락한 일이 아니다. | 캐릭터 내심 독백으로 "그러나" 대체 |
| 그러므로 그는 행동을 취하기로 결심했다. | 그는 일어나며 의자를 걷어찼다. | 인과 접속사 삭제, 행동 직접 기술 |

### "~했다" 남용 제어
| 반례 | 정례 |
|---|---|
| 그는 걸어갔다, 컵을 들었다, 물을 한 모금 마셨다. | 그는 걸어가 컵을 들어 한 모금 들이켰다. |
| 그녀가 웃고는 돌아서 방을 나갔다. | 입꼬리를 올리며 돌아서 문을 나섰다. |

## 2. 육단계 인물 심리 분석

모든 중요 캐릭터의 핵심 장면 행동은 반드시 다음 여섯 단계 추론을 거쳐야 함:

1. **현재 처지**: 캐릭터가 지금 어떤 국면에 놓였나? 손에 쥔 패는 무엇인가?
2. **핵심 동기**: 캐릭터가 가장 원하는 것은? 가장 두려워하는 것은?
3. **정보 경계**: 캐릭터가 아는 것과 모르는 것은? 국면에 대한 오판은?
4. **성격 필터**: 같은 상황인데, 이 캐릭터의 성격이라면 어떻게 반응할까?
5. **행동 선택**: 위 네 가지를 종합해 캐릭터는 어떤 선택을 하는가?
6. **감정 외화**: 이 선택에 동반되는 감정은? 어떤 신체 언어, 표정, 어조로 표현하나?

단계 생략 후 바로 행동 쓰기 금지.

## 3. 조연 설계 방법론

- 조연은 반드시 반격이 있고, 자기만의 셈법이 있어야 함. 주인공의 강함은 똑똑한 자를 제압하는 데 있지, 멍청이를 짓밟는 데 있지 않다.
- 모든 조연의 행동 동기는 주선과 연관되어야 함.
- 핵심 태그 + 반전 디테일 = 살아있는 사람 (겉으론 냉혹한데 남몰래 유기동물을 돌봄).
- 사건으로 인물을 세우고, 외모와 형용사 나열로 캐릭터를 만들지 말 것.
- 캐릭터마다 말하는 방식(어휘, 길이, 말버릇)이 구별되어야 함.
- 군상신에서 "일제히 놀라 비명" 쓰지 말고, 1-2명 구체적 반응만 쓰기.

## 4. 몰입감 여섯 기둥

1. **기초 정보 전달**: 대사 한 줄로 신분, 성격, 지위 전달 — "내 나으리, 나으린 남부현 현령의 아들 이 봉이야"
2. **구체화/시각화**: 독자 뇌리에 장면이 떠오를 만큼 구체적 — "호리병 뚜껑이 증기 뿜듯 김이 난다", "얼음 든 사이다가 치직거린다"
3. **친숙함**: 독자가 겪어본 장면은 자연히 몰입 — "수능 뒤 소나무 숲에서의 이별", "병원 복도 소독약 냄새"
4. **공감**: 주인공의 곤경은 보편적이어야 — 부당한 대우, 저평가, 억울함
5. **욕망 엔진**:
   - 기초 욕망 (수동적): 노력 없이 얻기, 남보다 위에 서기, 한풀기
   - 능동적 욕망 (기대감): 작가가 의도적으로 만든 감정 갭 → 독자 기대 → 기대를 넘는 해소
6. **오감 묘사**: 시각, 청각, 후각, 촉각, 미각 — "축축한 티셔츠가 등짝에 들러붙었다"

## 5. 강감정 증폭법 (흐름글 방지)

흐름글 고치는 법은 일상을 지우는 게 아니라 일상에 "양념" 치는 것:

1. **인과 더하기**: 퇴근길 집 간다 → "독촉 전화가 막 왔다" 추가 → 일상에 긴박감 부여
2. **감정 적층**: 나쁜 일 위에 나쁜 일 — 욕 먹음 → 버스 놓침 → 폰 떨어뜨림 → 라이브 방송 끝남 → 찐빵에 목 멂. 매 층이 전 층보다 더 과함
3. **일상은 반드시 주선을 위해 복무**: 만물은 모두 "미끼". 일상 문단은 복선을 깔거나, 관계를 밀거나, 반전을 세워야 함

## 6. 집필 전 자검 체크리스트

1. 본 장은 권강의 어떤 노드에 해당하는가? 해당 노드를 밀었는가?
2. 주인공이 지금 이익을 최대화하는 선택은 무엇인가?
3. 갈등은 누가 먼저 손 댔고, 왜 안 할 수 없었나?
4. 조연/악역에게 명확한 요구와 반제 수단이 있는가?
5. 악역이 현재 파악한 정보는? 정보 월권은 없는가?
6. 장 끝에 훅을 남겼는가?
7. 흐름글이 있는가? 있다면 인과나 강감정 추가
8. 본 장이 주선 목표를 밀었는가?`;
}

function buildChineseMethodology(): string {
  return `---

# 写作方法论参考（完整版）

以下方法论是写作质量的完整参考。写作时应内化这些原则。

## 一、去AI味：正反例对照

### 情绪描写
| 反例（AI味） | 正例（人味） | 要点 |
|---|---|---|
| 他感到非常愤怒。 | 他捏碎了手中的茶杯，滚烫的茶水流过指缝，但他像没感觉一样。 | 用动作外化情绪 |
| 她心里很悲伤，眼泪流了下来。 | 她攥紧手机，指节发白，屏幕上的聊天记录模糊成一片。 | 用身体细节替代直白标签 |
| 他感到一阵恐惧。 | 他后背的汗毛竖了起来，脚底像踩在了冰上。 | 五感传递恐惧 |

### 转折与衔接
| 反例 | 正例 | 要点 |
|---|---|---|
| 虽然他很强，但是他还是输了。 | 他确实强，可对面那个老东西更脏。 | 口语化转折 |
| 然而，事情并没有那么简单。 | 哪有那么便宜的事。 | 角色内心吐槽替代"然而" |
| 因此，他决定采取行动。 | 他站起来，把凳子踢到一边。 | 删掉因果连词，直接写动作 |

### "了"字控制
| 反例 | 正例 |
|---|---|
| 他走了过去，拿了杯子，喝了一口水。 | 他走过去，端起杯子，灌了一口。 |
| 她笑了笑，转身离开了房间。 | 她嘴角一扬，转身出门。 |

## 二、六步走人物心理分析

每个重要角色在关键场景中的行为，必须经过以下六步推导：

1. **当前处境**：角色此刻面临什么局面？手上有什么牌？
2. **核心动机**：角色最想要什么？最害怕什么？
3. **信息边界**：角色知道什么？不知道什么？对局势有什么误判？
4. **性格过滤**：同样的局面，这个角色的性格会怎么反应？
5. **行为选择**：基于以上四点，角色会做出什么选择？
6. **情绪外化**：这个选择伴随什么情绪？用什么身体语言、表情、语气表达？

禁止跳过步骤直接写行为。

## 三、配角设计方法论

- 配角必须有反击，有自己的算盘。主角的强大在于压服聪明人，而不是碾压傻子。
- 每个配角的行为动机必须与主线产生关联。
- 核心标签 + 反差细节 = 活人（表面冷硬的角色偷偷照顾流浪动物）。
- 通过事件立人设，禁止通过外貌和形容词堆砌。
- 不同角色的说话方式必须有辨识度。
- 群戏中不写"众人齐声惊呼"，挑1-2个角色写具体反应。

## 四、代入感六大支柱

1. **基础信息交代**：一句话能交代身份、性格、地位——"小爷我乃镇南府世子林峰"
2. **具体化/可视化**：描写具体到读者脑海能浮现——"搪瓷缸白汽直冒""冰镇汽水嘶嘶响"
3. **熟悉感**：接地气的场景自带代入感——"高考后小树林的分手""医院走廊的消毒水味"
4. **共鸣**：主角的困境必须有普遍性——被欺压、不公待遇、被低估
5. **欲望驱动**：
   - 基础欲望（被动）：不劳而获、高人一等、扬眉吐气
   - 主动欲望（期待感）：作者刻意制造的情绪缺口→读者期待释放→释放超过预期
6. **五感描写**：视觉、听觉、嗅觉、触觉、味觉——"潮湿的短袖黏在后背上"

## 五、强情绪升级法（避免流水账）

流水账的修法不是删掉日常，而是给日常加"料"：

1. **加入前因后果**：下班回家→加上"催债电话刚打来"→日常有了紧迫感
2. **情绪递进**：坏事叠坏事——被骂→赶不上公交→手机掉了→直播课结束了→包子噎住了。每层比上一层过分
3. **日常必须为主线服务**：万物皆为"饵"。日常段要么埋伏笔，要么推关系，要么建立反差

## 六、写前自检清单

1. 本章对应卷纲中的哪个节点？是否推进了该节点？
2. 主角此刻利益最大化的选择是什么？
3. 冲突是谁先动手，为什么非做不可？
4. 配角/反派是否有明确诉求和反制？
5. 反派当前掌握了哪些信息？有无信息越界？
6. 章尾是否留了钩子？
7. 有没有流水账？如有，加前因后果或强情绪
8. 本章是否推进了主线目标？`;
}

function buildEnglishMethodology(): string {
  return `---

# Writing Methodology Reference (Full Version)

Complete reference material for writing quality. Internalize these principles.

## 1. Anti-AI Pattern Guide

### Emotion
| Bad (AI-like) | Good (Human) | Key |
|---|---|---|
| He felt very angry. | He crushed the teacup in his hand. Scalding water ran through his fingers, but he didn't flinch. | Externalize through action |
| She was very sad and tears fell. | She gripped her phone until her knuckles went white. The chat log blurred. | Body detail replaces label |

### Transitions
| Bad | Good | Key |
|---|---|---|
| Although he was strong, he still lost. | He was strong, sure. But the old bastard across from him fought dirtier. | Colloquial voice |
| However, things were not so simple. | No such luck. | Character thought replaces "however" |
| Therefore, he decided to take action. | He stood up and kicked the chair aside. | Cut causal connectors, show action |

## 2. Six-Step Character Psychology

For every important character action:
1. **Situation**: What's the character facing? What cards do they hold?
2. **Core motivation**: What do they want most? Fear most?
3. **Information boundary**: What do they know? Not know? Misjudge?
4. **Personality filter**: Given the same situation, how would THIS character react?
5. **Behavioral choice**: Based on 1-4, what do they choose?
6. **Emotional expression**: What emotion accompanies this? Body language, expression, tone?

## 3. Supporting Character Design

- Every side character has their own agenda. Protagonist wins by outsmarting smart people.
- Core tag + contrast detail = alive (cold-exterior character secretly feeds strays).
- Establish character through events, not description dumps.
- Different characters speak differently — vocabulary, length, verbal tics.
- In group scenes: never "everyone gasped" — pick 1-2 specific reactions.

## 4. Immersion Pillars

1. **Info delivery**: One line of dialogue can establish identity, status, personality
2. **Concrete/visual**: "The back seat of a taxi stuck in traffic for forty minutes" not "a big city"
3. **Familiarity**: Scenes readers have lived through carry natural immersion
4. **Resonance**: Protagonist's struggle must feel universal — injustice, being underestimated
5. **Desire engine**: Create emotional gap → reader anticipates release → release exceeds expectation
6. **Five senses**: Wet shirt on the back, hospital disinfectant, rain puddles at the bus stop

## 5. Emotional Escalation (Anti-Flowchart)

Fix boring daily scenes by adding fuel:
1. **Add causality**: Coming home → add "debt collector just called" → instant urgency
2. **Progressive escalation**: Stack bad things — scolded → missed bus → phone fell in drain → livestream ended → choked on stale bread. Each layer worse.
3. **Daily serves mainline**: Every quiet scene must plant a hook, advance a relationship, or build contrast.

## 6. Pre-Write Checklist

1. Which outline node does this chapter correspond to?
2. What's the protagonist's optimal move right now?
3. Who starts the conflict and why must they?
4. Do antagonists have clear motives and countermoves?
5. What information does each character have? Any boundary violations?
6. Does the chapter end with a hook?
7. Any flowchart passages? If so, add causality or strong emotion.
8. Does this chapter advance the main plotline?`;
}
