/**
 * Structural AI-tell detection — pure rule-based analysis (no LLM).
 *
 * Detects patterns common in AI-generated Chinese text:
 * - dim 20: Paragraph length uniformity (low variance)
 * - dim 21: Filler/hedge word density
 * - dim 22: Formulaic transition patterns
 * - dim 23: List-like structure (consecutive same-prefix sentences)
 */

export interface AITellIssue {
  readonly severity: "warning" | "info";
  readonly category: string;
  readonly description: string;
  readonly suggestion: string;
}

export interface AITellResult {
  readonly issues: ReadonlyArray<AITellIssue>;
}

type AITellLanguage = "zh" | "ko" | "en";

const HEDGE_WORDS: Record<AITellLanguage, ReadonlyArray<string>> = {
  zh: ["似乎", "可能", "或许", "大概", "某种程度上", "一定程度上", "在某种意义上"],
  ko: ["아마", "어쩌면", "어느 정도", "마치", "것 같은", "것만 같다", "일 것 같다"],
  en: ["seems", "seemed", "perhaps", "maybe", "apparently", "in some ways", "to some extent"],
};

const TRANSITION_WORDS: Record<AITellLanguage, ReadonlyArray<string>> = {
  zh: ["然而", "不过", "与此同时", "另一方面", "尽管如此", "话虽如此", "但值得注意的是"],
  ko: ["하지만", "그러나", "한편", "그럼에도", "무엇보다", "그런데", "이에 반해"],
  en: ["however", "meanwhile", "on the other hand", "nevertheless", "even so", "still"],
};

/**
 * Analyze text content for structural AI-tell patterns.
 * Returns issues that can be merged into audit results.
 */
export function analyzeAITells(content: string, language: AITellLanguage = "zh"): AITellResult {
  const issues: AITellIssue[] = [];
  const isEnglish = language === "en";
  const isKorean = language === "ko";
  const joiner = isEnglish || isKorean ? ", " : "、";

  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // dim 20: Paragraph length uniformity (needs ≥3 paragraphs)
  if (paragraphs.length >= 3) {
    const paragraphLengths = paragraphs.map((p) => p.length);
    const mean = paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length;
    if (mean > 0) {
      const variance = paragraphLengths.reduce((sum, l) => sum + (l - mean) ** 2, 0) / paragraphLengths.length;
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / mean;
      if (cv < 0.15) {
        issues.push({
          severity: "warning",
          category: isEnglish ? "Paragraph uniformity" : isKorean ? "문단 균일도" : "段落等长",
          description: isEnglish
            ? `Paragraph-length coefficient of variation is only ${cv.toFixed(3)} (threshold <0.15), which suggests unnaturally uniform paragraph sizing`
            : isKorean
              ? `문단 길이 변이 계수가 ${cv.toFixed(3)}에 불과합니다(임계값 <0.15). 문단 길이가 비정상적으로 균일하여 AI 생성 특성을 보입니다`
              : `段落长度变异系数仅${cv.toFixed(3)}（阈值<0.15），段落长度过于均匀，呈现AI生成特征`,
          suggestion: isEnglish
            ? "Increase paragraph-length contrast: use shorter beats for impact and longer blocks for immersive detail"
            : isKorean
              ? "문단 길이 대비를 높이세요: 짧은 비트는 임팩트용, 긴 블록은 몰입형 묘사용으로 활용하세요"
              : "增加段落长度差异：短段落用于节奏加速或冲击，长段落用于沉浸描写",
        });
      }
    }
  }

  // dim 21: Hedge word density
  const totalChars = content.length;
  if (totalChars > 0) {
    let hedgeCount = 0;
    for (const word of HEDGE_WORDS[language]) {
      const regex = new RegExp(word, isEnglish ? "gi" : "g");
      const matches = content.match(regex);
      hedgeCount += matches?.length ?? 0;
    }
    const hedgeDensity = hedgeCount / (totalChars / 1000);
    if (hedgeDensity > 3) {
      issues.push({
        severity: "warning",
        category: isEnglish ? "Hedge density" : isKorean ? "완화어 밀도" : "套话密度",
        description: isEnglish
          ? `Hedge-word density is ${hedgeDensity.toFixed(1)} per 1k characters (threshold >3), making the prose sound overly tentative`
          : isKorean
            ? `완화어(아마/어쩌면/어느 정도 등) 밀도가 ${hedgeDensity.toFixed(1)}회/천자입니다(임계값 >3). 문체가 지나치게 조심스럽고 모호합니다`
            : `套话词（似乎/可能/或许等）密度为${hedgeDensity.toFixed(1)}次/千字（阈值>3），语气过于模糊犹豫`,
        suggestion: isEnglish
          ? "Replace hedges with firmer narration: remove vague qualifiers and use concrete detail instead"
          : isKorean
            ? "완화어를 확정적 서술로 대체하세요: 모호한 수식어를 제거하고 구체적 디테일로 직접 묘사하세요"
            : "用确定性叙述替代模糊表达：去掉「似乎」直接描述状态，用具体细节替代「可能」",
      });
    }
  }

  // dim 22: Formulaic transition repetition
  const transitionCounts: Record<string, number> = {};
  for (const word of TRANSITION_WORDS[language]) {
    const regex = new RegExp(word, isEnglish ? "gi" : "g");
    const matches = content.match(regex);
    const count = matches?.length ?? 0;
    if (count > 0) {
      transitionCounts[isEnglish ? word.toLowerCase() : word] = count;
    }
  }
  const repeatedTransitions = Object.entries(transitionCounts)
    .filter(([, count]) => count >= 3);
  if (repeatedTransitions.length > 0) {
    const detail = repeatedTransitions
      .map(([word, count]) => `"${word}"×${count}`)
      .join(joiner);
    issues.push({
      severity: "warning",
      category: isEnglish ? "Formulaic transitions" : isKorean ? "공식적 전환어" : "公式化转折",
      description: isEnglish
        ? `Transition words repeat too often: ${detail}. Reusing the same transition pattern 3+ times creates a formulaic AI texture`
        : isKorean
          ? `전환어가 너무 자주 반복됩니다: ${detail}. 같은 전환 패턴을 3회 이상 재사용하면 AI 생성 특유의 공식적 질감이 드러납니다`
          : `转折词重复使用：${detail}。同一转折模式≥3次暴露AI生成痕迹`,
      suggestion: isEnglish
        ? "Let scenes pivot through action, timing, or viewpoint shifts instead of repeating the same transitions"
        : isKorean
          ? "동일한 전환어 반복 대신 행동, 시간 흐름, 시점 전환으로 장면이 자연스럽게 이어지게 하세요"
          : "用情节自然转折替代转折词，或换用不同的过渡手法（动作切入、时间跳跃、视角切换）",
    });
  }

  // dim 23: List-like structure (consecutive sentences with same prefix pattern)
  const sentences = content
    .split(isEnglish ? /[.!?\n]/ : /[。！？\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  if (sentences.length >= 3) {
    let consecutiveSamePrefix = 1;
    let maxConsecutive = 1;
    for (let i = 1; i < sentences.length; i++) {
      const prevPrefix = isEnglish
        ? sentences[i - 1]!.split(/\s+/)[0]?.toLowerCase() ?? ""
        : sentences[i - 1]!.slice(0, 2);
      const currPrefix = isEnglish
        ? sentences[i]!.split(/\s+/)[0]?.toLowerCase() ?? ""
        : sentences[i]!.slice(0, 2);
      if (prevPrefix === currPrefix) {
        consecutiveSamePrefix++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveSamePrefix);
      } else {
        consecutiveSamePrefix = 1;
      }
    }
    if (maxConsecutive >= 3) {
      issues.push({
        severity: "info",
        category: isEnglish ? "List-like structure" : isKorean ? "목록형 구조" : "列表式结构",
        description: isEnglish
          ? `Detected ${maxConsecutive} consecutive sentences with the same opening pattern, creating a list-like generated cadence`
          : isKorean
            ? `${maxConsecutive}개 문장이 같은 패턴으로 연속 시작하여, 목록형 AI 생성 구조가 감지되었습니다`
            : `检测到${maxConsecutive}句连续以相同开头的句子，呈现列表式AI生成结构`,
        suggestion: isEnglish
          ? "Vary how sentences open: change subject, timing, or action entry to break the list effect"
          : isKorean
            ? "문장 시작을 다양화하세요: 주어, 시간 표현, 동작 진입을 바꿔 목록 느낌을 깨뜨리세요"
            : "变换句式开头：用不同主语、时间词、动作词开头，打破列表感",
      });
    }
  }

  return { issues };
}
