import { ExternalLink } from "lucide-react";
import { tr } from "../lib/app-language";

interface ServiceQuickLink {
  readonly label: string;
  readonly href: string;
}

// 标签在调用时通过 tr() 解析语言，所以这里存 zh/ko/en 对而不是最终字符串。
const SERVICE_QUICK_LINKS: Record<string, ReadonlyArray<{ zh: string; ko: string; en: string; href: string }>> = {
  kimicode: [
    { zh: "官网", ko: "공식 사이트", en: "Website", href: "https://www.kimi.com?aff=inkos" },
  ],
  kimiCodingPlan: [
    { zh: "官网", ko: "공식 사이트", en: "Website", href: "https://www.kimi.com?aff=inkos" },
  ],
  kkaiapi: [
    { zh: "官网", ko: "공식 사이트", en: "Website", href: "https://kkaiapi.com/" },
    { zh: "API 文档", ko: "API 문서", en: "API docs", href: "https://kkaiapi.com/docs" },
    { zh: "模型/价格", ko: "모델/가격", en: "Models & pricing", href: "https://kkaiapi.com/models" },
  ],
  moonshot: [
    { zh: "开放平台", ko: "개발자 플랫폼", en: "Developer platform", href: "https://platform.kimi.com?aff=inkos" },
  ],
  openrouter: [
    { zh: "API Keys", ko: "API 키", en: "API Keys", href: "https://openrouter.ai/keys" },
    { zh: "模型", ko: "모델", en: "Models", href: "https://openrouter.ai/models" },
    { zh: "文档", ko: "문서", en: "Docs", href: "https://openrouter.ai/docs/api-reference/overview" },
  ],
};

export function getServiceQuickLinks(serviceId: string): ReadonlyArray<ServiceQuickLink> {
  return (SERVICE_QUICK_LINKS[serviceId] ?? []).map((link) => ({
    label: tr(link.zh, link.ko ?? "", link.en),
    href: link.href,
  }));
}

export function ServiceQuickLinks({
  serviceId,
  variant = "detail",
  className = "",
}: {
  readonly serviceId: string;
  readonly variant?: "card" | "detail";
  readonly className?: string;
}) {
  const links = getServiceQuickLinks(serviceId);
  if (links.length === 0) return null;

  const compact = variant === "card";
  return (
    <div
      className={[
        "flex flex-wrap items-center gap-1.5 text-muted-foreground/70",
        compact ? "text-[11px]" : "text-xs",
        className,
      ].filter(Boolean).join(" ")}
    >
      {!compact && <span className="mr-0.5">{tr("配置入口", "설정 바로가기", "Quick links")}</span>}
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className={[
            "inline-flex items-center gap-1 rounded-md border border-border/40 bg-card/50 font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground",
            compact ? "px-1.5 py-0.5" : "px-2 py-1",
          ].join(" ")}
        >
          {link.label}
          <ExternalLink size={compact ? 10 : 11} />
        </a>
      ))}
    </div>
  );
}
