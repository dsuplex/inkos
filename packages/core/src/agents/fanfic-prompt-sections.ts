import type { FanficMode } from "../models/book.js";

const MODE_PREAMBLES: Record<FanficMode, string> = {
  canon: `你正在写**原作向同人**。严格遵守正典：
- 角色的语癖、说话风格、行为模式必须与原作一致
- 世界规则不可违反
- 关键事件时间线不可矛盾
- 可以填充原作空白、探索未详述的角度`,

  au: `你正在写**AU（平行世界）同人**：
- 世界规则可以改变（已在 allowedDeviations 中声明的偏离）
- 角色的核心性格和说话方式应保持辨识度——读者要能认出是谁
- AU 设定偏离必须内部一致（改了一条规则，相关的都要跟着变）`,

  ooc: `你正在写**OOC 同人**：
- 角色在极端情境下可以偏离性格底色
- 但偏离必须有情境驱动，不能无缘无故变性格
- 保留角色的语癖和说话特征——即使性格变了，说话方式也应有辨识度`,

  cp: `你正在写**CP 同人**，以角色互动和关系发展为核心：
- 配对双方每章必须有有效互动
- 互动风格要有化学反应——不是两个人在同一个场景各干各的
- 关系发展应有节奏感：推进、试探、阻碍、突破`,
};

const MODE_PREAMBLES_KO: Record<FanficMode, string> = {
  canon: `당신은 **정전 향 팬픽**을 쓰고 있습니다. 정전을 엄격히 준수하세요:
- 캐릭터의 말버릇, 말투, 행동 패턴은 원작과 일치해야 함
- 세계 규칙 위반 불가
- 핵심 이벤트 타임라인 모순 불가
- 원작의 빈틈 채우기, 미묘한 각도 탐구 가능`,

  au: `당신은 **AU(평행 세계) 팬픽**을 쓰고 있습니다:
- 세계 규칙 변경 가능 (allowedDeviations에 명시된 편차)
- 캐릭터의 핵심 성격과 말투는 식별 가능해야 함 — 독자가 누군지 알아야 함
- AU 설정 편차는 내부적으로 일관되어야 함 (규칙 하나를 바꾸면 관련 모두 변경)`,

  ooc: `당신은 **OOC 팬픽**을 쓰고 있습니다:
- 캐릭터가 극한 상황에서 성격 핵심에서 벗어날 수 있음
- 하지만 벗어남에는 상황적 동기가 있어야 함, 이유 없이 성격 변하지 않음
- 캐릭터의 말버릇과 말하기 특성은 유지 — 성격이 변해도 말투는 식별 가능`,

  cp: `당신은 **CP 팬픽**을 쓰고 있습니다, 캐릭터 상호작용과 관계 발전이 핵심:
- 커플 쌍방 매 장마다 유효한 상호작용 필요
- 상호작용 스타일에 케미스트리 있어야 함 — 같은 장면에서 각자 놀기 X
- 관계 발전은 리듬감 있게: 전진, 탐색, 방해, 돌파`,
};

export function buildFanficCanonSection(
  fanficCanon: string,
  mode: FanficMode,
  language: "zh" | "ko" | "en" = "zh",
): string {
  if (language === "ko") {
    return `
## 팬픽 정전 참고

${MODE_PREAMBLES_KO[mode]}

다음은 팬픽 정전 정보입니다. 집필 시 반드시 참고하세요:

${fanficCanon}`;
  }
  if (language === "en") {
    return `
## Fanfic Canon Reference

${MODE_PREAMBLES[mode].replace("你正在写**原作向同人**。严格遵守正典：", "You are writing **canon-compliant fanfic**. Strictly adhere to canon:")
      .replace("你正在写**AU（平行世界）同人**：", "You are writing an **AU (alternate universe) fanfic**:")
      .replace("你正在写**OOC 同人**：", "You are writing an **OOC fanfic**:")
      .replace("你正在写**CP 同人**，以角色互动和关系发展为核心：", "You are writing a **CP (coupling) fanfic**, focused on character interaction and relationship development:")}

以下是原作正典信息，写作时必须参照：

${fanficCanon}`;
  }
  return `
## 同人正典参照

${MODE_PREAMBLES[mode]}

以下是原作正典信息，写作时必须参照：

${fanficCanon}`;
}

export function buildCharacterVoiceProfiles(fanficCanon: string, language: "zh" | "ko" | "en" = "zh"): string {
  // Extract character table from fanfic_canon.md
  const tableMatch = fanficCanon.match(
    /## 角色档案[\s\S]*?\n(\|[^\n]+\|\n\|[-|\s]+\|\n(?:\|[^\n]+\|\n)*)/,
  );
  if (!tableMatch) return "";

  const rows = tableMatch[1]!
    .split("\n")
    .filter((line) => line.startsWith("|") && !line.startsWith("|--") && !line.startsWith("| 角色"))
    .map((line) =>
      line
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean),
    )
    .filter((cells) => cells.length >= 5);

  if (rows.length === 0) return "";

  const profiles = rows.map((cells) => {
    const [name, , , catchphrases, speakingStyle, behavior] = cells;
    const parts: string[] = [`### ${name}`];
    if (catchphrases && catchphrases !== "（素材未提及）") {
      parts.push(`- 口头禅/语癖：${catchphrases}`);
    }
    if (speakingStyle && speakingStyle !== "（素材未提及）") {
      parts.push(`- 说话风格：${speakingStyle}`);
    }
    if (behavior && behavior !== "（素材未提及）") {
      parts.push(`- 典型行为：${behavior}`);
    }
    return parts.join("\n");
  });

  if (language === "ko") {
    return `
## 캐릭터 보이스 프로필 (팬픽 전용)

다음 캐릭터들의 대사와 행동은 원작 특성을 참고해야 합니다. 대사 쓸 때 "이 캐릭터가 원작에서 어떻게 말할까?"를 먼저 생각하세요.

${profiles.join("\n\n")}`;
  }
  if (language === "en") {
    return `
## Character Voice Profiles (Fanfic Only)

The following characters' dialogue and behavior must follow canon traits. When writing dialogue, first ask: "How would this character speak in canon?"

${profiles.join("\n\n")}`;
  }
  return `
## 角色语音参照（同人写作专用）

以下角色的对话和行为必须参照原作特征。写对话时，先想"这个角色在原作里会怎么说"。

${profiles.join("\n\n")}`;
}

const MODE_CHECKS: Record<FanficMode, string> = {
  canon: `- 正典合规检查：本章是否违反原作设定？角色对话是否符合原作语癖？
- 信息边界检查：角色是否引用了不该知道的信息？`,

  au: `- AU 偏离清单：本章改变了哪些世界规则？改变是否内部一致？
- 角色辨识度检查：读者能否从对话中认出角色？`,

  ooc: `- OOC 偏离记录：角色在哪些方面偏离了性格底色？偏离驱动力是什么？
- 语癖保留检查：即使 OOC，说话方式是否还有原作特征？`,

  cp: `- CP 互动检查：配对双方本章是否有有效互动？关系发展是否推进？
- 互动质量检查：互动是否有化学反应（不是各干各的）？`,
};

const MODE_CHECKS_KO: Record<FanficMode, string> = {
  canon: `- 정전 준수 체크: 본 장이 원작 설정을 위반했나? 캐릭터 대사가 원작 말버릇과 맞나?
- 정보 경계 체크: 캐릭터가 알아선 안 될 정보를 인용했나?`,

  au: `- AU 편차 체크리스트: 본 장에서 어떤 세계 규칙이 바뀌었나? 변경이 내부적으로 일관적인가?
- 캐릭터 식별도 체크: 독자가 대사로 캐릭터를 알아볼 수 있나?`,

  ooc: `- OOC 편차 기록: 캐릭터가 어떤 면에서 성격 핵심에서 벗어났나? 벗어남의 동력은?
- 말버릇 유지 체크: OOC라도 말투에 원작 특성이 남아있나?`,

  cp: `- CP 상호작용 체크: 커플 쌍방 본 장에 유효한 상호작용이 있나? 관계 발전이 진행되었나?
- 상호작용 품질 체크: 상호작용에 케미스트리가 있는가 (각자 놀기 아닌가)?`,
};

export function buildFanficModeInstructions(
  mode: FanficMode,
  allowedDeviations: ReadonlyArray<string>,
  language: "zh" | "ko" | "en" = "zh",
): string {
  const deviationsBlock = allowedDeviations.length > 0
    ? `\n允许的偏离（不视为违规）：\n${allowedDeviations.map((d) => `- ${d}`).join("\n")}\n`
    : "";

  if (language === "ko") {
    const deviationsBlockKo = allowedDeviations.length > 0
      ? `\n허용된 편차 (위반 아님):\n${allowedDeviations.map((d) => `- ${d}`).join("\n")}\n`
      : "";
    return `
## 팬픽 집필 자체검증 (PRE_WRITE_CHECK에 추가 검증)

${MODE_CHECKS_KO[mode]}${deviationsBlockKo}`;
  }
  if (language === "en") {
    return `
## Fanfic Self-Check (Extra Checks in PRE_WRITE_CHECK)

${MODE_CHECKS[mode].replace("正典合规检查", "Canon compliance check")
      .replace("信息边界检查", "Info boundary check")
      .replace("AU 偏离清单", "AU deviation checklist")
      .replace("角色辨识度检查", "Character recognizability check")
      .replace("OOC 偏离记录", "OOC deviation log")
      .replace("语癖保留检查", "Speech quirk retention check")
      .replace("CP 互动检查", "CP interaction check")
      .replace("互动质量检查", "Interaction quality check")}${deviationsBlock.replace("允许的偏离（不视为违规）", "Allowed deviations (not violations)")}`;
  }
  return `
## 同人写作自检（在 PRE_WRITE_CHECK 中额外检查）

${MODE_CHECKS[mode]}${deviationsBlock}`;
}
