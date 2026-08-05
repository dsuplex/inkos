import {
  Zap,
  Search,
  FileOutput,
  TrendingUp,
} from "lucide-react";

export interface QuickActionsProps {
  readonly onAction: (command: string, requestedIntent?: "write_next") => void;
  readonly disabled: boolean;
  readonly lang: "zh" | "ko" | "en";
}

interface ChipDef {
  readonly icon: React.ReactNode;
  readonly labelZh: string;
  readonly labelKo: string;
  readonly labelEn: string;
  readonly commandZh: string;
  readonly commandKo: string;
  readonly commandEn: string;
  readonly requestedIntent?: "write_next";
}

const CHIPS: ReadonlyArray<ChipDef> = [
  {
    icon: <Zap size={12} />,
    labelZh: "写下一章",
    labelKo: "다음 장 쓰기",
    labelEn: "Write next",
    commandZh: "写下一章",
    commandKo: "다음 장 쓰기",
    commandEn: "write next",
    requestedIntent: "write_next",
  },
  {
    icon: <Search size={12} />,
    labelZh: "审计",
    labelKo: "감사",
    labelEn: "Audit",
    commandZh: "审计",
    commandKo: "감사",
    commandEn: "audit",
  },
  {
    icon: <FileOutput size={12} />,
    labelZh: "导出",
    labelKo: "내보내기",
    labelEn: "Export",
    commandZh: "导出全书",
    commandKo: "책 내보내기",
    commandEn: "export book",
  },
  {
    icon: <TrendingUp size={12} />,
    labelZh: "市场雷达",
    labelKo: "시장 레이더",
    labelEn: "Market radar",
    commandZh: "扫描市场趋势",
    commandKo: "시장 동향 스캔",
    commandEn: "scan market trends",
  },
];

function labelFor(chip: ChipDef, lang: "zh" | "ko" | "en"): string {
  return lang === "zh" ? chip.labelZh : lang === "ko" ? chip.labelKo : chip.labelEn;
}
function commandFor(chip: ChipDef, lang: "zh" | "ko" | "en"): string {
  return lang === "zh" ? chip.commandZh : lang === "ko" ? chip.commandKo : chip.commandEn;
}

export function QuickActions({ onAction, disabled, lang }: { readonly onAction: QuickActionsProps["onAction"]; readonly disabled: boolean; readonly lang: "zh" | "ko" | "en" }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-1 py-1">
      {CHIPS.map((chip) => {
        const label = labelFor(chip, lang);
        const command = commandFor(chip, lang);
        return (
          <button
            key={label}
            onClick={() => onAction(command, chip.requestedIntent)}
            disabled={disabled}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/30 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all disabled:opacity-40 disabled:pointer-events-none group"
          >
            <span className="group-hover:scale-110 transition-transform">{chip.icon}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
