import type { AuditIssue } from "../agents/continuity.js";
import type { HookRecord, RuntimeStateDelta } from "../models/runtime-state.js";
import { classifyHookDisposition, collectStaleHookDebt } from "./hook-governance.js";
import { describeHookLifecycle, localizeHookPayoffTiming, normalizeStoredHookStatus } from "./hook-lifecycle.js";
import { HOOK_HEALTH_DEFAULTS } from "./hook-policy.js";

export function analyzeHookHealth(params: {
  readonly language: "zh" | "ko" | "en";
  readonly chapterNumber: number;
  readonly targetChapters?: number;
  readonly hooks: ReadonlyArray<HookRecord>;
  readonly delta?: Pick<RuntimeStateDelta, "chapter" | "hookOps">;
  readonly existingHookIds?: ReadonlyArray<string>;
  readonly maxActiveHooks?: number;
  readonly staleAfterChapters?: number;
  readonly noAdvanceWindow?: number;
  readonly newHookBurstThreshold?: number;
}): AuditIssue[] {
  const maxActiveHooks = params.maxActiveHooks ?? HOOK_HEALTH_DEFAULTS.maxActiveHooks;
  const staleAfterChapters = params.staleAfterChapters ?? HOOK_HEALTH_DEFAULTS.staleAfterChapters;
  const noAdvanceWindow = params.noAdvanceWindow ?? HOOK_HEALTH_DEFAULTS.noAdvanceWindow;
  const newHookBurstThreshold = params.newHookBurstThreshold ?? HOOK_HEALTH_DEFAULTS.newHookBurstThreshold;
  const issues: AuditIssue[] = [];

  const activeHooks = params.hooks.filter((hook) => {
    const status = normalizeStoredHookStatus(hook.status);
    return status !== "resolved" && status !== "deferred";
  });
  const lifecycleEntries = activeHooks.map((hook) => ({
    hook,
    lifecycle: describeHookLifecycle({
      payoffTiming: hook.payoffTiming,
      expectedPayoff: hook.expectedPayoff,
      notes: hook.notes,
      startChapter: hook.startChapter,
      lastAdvancedChapter: hook.lastAdvancedChapter,
      status: hook.status,
      chapterNumber: params.chapterNumber,
      targetChapters: params.targetChapters,
    }),
  }));

  if (activeHooks.length > maxActiveHooks) {
    issues.push(warning(
      params.language,
      params.language === "en"
        ? `There are ${activeHooks.length} active hooks, above the recommended cap of ${maxActiveHooks}.`
        : params.language === "ko"
          ? `현재 활성 복선이 ${activeHooks.length}개로, 권장 상한 ${maxActiveHooks}개를 초과했습니다.`
          : `当前有 ${activeHooks.length} 个活跃伏笔，已经高于建议上限 ${maxActiveHooks} 个。`,
      params.language === "en"
        ? "Prefer advancing, resolving, or deferring existing debt before opening more hooks."
        : params.language === "ko"
          ? "새 복선을 열기 전에 기존 부채를 우선 진행, 회수 또는 연기하십시오."
          : "优先推进、回收或延后已有伏笔，再继续开新伏笔。",
    ));
  }

  const staleHookIds = new Set(collectStaleHookDebt({
    hooks: activeHooks,
    chapterNumber: params.chapterNumber,
    targetChapters: params.targetChapters,
    staleAfterChapters,
  }).map((hook) => hook.hookId));
  const pressuredHooks = lifecycleEntries.filter(({ hook, lifecycle }) =>
    staleHookIds.has(hook.hookId)
    || lifecycle.readyToResolve
    || lifecycle.overdue,
  );
  const unresolvedPressure = pressuredHooks.filter(({ hook }) => {
    if (!params.delta) {
      return true;
    }

    const disposition = classifyHookDisposition({
      hookId: hook.hookId,
      delta: params.delta,
    });
    return disposition === "none" || disposition === "mention";
  });
  if (unresolvedPressure.length > 0) {
    issues.push(warning(
      params.language,
      buildPressureDescription({
        language: params.language,
        entries: unresolvedPressure,
        mentionsCurrentChapter: Boolean(params.delta),
      }),
      params.language === "en"
        ? "Move one pressured hook with a real payoff, escalation, or explicit defer before opening adjacent debt."
        : params.language === "ko"
          ? "인접한 부채를 확장하기 전에 압박을 받는 복선 하나를 실제 회수, 승격 또는 명시적 연기로 처리하십시오."
          : "先让一个已进入压力区的伏笔发生真实推进、回收或明确延后，再继续扩展同类债务。",
    ));
  } else {
    const latestRealAdvance = activeHooks.reduce(
      (max, hook) => Math.max(max, hook.lastAdvancedChapter),
      0,
    );
    if (
      params.noAdvanceWindow !== undefined
      && activeHooks.length > 0
      && params.chapterNumber - latestRealAdvance >= noAdvanceWindow
    ) {
      issues.push(warning(
        params.language,
        params.language === "en"
          ? `No real hook advancement has landed for ${params.chapterNumber - latestRealAdvance} chapters.`
          : params.language === "ko"
            ? `이미 ${params.chapterNumber - latestRealAdvance}장 동안 실제 복선 진행이 없습니다.`
            : `已经连续 ${params.chapterNumber - latestRealAdvance} 章没有真实伏笔推进。`,
        params.language === "en"
          ? "Schedule one old hook for real movement instead of opening parallel restatements."
          : params.language === "ko"
            ? "다음 장에서는 병렬 재언급 대신 오래된 복선 하나를 실제로 진행시키십시오."
            : "下一章优先让一个旧伏笔发生真实推进，而不是继续平行重述。",
      ));
    }
  }

  if (params.delta) {
    const existingHookIds = new Set(params.existingHookIds ?? []);
    const resultingHookIds = new Set(params.hooks.map((hook) => hook.hookId));
    const newHookIds = params.delta.hookOps.upsert
      .map((hook) => hook.hookId)
      .filter((hookId) => !existingHookIds.has(hookId) && resultingHookIds.has(hookId));

    if (newHookIds.length >= newHookBurstThreshold && params.delta.hookOps.resolve.length === 0) {
      issues.push(warning(
        params.language,
        params.language === "en"
          ? `Opened ${newHookIds.length} new hooks without resolving any older debt.`
          : params.language === "ko"
            ? `이번 챕터에서 새 복선 ${newHookIds.length}개를 열었지만 기존 부채를 회수하지 않았습니다.`
            : `本章新开了 ${newHookIds.length} 个伏笔，但没有回收任何旧债。`,
        params.language === "en"
          ? "Keep the hook table from ballooning by pairing new openings with old payoffs."
          : params.language === "ko"
            ? "복선 표가 비대해지지 않도록 새 복선을 열 때는 기존 복선 회수를 병행하십시오."
            : "控制伏笔膨胀，新开伏笔时尽量配套回收旧伏笔。",
      ));
    }
  }

  return issues;
}

function buildPressureDescription(params: {
  readonly language: "zh" | "ko" | "en";
  readonly entries: ReadonlyArray<{
    readonly hook: HookRecord;
    readonly lifecycle: ReturnType<typeof describeHookLifecycle>;
  }>;
  readonly mentionsCurrentChapter: boolean;
}): string {
  const summarized = params.entries
    .slice(0, 3)
    .map(({ hook, lifecycle }) => {
      const timing = localizeHookPayoffTiming(lifecycle.timing, params.language);
      const pressure = localizePressureLabel(lifecycle, params.language);
      return params.language === "en"
        ? `${hook.hookId} (${timing}, ${pressure})`
        : params.language === "ko"
          ? `${hook.hookId} (${timing}, ${pressure})`
          : `${hook.hookId}（${timing}，${pressure}）`;
    });
  const suffix = params.entries.length > summarized.length
    ? params.language === "en"
      ? `, +${params.entries.length - summarized.length} more`
      : params.language === "ko"
        ? `, +${params.entries.length - summarized.length}개 더`
        : `，另有 ${params.entries.length - summarized.length} 条`
    : "";

  if (params.language === "en") {
    return params.mentionsCurrentChapter
      ? `Hooks are already under payoff pressure but this chapter left them untouched: ${summarized.join(", ")}${suffix}.`
      : `Hooks are already under payoff pressure without recent movement: ${summarized.join(", ")}${suffix}.`;
  }

  if (params.language === "ko") {
    return params.mentionsCurrentChapter
      ? `복선들이 이미 회수/진행 압박을 받고 있는데 이번 챕터에서 전혀 다루지 않았습니다: ${summarized.join(", ")}${suffix}.`
      : `복선들이 이미 회수/진행 압박을 받고 있지만 최근 실제 진행이 없습니다: ${summarized.join(", ")}${suffix}.`;
  }

  return params.mentionsCurrentChapter
    ? `这些伏笔已经进入回收/推进压力，但本章没有真正处理：${summarized.join("、")}${suffix}。`
    : `这些伏笔已经进入回收/推进压力，但近期没有真实推进：${summarized.join("、")}${suffix}。`;
}

function localizePressureLabel(
  lifecycle: ReturnType<typeof describeHookLifecycle>,
  language: "zh" | "ko" | "en",
): string {
  if (lifecycle.overdue) {
    return language === "en" ? "overdue" : language === "ko" ? "기한 초과" : "已逾期";
  }
  if (lifecycle.readyToResolve) {
    return language === "en" ? "ready to pay off" : language === "ko" ? "회수 가능" : "可回收";
  }
  return language === "en" ? "stale" : language === "ko" ? "오래됨" : "陈旧";
}

function warning(
  language: "zh" | "ko" | "en",
  description: string,
  suggestion: string,
): AuditIssue {
  return {
    severity: "warning",
    category: language === "en" ? "Hook Debt" : language === "ko" ? "복선 부채" : "伏笔债务",
    description,
    suggestion,
  };
}
