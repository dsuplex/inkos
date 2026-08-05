import { useEffect, useState } from "react";
import { fetchJson } from "../../hooks/use-api";
import { useChatStore } from "../../store/chat";
import { SidebarCard } from "./SidebarCard";
import { cn } from "../../lib/utils";

interface ChapterMeta {
  number: number;
  title: string;
  status: string;
  wordCount: number;
}

const STATUS_INDICATOR: Record<string, { symbol: string; color: string }> = {
  approved: { symbol: "✓", color: "text-emerald-500" },
  "ready-for-review": { symbol: "◆", color: "text-amber-500" },
  drafted: { symbol: "○", color: "text-muted-foreground" },
  "needs-revision": { symbol: "✕", color: "text-destructive" },
  imported: { symbol: "◇", color: "text-blue-500" },
};

interface ChaptersSectionProps {
  readonly bookId: string;
  readonly lang: "zh" | "ko" | "en";
}

export function ChaptersSection({ bookId, lang }: ChaptersSectionProps) {
  const [chapters, setChapters] = useState<ReadonlyArray<ChapterMeta>>([]);
  const bookDataVersion = useChatStore((s) => s.bookDataVersion);

  useEffect(() => {
    fetchJson<{ chapters: ChapterMeta[] }>(`/books/${bookId}`)
      .then((data) => setChapters(data.chapters))
      .catch(() => setChapters([]));
  }, [bookId, bookDataVersion]);

  return (
    <SidebarCard title={lang === "zh" ? "章节" : lang === "ko" ? "챕터" : "Chapters"}>
      {chapters.length === 0 ? (
        <p className="text-[15px] leading-6 text-muted-foreground/50 italic">
          {lang === "zh" ? "暂无章节" : lang === "ko" ? "아직 챕터 없음" : "No chapters"}
        </p>
      ) : (
        <ul className="space-y-1 max-h-52 overflow-y-auto overflow-x-hidden">
          {chapters.map((ch) => {
            const ind = STATUS_INDICATOR[ch.status] ?? { symbol: "○", color: "text-muted-foreground" };
            return (
              <li
                key={`${ch.number}-${ch.title ?? ""}`}
                onClick={() => useChatStore.getState().openChapterArtifact(ch.number)}
                className="flex items-center gap-2 py-1 text-[15px] leading-6 text-muted-foreground cursor-pointer hover:text-foreground transition-colors rounded px-1 -mx-1 hover:bg-secondary/50">
                <span className={cn("text-[13px] shrink-0", ind.color)}>{ind.symbol}</span>
                <span className="truncate flex-1">
                  {String(ch.number).padStart(2, "0")} {ch.title || (lang === "zh" ? `第${ch.number}章` : lang === "ko" ? `${ch.number}장` : `Chapter ${ch.number}`)}
                </span>
                <span className="tabular-nums text-[13px] text-muted-foreground/50 shrink-0">
                  {(ch.wordCount ?? 0).toLocaleString()}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </SidebarCard>
  );
}
