import { useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  Filter,
  AlertCircle,
  FileSearch,
  BookOpen,
  BarChart3,
} from "lucide-react";
import type { InboxItem } from "@/data/dashboard";

function priorityIndicator(priority: "high" | "medium" | "low"): string {
  if (priority === "high") return "bg-red-500";
  if (priority === "medium") return "bg-amber-400";
  return "bg-[var(--hive-fg-muted)]";
}

function statusBadge(status?: string, color?: string): string {
  if (!status) return "";
  if (color === "running") return "bg-[var(--hive-status-live)] text-[var(--hive-green-deep)]";
  if (color === "warning") return "bg-amber-100 text-amber-700";
  if (color === "complete") return "bg-[var(--hive-accent-dim)] text-[var(--hive-green-mid)]";
  return "bg-[var(--hive-bg-soft)] text-[var(--hive-fg-dim)]";
}

function typeIcon(type: string) {
  switch (type) {
    case "CAMPAIGN":
      return <BarChart3 size={14} />;
    case "REVIEW":
      return <AlertCircle size={14} />;
    case "RESEARCH":
      return <FileSearch size={14} />;
    case "SYNTHESIS":
      return <BookOpen size={14} />;
    default:
      return <AlertCircle size={14} />;
  }
}

function InboxCard({ item }: { readonly item: InboxItem }) {
  return (
    <article className="group rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-4 transition-colors hover:border-[var(--hive-card-border-strong)] hover:bg-[var(--hive-bg-soft)]">
      <div className="flex items-start gap-3">
        {/* Priority dot */}
        <div className="mt-1.5 flex flex-col items-center gap-1.5">
          <span className={`block h-2.5 w-2.5 rounded-full ${priorityIndicator(item.priority)}`} />
        </div>

        <div className="min-w-0 flex-1">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
                {item.type}
              </span>
            </div>
            {item.status && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${statusBadge(item.status, item.statusColor)}`}
              >
                {item.statusColor === "running" && (
                  <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--hive-green-mid)]" />
                )}
                {item.status}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className="mt-1 text-[15px] leading-snug text-[var(--hive-fg-strong)]"
            style={{ fontWeight: 500 }}
          >
            {item.title}
          </h3>

          {/* Subtitle */}
          <p className="mt-0.5 text-[12px] text-[var(--hive-fg-dim)]">{item.subtitle}</p>

          {/* Metadata */}
          <p className="mt-2 text-[11px] text-[var(--hive-fg-muted)]">{item.metadata}</p>

          {/* Progress bar */}
          {item.progress !== undefined && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--hive-card-border)]">
              <div
                className="h-full rounded-full bg-[var(--hive-green-mid)] transition-all duration-500"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          )}

          {/* Latest update */}
          {item.latestUpdate && (
            <p className="mt-2 rounded-[4px] bg-[var(--hive-spark-bg)] px-2.5 py-1.5 text-[12px] italic text-[var(--hive-fg-dim)]">
              {item.latestUpdate}
            </p>
          )}

          {/* Action */}
          {item.actionLabel && (
            <button className="mt-3 flex items-center gap-1 text-[12px] text-[var(--hive-green-mid)] transition-colors hover:text-[var(--hive-green-deep)]">
              {item.actionLabel}
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function AttentionInbox({ items }: { readonly items: readonly InboxItem[] }) {
  const [filterType, setFilterType] = useState<string>("all");

  const filteredItems =
    filterType === "all" ? items : items.filter((item) => item.type === filterType);

  return (
    <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
      <div className="flex items-center justify-between gap-3">
        <h2
          className="text-[18px] tracking-tight text-[var(--hive-fg-strong)]"
          style={{ fontWeight: 500 }}
        >
          Attention Inbox
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterType(filterType === "all" ? "CAMPAIGN" : "all")}
            className="flex items-center gap-1.5 rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] px-2.5 py-1.5 text-[12px] text-[var(--hive-fg-dim)] transition-colors hover:bg-[var(--hive-bg-soft)]"
          >
            <Filter size={12} />
            Filter
          </button>
          <button className="flex items-center gap-1 text-[12px] text-[var(--hive-green-mid)]">
            View All <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {filteredItems.map((item) => (
          <InboxCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
