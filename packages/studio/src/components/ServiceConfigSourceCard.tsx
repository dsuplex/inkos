import { useEffect, useState } from "react";
import { fetchJson } from "../hooks/use-api";
import { tr } from "../lib/app-language";

type ConfigSource = "env" | "studio";
type EnvScope = "project" | "global" | null;

interface EnvConfigSummary {
  detected: boolean;
  provider: string | null;
  baseUrl: string | null;
  model: string | null;
  hasApiKey: boolean;
}

interface ServiceConfigPayload {
  services: Array<Record<string, unknown>>;
  defaultModel: string | null;
  configSource: ConfigSource;
  storedConfigSource?: ConfigSource;
  envConfig: {
    project: EnvConfigSummary;
    global: EnvConfigSummary;
    effectiveSource: EnvScope;
    runtimeUsesEnv: boolean;
  };
}

export function ServiceConfigSourceCard({ onChange }: { onChange?: () => void }) {
  const [data, setData] = useState<ServiceConfigPayload | null>(null);
  const [saving, setSaving] = useState<ConfigSource | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const payload = await fetchJson<ServiceConfigPayload>("/services/config");
      setData(payload);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("读取配置来源失败", "설정 소스 읽기 실패", "Failed to load config source"));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const switchSource = async (configSource: ConfigSource) => {
    setSaving(configSource);
    try {
      await fetchJson("/services/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configSource }),
      });
      await load();
      onChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("切换配置来源失败", "설정 소스 전환 실패", "Failed to switch config source"));
    } finally {
      setSaving(null);
    }
  };

  const importEnvConfig = async () => {
    setImporting(true);
    try {
      await fetchJson("/services/config/import-env", {
        method: "POST",
      });
      await load();
      onChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("导入环境变量配置失败", "환경 변수 설정 가져오기 실패", "Failed to import env config"));
    } finally {
      setImporting(false);
    }
  };

  if (!data && !error) {
    return (
      <div className="rounded-xl border border-border/40 bg-card/70 p-4 text-sm text-muted-foreground/70">
        {tr("正在读取配置来源…", "설정 소스 읽는 중…", "Loading config source…")}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-4 text-sm text-amber-600">
        {error ?? tr("读取配置来源失败", "설정 소스 읽기 실패", "Failed to load config source")}
      </div>
    );
  }

  const { configSource, envConfig } = data;
  const storedConfigSource = data.storedConfigSource ?? configSource;
  const activeEnvSummary = envConfig.effectiveSource === "project" ? envConfig.project : envConfig.global;
  const envLabel = envConfig.effectiveSource === "project"
    ? tr("项目 .env", "프로젝트 .env", "Project .env")
    : envConfig.effectiveSource === "global"
      ? tr("全局 ~/.inkos/.env", "전역 ~/.inkos/.env", "Global ~/.inkos/.env")
      : null;
  const envDetected = envConfig.project.detected || envConfig.global.detected;

  return (
    <div className="rounded-xl border border-border/40 bg-card/70 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{tr("LLM 配置来源", "LLM 설정 소스", "LLM config source")}</div>
          <div className="text-xs text-muted-foreground/70 mt-1">
            {tr("Studio 运行时：", "Studio 런타임:", "Studio runtime:")}
            <span className="text-foreground"> {tr("使用服务页配置和 Studio 密钥", "서비스 페이지 설정과 Studio 키 사용", "uses service page config and Studio keys")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void switchSource("studio")}
            disabled={saving !== null || importing || configSource === "studio"}
            className="rounded-lg border border-border/50 px-3 py-1.5 text-xs hover:bg-secondary/50 disabled:opacity-50"
          >
            {saving === "studio" ? tr("切换中…", "전환 중…", "Switching…") : tr("使用 Studio 配置", "Studio 설정 사용", "Use Studio config")}
          </button>
          {envDetected && activeEnvSummary.hasApiKey ? (
            <button
              type="button"
              onClick={() => void importEnvConfig()}
              disabled={saving !== null || importing}
              className="rounded-lg border border-border/50 bg-secondary/40 px-3 py-1.5 text-xs hover:bg-secondary/70 disabled:opacity-50"
            >
              {importing ? tr("导入中…", "가져오는 중…", "Importing…") : tr("导入检测到的配置", "감지된 설정 가져오기", "Import detected config")}
            </button>
          ) : null}
        </div>
      </div>

      {storedConfigSource === "env" ? (
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.04] p-3 text-xs text-muted-foreground/80">
          {tr(
            "检测到旧配置标记为 `.env` 优先。Studio 运行时不会使用它；CLI、daemon 和部署环境仍可按 env 覆盖层使用。",
            "이전 설정에서 `.env` 우선으로 표시됨. Studio 런타임은 무시함; CLI, 데몬, 배포 환경은 여전히 env 오버라이드 레이어를 사용할 수 있음.",
            "A legacy setting marks `.env` as preferred. The Studio runtime ignores it; CLI, daemon, and deployment environments may still use the env override layer.",
          )}
        </div>
      ) : null}

      {envDetected ? (
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.04] p-3 text-xs text-muted-foreground/80 space-y-1.5">
          <div className="text-foreground">
            {tr("检测到 LLM 环境变量覆盖：", "LLM 환경 변수 오버라이드 감지:", "Detected LLM environment variable override:")}
            <span className="font-medium"> {envLabel ?? tr("已检测到但未定位来源", "감지되었으나 소스를 찾을 수 없음", "detected but source not located")}</span>
          </div>
          {activeEnvSummary.baseUrl ? <div>Base URL: <span className="font-mono text-foreground">{activeEnvSummary.baseUrl}</span></div> : null}
          {activeEnvSummary.model ? <div>Model: <span className="font-mono text-foreground">{activeEnvSummary.model}</span></div> : null}
          {activeEnvSummary.provider ? <div>Provider: <span className="font-mono text-foreground">{activeEnvSummary.provider}</span></div> : null}
          <div>API Key: <span className="text-foreground">{activeEnvSummary.hasApiKey ? tr("已设置", "설정됨", "set") : tr("未设置", "미설정", "not set")}</span></div>
          <div className="text-muted-foreground/70 pt-1">
            {tr(
              "当前虽然检测到 .env，但 Studio 和 Agent 请求不会直接使用这套覆盖；点击“导入检测到的配置”后，会把它保存为 Studio 服务配置。",
              "현재 .env가 감지되었으나 Studio와 Agent 요청은 이 오버라이드를 직접 사용하지 않음. '감지된 설정 가져오기'를 클릭하면 Studio 서비스 설정으로 저장됨.",
              "A .env override was detected, but Studio and agent requests do not use it directly. Click “Import detected config” to save it as Studio service config.",
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border/30 bg-secondary/20 p-3 text-xs text-muted-foreground/75">
          {tr(
            "未检测到目录或全局 `.env` 里的 LLM 覆盖变量。当前会直接使用项目配置和 Studio 服务配置。",
            "프로젝트나 전역 `.env`에서 LLM 오버라이드 변수가 감지되지 않음. 프로젝트 설정과 Studio 서비스 설정이 직접 사용됨.",
            "No LLM override variables detected in the project or global `.env`. Project config and Studio service config are used directly.",
          )}
        </div>
      )}

      {error ? (
        <div className="text-xs text-rose-500">{error}</div>
      ) : null}
    </div>
  );
}
