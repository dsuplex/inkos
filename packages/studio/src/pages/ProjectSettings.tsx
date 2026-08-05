import { useEffect, useRef, useState } from "react";
import { Bell, Bot, FileText, FolderUp, MessageSquare, Radar, RotateCcw, Search, Settings2, Plus, Trash2 } from "lucide-react";
import { fetchJson, postApi, putApi, useApi } from "../hooks/use-api";
import { usePreferencesStore } from "../store/preferences";
import type { Theme } from "../hooks/use-theme";
import type { TFunction } from "../hooks/use-i18n";
import { useI18n } from "../hooks/use-i18n";
import { useColors } from "../hooks/use-colors";
import {
  buildDetectionConfig,
  buildNotifyChannel,
  DEFAULT_DETECTION,
  detectionDraftFromConfig,
  notifyDraftFromChannel,
  NOTIFY_TYPES,
  type DetectionDraft,
  type NotifyChannelDraft,
  type NotifyType,
  type OverrideRow,
} from "./project-settings-model";
import {
  serializeSkillFolder,
  type StudioSkill,
} from "./skill-ui-state";
import {
  groupPromptPacksForDisplay,
  type PromptPacksResponse,
} from "./prompt-pack-ui-state";

interface Nav {
  toDashboard: () => void;
  toServices: () => void;
}

type NoticeTone = "success" | "error" | "info";

interface SkillsResponse {
  readonly skills: ReadonlyArray<StudioSkill>;
  readonly diagnostics?: ReadonlyArray<{ readonly path?: string; readonly message?: string }>;
}

interface ResearchSearchDraft {
  readonly enabled: boolean;
  readonly provider: "tavily" | "custom";
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly apiKeyEnv: string;
}

const DEFAULT_RESEARCH_SEARCH: ResearchSearchDraft = {
  enabled: false,
  provider: "tavily",
  baseUrl: "",
  apiKey: "",
  apiKeyEnv: "TAVILY_API_KEY",
};

// Smooth open/close via grid-template-rows (same trick as the sidebar).
function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

function SettingsCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/50 bg-card/70 p-5 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
        <div>
          <h2 className="text-base font-bold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

const fieldClass = "w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm outline-none focus:border-primary/50";

export function ProjectSettings({ nav, theme, t }: { nav: Nav; theme: Theme; t: TFunction }) {
  const c = useColors(theme);
  const { lang } = useI18n();
  const { data: overridesData, refetch: refetchOverrides } = useApi<{ overrides: Record<string, unknown> }>("/project/model-overrides");
  const { data: defaultModelData, refetch: refetchDefaultModel } = useApi<{ service: string | null; defaultModel: string | null }>("/project/default-model");
  const { data: researchSearchData, refetch: refetchResearchSearch } = useApi<{ researchSearch: Partial<ResearchSearchDraft> }>("/project/research-search");
  const { data: notifyData, refetch: refetchNotify } = useApi<{ channels: unknown[] }>("/project/notify");
  const { data: modeData, refetch: refetchMode } = useApi<{ mode: "legacy" | "v2" }>("/project/input-governance-mode");
  const { data: detectionData, refetch: refetchDetection } = useApi<{ detection: unknown | null }>("/project/detection");
  const { data: skillsData, refetch: refetchSkills } = useApi<SkillsResponse>("/skills");
  const { data: promptPacksData, refetch: refetchPromptPacks } = useApi<PromptPacksResponse>("/prompt-packs");
  const [mode, setMode] = useState<"legacy" | "v2">("v2");
  const [defaultService, setDefaultService] = useState("");
  const [defaultModel, setDefaultModel] = useState("");
  const [researchSearch, setResearchSearch] = useState<ResearchSearchDraft>({ ...DEFAULT_RESEARCH_SEARCH });
  const [overrideRows, setOverrideRows] = useState<OverrideRow[]>([]);
  const [notifyChannels, setNotifyChannels] = useState<NotifyChannelDraft[]>([]);
  const [det, setDet] = useState<DetectionDraft>({ ...DEFAULT_DETECTION });
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [promptDraft, setPromptDraft] = useState("");
  const [notice, setNotice] = useState<{ tone: NoticeTone; message: string } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const skillFolderInputRef = useRef<HTMLInputElement>(null);
  const toolDetailsDefaultOpen = usePreferencesStore((s) => s.toolDetailsDefaultOpen);
  const setToolDetailsDefaultOpen = usePreferencesStore((s) => s.setToolDetailsDefaultOpen);
  const skills = skillsData?.skills ?? [];
  const promptGroups = groupPromptPacksForDisplay(promptPacksData ?? { packs: [], prompts: [] });
  const promptList = promptPacksData?.prompts ?? [];
  const selectedPrompt = promptList.find((prompt) => prompt.id === selectedPromptId) ?? null;
  const promptDirty = Boolean(selectedPrompt && promptDraft !== (selectedPrompt.content ?? ""));

  useEffect(() => {
    if (modeData?.mode) setMode(modeData.mode);
  }, [modeData]);

  useEffect(() => {
    if (!overridesData) return;
    setOverrideRows(Object.entries(overridesData.overrides ?? {}).map(([agent, val]) => {
      if (typeof val === "string") return { agent, model: val };
      const { model, ...rest } = (val ?? {}) as { model?: string };
      return { agent, model: model ?? "", rest };
    }));
  }, [overridesData]);

  useEffect(() => {
    if (!defaultModelData) return;
    setDefaultService(defaultModelData.service ?? "");
    setDefaultModel(defaultModelData.defaultModel ?? "");
  }, [defaultModelData]);

  useEffect(() => {
    if (!researchSearchData) return;
    const raw = researchSearchData.researchSearch ?? {};
    setResearchSearch({
      ...DEFAULT_RESEARCH_SEARCH,
      ...raw,
      provider: raw.provider === "custom" ? "custom" : "tavily",
      baseUrl: raw.baseUrl ?? "",
      apiKey: raw.apiKey ?? "",
      apiKeyEnv: raw.apiKeyEnv ?? "TAVILY_API_KEY",
    });
  }, [researchSearchData]);

  useEffect(() => {
    if (!notifyData) return;
    setNotifyChannels((notifyData.channels ?? []).map(notifyDraftFromChannel));
  }, [notifyData]);

  useEffect(() => {
    if (!detectionData) return;
    setDet(detectionDraftFromConfig(detectionData.detection));
  }, [detectionData]);

  useEffect(() => {
    const prompts = promptPacksData?.prompts ?? [];
    if (prompts.length === 0) {
      setSelectedPromptId(null);
      setPromptDraft("");
      return;
    }
    const next = prompts.find((prompt) => prompt.id === selectedPromptId) ?? prompts[0];
    if (next.id !== selectedPromptId) setSelectedPromptId(next.id);
    setPromptDraft(next.content ?? "");
  }, [promptPacksData, selectedPromptId]);

  const runSave = async (key: string, work: () => Promise<void>, success: string) => {
    setSaving(key);
    setNotice(null);
    try {
      await work();
      setNotice({ tone: "success", message: success });
    } catch (e) {
      setNotice({ tone: "error", message: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(null);
    }
  };

  const importSkillFolder = async (files: FileList | null) => {
    if (!files?.length) return;
    await runSave("skill-import", async () => {
      const serialized = await serializeSkillFolder(files);
      await postApi("/skills/import", { files: serialized });
      await refetchSkills();
    }, lang === "zh" ? "Skill 文件夹已导入" : lang === "ko" ? "Skill 폴더를 가져왔습니다" : "Skill folder imported");
  };

  const updateChannel = (index: number, patch: Partial<NotifyChannelDraft>) => {
    setNotifyChannels((prev) => prev.map((ch, i) => (i === index ? { ...ch, ...patch } : ch)));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={nav.toDashboard} className={c.link}>{t("bread.home")}</button>
        <span className="text-border">/</span>
        <span>{t("settings.title")}</span>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl flex items-center gap-3">
          <Settings2 size={28} className="text-primary" />
          {t("settings.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      {notice && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            notice.tone === "error"
              ? "bg-destructive/10 text-destructive"
              : notice.tone === "info"
                ? "bg-secondary text-muted-foreground"
                : "bg-emerald-500/10 text-emerald-600"
          }`}
        >
          {notice.message}
        </div>
      )}

      <SettingsCard title={t("settings.inputGovernance")} description={t("settings.inputGovernanceHint")} icon={<Radar size={18} />}>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value === "legacy" ? "legacy" : "v2")}
            className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm outline-none"
          >
            <option value="v2">v2</option>
            <option value="legacy">legacy</option>
          </select>
          <button
            onClick={() => runSave("mode", async () => {
              await putApi("/project/input-governance-mode", { mode });
              await refetchMode();
            }, t("settings.saved"))}
            disabled={saving === "mode"}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${c.btnPrimary} disabled:opacity-40`}
          >
            {saving === "mode" ? t("config.saving") : t("config.save")}
          </button>
        </div>
      </SettingsCard>

      {/* Chat UI preferences — applied immediately, persisted in this browser's localStorage */}
      <SettingsCard title={t("settings.chatUi")} description={t("settings.chatUiHint")} icon={<MessageSquare size={18} />}>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={toolDetailsDefaultOpen}
            onChange={(e) => setToolDetailsDefaultOpen(e.target.checked)}
          />
          {t("settings.toolDetailsDefaultOpen")}
        </label>
        <p className="text-xs text-muted-foreground">{t("settings.toolDetailsDefaultOpenHint")}</p>
      </SettingsCard>

      <SettingsCard
        title={lang === "zh" ? "Agent Skills" : lang === "ko" ? "Agent Skill" : "Agent Skills"}
        description={lang === "zh" ? "导入标准 SKILL.md 专业能力包。Chat 可以按意图自主使用，也可以在输入框用 + 号强制启用。" : lang === "ko" ? "표준 SKILL.md 전문가 패키지를 가져옵니다. 채팅이 의도에 따라 자동으로 사용하거나, 입력창에서 + 버튼으로 강제 활성화할 수 있습니다." : "Import standard SKILL.md expertise packages. Chat can choose a skill from intent, or you can force one from the + menu."}
        icon={<Bot size={18} />}
      >
        <div className="space-y-3">
          {skillsData?.diagnostics?.length ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              <div className="font-semibold">{lang === "zh" ? "部分外部 Skill 未加载" : lang === "ko" ? "일부 외부 Skill을 불러오지 못했습니다" : "Some external skills were not loaded"}</div>
              {skillsData.diagnostics.slice(0, 8).map((item, index) => (
                <div key={`${item.path ?? "skill"}-${index}`} className="mt-1 break-all">
                  {item.path ? `${item.path}: ` : ""}{item.message ?? (lang === "zh" ? "格式无效" : lang === "ko" ? "형식이 잘못되었습니다" : "Invalid format")}
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-secondary/20 p-3">
            <div>
              <div className="text-sm font-semibold">{lang === "zh" ? "导入外部 Skill" : lang === "ko" ? "외부 Skill 가져오기" : "Import external skill"}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {lang === "zh" ? "兼容 AgentSkills / OpenClaw：选择包含 SKILL.md 的完整文件夹，静态参考资料会一并导入；脚本不会自动执行。" : lang === "ko" ? "AgentSkills / OpenClaw 호환: SKILL.md가 포함된 전체 폴더를 선택하세요. 정적 참고자료는 함께 가져오며, 스크립트는 자동 실행되지 않습니다." : "AgentSkills / OpenClaw compatible: select a complete folder containing SKILL.md. Static references are imported; scripts are never auto-executed."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => skillFolderInputRef.current?.click()}
              disabled={saving === "skill-import"}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
            >
              <FolderUp size={16} />
              {saving === "skill-import"
                ? (lang === "zh" ? "导入中..." : lang === "ko" ? "가져오는 중..." : "Importing...")
                : (lang === "zh" ? "选择 Skill 文件夹" : lang === "ko" ? "Skill 폴더 선택" : "Choose skill folder")}
            </button>
            <input
              ref={skillFolderInputRef}
              type="file"
              multiple
              className="hidden"
              {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
              onChange={(event) => {
                void importSkillFolder(event.currentTarget.files);
                event.currentTarget.value = "";
              }}
            />
          </div>
          {skills.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">{lang === "zh" ? "还没有 Skill。" : lang === "ko" ? "Skill이 없습니다" : "No skills yet."}</p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {skills.map((skill) => (
                <div key={skill.id} className="rounded-xl border border-border/60 bg-secondary/20 p-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold">{skill.name}</div>
                        <span className="rounded-full bg-background px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {skill.source ?? "skill"}
                        </span>
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-muted-foreground/70">@{skill.id}</div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{skill.description || (lang === "zh" ? "无说明" : lang === "ko" ? "설명 없음" : "No description")}</p>
                    </div>
                    {skill.editable ? (
                      <button
                        type="button"
                        onClick={() => runSave(`delete-skill:${skill.id}`, async () => {
                          await fetchJson(`/skills/${encodeURIComponent(skill.id)}`, { method: "DELETE" });
                          await refetchSkills();
                        }, lang === "zh" ? "Skill 已删除" : lang === "ko" ? "Skill이 삭제되었습니다" : "Skill deleted")}
                        className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        aria-label={lang === "zh" ? `删除 ${skill.name}` : lang === "ko" ? `${skill.name} 삭제` : `Delete ${skill.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SettingsCard>

      <SettingsCard
        title={lang === "zh" ? "提示词" : lang === "ko" ? "프롬프트" : "Prompt packs"}
        description={lang === "zh" ? "集中查看和调整内置提示词。修改会保存为项目级覆盖文件，不会改动内置默认值。" : lang === "ko" ? "내장 프롬프트를 확인하고 조정합니다. 수정사항은 프로젝트 오버라이드 파일로 저장되며 기본값은 변경되지 않습니다." : "Review and tune built-in prompt packs. Edits are saved as project overrides without changing the defaults."}
        icon={<FileText size={18} />}
      >
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-xl border border-border/60 bg-secondary/20 p-3">
            {promptGroups.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                {lang === "zh" ? "没有可编辑提示词。" : lang === "ko" ? "편집 가능한 프롬프트가 없습니다" : "No prompt packs available."}
              </p>
            ) : (
              <div className="space-y-4">
                {promptGroups.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{group.title}</div>
                      {group.description ? (
                        <p className="mt-1 text-[11px] leading-4 text-muted-foreground/80">{group.description}</p>
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      {group.prompts.map((prompt) => (
                        <button
                          key={prompt.id}
                          type="button"
                          onClick={() => {
                            setSelectedPromptId(prompt.id);
                            setPromptDraft(prompt.content ?? "");
                          }}
                          className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                            selectedPromptId === prompt.id
                              ? "border-primary/50 bg-primary/10 text-primary"
                              : "border-border/50 bg-background/40 text-foreground hover:border-primary/30 hover:bg-primary/5"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold">{prompt.title}</span>
                            {prompt.overridden ? (
                              <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                                {lang === "zh" ? "已改" : lang === "ko" ? "수정됨" : "custom"}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground/75">{prompt.id}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border/60 bg-secondary/20 p-3">
            {selectedPrompt ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-bold">{selectedPrompt.title}</div>
                    <div className="mt-1 font-mono text-xs text-muted-foreground">{selectedPrompt.id}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {lang === "zh" ? "当前来源" : lang === "ko" ? "현재 출처" : "Source"}: {selectedPrompt.source}
                      {selectedPrompt.path ? ` · ${selectedPrompt.path}` : ""}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => runSave(`reset-prompt:${selectedPrompt.id}`, async () => {
                        await fetchJson(`/prompt-packs/${encodeURIComponent(selectedPrompt.id)}`, { method: "DELETE" });
                        await refetchPromptPacks();
                      }, lang === "zh" ? "提示词已恢复默认" : lang === "ko" ? "프롬프트가 기본값으로 복원되었습니다" : "Prompt reset to default")}
                      disabled={saving === `reset-prompt:${selectedPrompt.id}` || !selectedPrompt.overridden}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${c.btnSecondary} disabled:opacity-40`}
                    >
                      <RotateCcw size={14} />
                      {lang === "zh" ? "恢复默认" : lang === "ko" ? "기본값 복원" : "Reset"}
                    </button>
                    <button
                      type="button"
                      onClick={() => runSave(`prompt:${selectedPrompt.id}`, async () => {
                        await putApi(`/prompt-packs/${encodeURIComponent(selectedPrompt.id)}`, { content: promptDraft });
                        await refetchPromptPacks();
                      }, lang === "zh" ? "提示词已保存" : lang === "ko" ? "프롬프트가 저장되었습니다" : "Prompt saved")}
                      disabled={saving === `prompt:${selectedPrompt.id}` || !promptDirty}
                      className={`rounded-lg px-4 py-2 text-sm font-bold ${c.btnPrimary} disabled:opacity-40`}
                    >
                      {saving === `prompt:${selectedPrompt.id}` ? t("config.saving") : t("config.save")}
                    </button>
                  </div>
                </div>

                <textarea
                  value={promptDraft}
                  onChange={(e) => setPromptDraft(e.target.value)}
                  rows={12}
                  spellCheck={false}
                  className={`${fieldClass} min-h-[260px] resize-y font-mono leading-6`}
                />

                <details className="rounded-xl border border-border/50 bg-background/50 p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-muted-foreground">
                    {lang === "zh" ? "查看内置默认" : lang === "ko" ? "내장 기본값 보기" : "View built-in default"}
                  </summary>
                  <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-secondary/30 p-3 text-xs leading-5 text-muted-foreground">
                    {selectedPrompt.defaultContent ?? ""}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {lang === "zh" ? "选择左侧提示词后编辑。" : lang === "ko" ? "왼쪽에서 프롬프트를 선택한 후 편집하세요" : "Select a prompt on the left to edit it."}
              </p>
            )}
          </div>
        </div>
      </SettingsCard>

      {/* Model routing — per-agent model overrides */}
      <SettingsCard title={t("settings.modelOverrides")} description={t("settings.modelOverridesHint")} icon={<Bot size={18} />}>
        <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 space-y-2">
          <div>
            <div className="text-sm font-semibold">{t("settings.globalDefaultModel")}</div>
            <p className="mt-1 text-xs text-muted-foreground">{t("settings.globalDefaultModelHint")}</p>
          </div>
          <div className="grid gap-2 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto]">
            <input
              value={defaultService}
              onChange={(e) => setDefaultService(e.target.value)}
              placeholder={t("settings.serviceId")}
              className={`${fieldClass} font-mono`}
            />
            <input
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              placeholder={t("settings.modelId")}
              className={`${fieldClass} font-mono`}
            />
            <button
              onClick={() => runSave("default-model", async () => {
                await putApi("/project/default-model", {
                  service: defaultService.trim() || undefined,
                  defaultModel: defaultModel.trim(),
                });
                await refetchDefaultModel();
              }, t("settings.saved"))}
              disabled={saving === "default-model" || !defaultModel.trim()}
              className={`rounded-lg px-4 py-2 text-sm font-bold ${c.btnPrimary} disabled:opacity-40`}
            >
              {saving === "default-model" ? t("config.saving") : t("config.save")}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {overrideRows.length === 0 && (
            <p className="text-xs text-muted-foreground italic">{t("settings.noOverrides")}</p>
          )}
          {overrideRows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={row.agent}
                onChange={(e) => setOverrideRows((prev) => prev.map((r, j) => (j === i ? { ...r, agent: e.target.value } : r)))}
                placeholder={t("settings.agentName")}
                className={`${fieldClass} flex-1`}
              />
              <span className="text-muted-foreground">→</span>
              <input
                value={row.model}
                onChange={(e) => setOverrideRows((prev) => prev.map((r, j) => (j === i ? { ...r, model: e.target.value } : r)))}
                placeholder={t("settings.modelId")}
                className={`${fieldClass} flex-1 font-mono`}
              />
              <button
                onClick={() => setOverrideRows((prev) => prev.filter((_, j) => j !== i))}
                className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                aria-label="remove"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setOverrideRows((prev) => [...prev, { agent: "", model: "" }])}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${c.btnSecondary}`}
          >
            <Plus size={14} /> {t("settings.addOverride")}
          </button>
          <button
            onClick={() => runSave("overrides", async () => {
              const overrides: Record<string, unknown> = {};
              for (const r of overrideRows) {
                const agent = r.agent.trim();
                const model = r.model.trim();
                if (!agent || !model) continue;
                overrides[agent] = r.rest && Object.keys(r.rest).length > 0 ? { ...r.rest, model } : model;
              }
              await putApi("/project/model-overrides", { overrides });
              await refetchOverrides();
            }, t("settings.saved"))}
            disabled={saving === "overrides"}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${c.btnPrimary} disabled:opacity-40`}
          >
            {saving === "overrides" ? t("config.saving") : t("config.save")}
          </button>
          <button onClick={nav.toServices} className={`rounded-lg px-4 py-2 text-sm font-bold ${c.btnSecondary}`}>
            {t("settings.openModelConfig")}
          </button>
        </div>
      </SettingsCard>

      <SettingsCard
        title={lang === "zh" ? "联网研究搜索服务" : lang === "ko" ? "연구 검색 제공자" : "Research Search Provider"}
        description={lang === "zh" ? "给 research_web 配置外部搜索 API。未配置时仍可用服务器环境变量 TAVILY_API_KEY 作为兜底。" : lang === "ko" ? "research_web에 외부 검색 API를 구성합니다. 구성하지 않으면 서버 환경 변수 TAVILY_API_KEY가 대체로 사용됩니다." : "Configure the external search API used by research_web. If unset, the server may still use TAVILY_API_KEY as a fallback."}
        icon={<Search size={18} />}
      >
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={researchSearch.enabled}
            onChange={(e) => setResearchSearch((prev) => ({ ...prev, enabled: e.target.checked }))}
          />
          {lang === "zh" ? "启用项目级搜索配置" : lang === "ko" ? "프로젝트 수준 검색 구성 활성화" : "Enable project-level search config"}
        </label>
        <Collapse open={researchSearch.enabled}>
          <div className="grid gap-2 pt-1 md:grid-cols-2">
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>{lang === "zh" ? "搜索服务" : lang === "ko" ? "검색 서비스" : "Provider"}</span>
              <select
                value={researchSearch.provider}
                onChange={(e) => setResearchSearch((prev) => ({ ...prev, provider: e.target.value === "custom" ? "custom" : "tavily" }))}
                className={fieldClass}
              >
                <option value="tavily">Tavily</option>
                <option value="custom">Custom / Tavily-compatible</option>
              </select>
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>{lang === "zh" ? "API Key 环境变量名" : lang === "ko" ? "API 키 환경 변수명" : "API key env var"}</span>
              <input
                value={researchSearch.apiKeyEnv}
                onChange={(e) => setResearchSearch((prev) => ({ ...prev, apiKeyEnv: e.target.value }))}
                placeholder="TAVILY_API_KEY"
                className={`${fieldClass} font-mono`}
              />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground md:col-span-2">
              <span>{lang === "zh" ? "Base URL（可选，自定义兼容端点）" : lang === "ko" ? "Base URL (선택사항, 사용자 정의 호환 엔드포인트)" : "Base URL (optional custom compatible endpoint)"}</span>
              <input
                value={researchSearch.baseUrl}
                onChange={(e) => setResearchSearch((prev) => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://api.tavily.com/search"
                className={`${fieldClass} font-mono`}
              />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground md:col-span-2">
              <span>{lang === "zh" ? "API Key（可选；留空则读环境变量）" : lang === "ko" ? "API 키 (선택사항, 비워두면 환경 변수 사용)" : "API key (optional; leave blank to use env var)"}</span>
              <input
                value={researchSearch.apiKey}
                onChange={(e) => setResearchSearch((prev) => ({ ...prev, apiKey: e.target.value }))}
                type="password"
                placeholder={lang === "zh" ? "可直接填 key，或只填环境变量名" : lang === "ko" ? "키를 직접 입력하거나 환경 변수명만 입력" : "Paste key, or use env var only"}
                className={`${fieldClass} font-mono`}
              />
            </label>
          </div>
        </Collapse>
        <button
          onClick={() => runSave("research-search", async () => {
            const next = {
              enabled: researchSearch.enabled,
              provider: researchSearch.provider,
              ...(researchSearch.baseUrl.trim() ? { baseUrl: researchSearch.baseUrl.trim() } : {}),
              ...(researchSearch.apiKey.trim() ? { apiKey: researchSearch.apiKey.trim() } : {}),
              ...(researchSearch.apiKeyEnv.trim() ? { apiKeyEnv: researchSearch.apiKeyEnv.trim() } : {}),
            };
            await putApi("/project/research-search", { researchSearch: next });
            await refetchResearchSearch();
          }, t("settings.saved"))}
          disabled={saving === "research-search"}
          className={`rounded-lg px-4 py-2 text-sm font-bold ${c.btnPrimary} disabled:opacity-40`}
        >
          {saving === "research-search" ? t("config.saving") : t("config.save")}
        </button>
      </SettingsCard>

      {/* Notification channels */}
      <SettingsCard title={t("settings.notify")} description={t("settings.notifyHint")} icon={<Bell size={18} />}>
        <div className="space-y-3">
          {notifyChannels.length === 0 && (
            <p className="text-xs text-muted-foreground italic">{t("settings.noChannels")}</p>
          )}
          {notifyChannels.map((ch, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-secondary/20 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <select
                  value={ch.type}
                  onChange={(e) => updateChannel(i, { type: e.target.value as NotifyType })}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none"
                >
                  {NOTIFY_TYPES.map((nt) => <option key={nt.value} value={nt.value}>{nt.label}</option>)}
                </select>
                <div className="flex-1" />
                <button
                  onClick={() => setNotifyChannels((prev) => prev.filter((_, j) => j !== i))}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="remove"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {ch.type === "telegram" && (
                <div className="grid grid-cols-2 gap-2">
                  <input value={ch.botToken ?? ""} onChange={(e) => updateChannel(i, { botToken: e.target.value })} placeholder="botToken" className={`${fieldClass} font-mono`} />
                  <input value={ch.chatId ?? ""} onChange={(e) => updateChannel(i, { chatId: e.target.value })} placeholder="chatId" className={`${fieldClass} font-mono`} />
                </div>
              )}
              {(ch.type === "feishu" || ch.type === "wechat-work") && (
                <input value={ch.webhookUrl ?? ""} onChange={(e) => updateChannel(i, { webhookUrl: e.target.value })} placeholder="webhookUrl" className={`${fieldClass} font-mono`} />
              )}
              {ch.type === "webhook" && (
                <div className="grid grid-cols-2 gap-2">
                  <input value={ch.url ?? ""} onChange={(e) => updateChannel(i, { url: e.target.value })} placeholder="url" className={`${fieldClass} font-mono`} />
                  <input value={ch.secret ?? ""} onChange={(e) => updateChannel(i, { secret: e.target.value })} placeholder="secret (可选)" className={`${fieldClass} font-mono`} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setNotifyChannels((prev) => [...prev, { type: "feishu" }])}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${c.btnSecondary}`}
          >
            <Plus size={14} /> {t("settings.addChannel")}
          </button>
          <button
            onClick={() => runSave("notify", async () => {
              await putApi("/project/notify", { channels: notifyChannels.map(buildNotifyChannel) });
              await refetchNotify();
            }, t("settings.saved"))}
            disabled={saving === "notify"}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${c.btnPrimary} disabled:opacity-40`}
          >
            {saving === "notify" ? t("config.saving") : t("config.save")}
          </button>
        </div>
      </SettingsCard>

      {/* AIGC detection */}
      <SettingsCard title={t("settings.detection")} description={t("settings.detectionHint")} icon={<Radar size={18} />}>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={det.enabled} onChange={(e) => setDet((d) => ({ ...d, enabled: e.target.checked }))} />
          {t("settings.detectionEnable")}
        </label>
        <Collapse open={det.enabled}>
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-muted-foreground space-y-1">
                <span>{t("settings.detectionProvider")}</span>
                <select value={det.provider} onChange={(e) => setDet((d) => ({ ...d, provider: e.target.value }))} className={fieldClass}>
                  <option value="custom">custom</option>
                  <option value="gptzero">gptzero</option>
                  <option value="originality">originality</option>
                </select>
              </label>
              <label className="text-xs text-muted-foreground space-y-1">
                <span>{t("settings.detectionApiKeyEnv")}</span>
                <input value={det.apiKeyEnv} onChange={(e) => setDet((d) => ({ ...d, apiKeyEnv: e.target.value }))} placeholder="DETECTOR_API_KEY" className={`${fieldClass} font-mono`} />
              </label>
            </div>
            <label className="text-xs text-muted-foreground space-y-1 block">
              <span>{t("settings.detectionApiUrl")}</span>
              <input value={det.apiUrl} onChange={(e) => setDet((d) => ({ ...d, apiUrl: e.target.value }))} placeholder="https://..." className={`${fieldClass} font-mono`} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-muted-foreground space-y-1">
                <span>{t("settings.detectionThreshold")} (0–1)</span>
                <input type="number" min={0} max={1} step={0.05} value={det.threshold} onChange={(e) => setDet((d) => ({ ...d, threshold: Number(e.target.value) }))} className={fieldClass} />
              </label>
              <label className="text-xs text-muted-foreground space-y-1">
                <span>{t("settings.detectionMaxRetries")} (1–10)</span>
                <input type="number" min={1} max={10} step={1} value={det.maxRetries} onChange={(e) => setDet((d) => ({ ...d, maxRetries: Number(e.target.value) }))} className={fieldClass} />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={det.autoRewrite} onChange={(e) => setDet((d) => ({ ...d, autoRewrite: e.target.checked }))} />
              {t("settings.detectionAutoRewrite")}
            </label>
          </div>
        </Collapse>
        <button
          onClick={() => runSave("detection", async () => {
            const payload = { detection: buildDetectionConfig(det) };
            await fetchJson("/project/detection", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            await refetchDetection();
          }, t("settings.saved"))}
          disabled={saving === "detection"}
          className={`rounded-lg px-4 py-2 text-sm font-bold ${c.btnPrimary} disabled:opacity-40`}
        >
          {saving === "detection" ? t("config.saving") : t("config.save")}
        </button>
      </SettingsCard>
    </div>
  );
}
