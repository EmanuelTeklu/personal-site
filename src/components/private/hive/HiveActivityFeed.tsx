import type { CSSProperties } from "react";
import type { ActivityLane, ActivitySeverity, HiveActivityEntry } from "@/types/hive";

interface HiveActivityFeedProps {
  readonly entries: readonly HiveActivityEntry[];
}

const LANE_STYLE: Record<ActivityLane, CSSProperties> = {
  S2: {
    backgroundColor: "var(--hive-bg-soft)",
    color: "var(--hive-fg-dim)",
    borderColor: "var(--hive-card-border)",
  },
  S3: {
    backgroundColor: "var(--hive-accent-dim)",
    color: "var(--hive-green-mid)",
    borderColor: "var(--hive-green-light)",
  },
  S4: {
    backgroundColor: "var(--hive-surface-muted)",
    color: "var(--hive-fg-dim)",
    borderColor: "var(--hive-card-border)",
  },
  META: {
    backgroundColor: "var(--hive-status-idle)",
    color: "var(--hive-green-deep)",
    borderColor: "var(--hive-card-border-strong)",
  },
};

const SEVERITY_LINE: Record<ActivitySeverity, CSSProperties> = {
  routine: { borderLeftColor: "var(--hive-line)" },
  watch: { borderLeftColor: "var(--hive-green-light)" },
  critical: { borderLeftColor: "var(--hive-green-deep)" },
};

const STAGE_LABEL: Record<HiveActivityEntry["stage"], string> = {
  observe: "Observe",
  decide: "Decide",
  execute: "Execute",
  verify: "Verify",
};

export function HiveActivityFeed({ entries }: HiveActivityFeedProps) {
  return (
    <section className="overflow-hidden rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)]">
      <header className="flex items-center justify-between border-b border-[var(--hive-card-border)] px-5 py-4">
        <div>
          <h3 className="text-sm font-medium text-[var(--hive-fg)]">Activity Ledger</h3>
          <p className="text-[10px] font-[var(--mono)] uppercase tracking-[0.15em] text-[var(--hive-fg-muted)]">
            rolling operations timeline
          </p>
        </div>
        <span className="rounded-full border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-2 py-0.5 text-[10px] font-[var(--mono)] tracking-[0.12em] text-[var(--hive-fg-dim)]">
          {entries.length} logs
        </span>
      </header>

      <ul className="max-h-[420px] divide-y divide-[var(--hive-card-border)] overflow-y-auto">
        {entries.map((entry) => (
          <li key={`${entry.time}-${entry.msg}`} className="border-l-2 px-5 py-3" style={SEVERITY_LINE[entry.severity]}>
            <div className="flex items-start gap-3">
              <div className="pt-0.5 text-center">
                <p className="text-base leading-none text-[var(--hive-green-deep)]">{entry.glyph}</p>
                <p className="pt-1 text-[10px] font-[var(--mono)] text-[var(--hive-fg-muted)]">{entry.time}</p>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-sm leading-relaxed text-[var(--hive-fg)]">{entry.msg}</p>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-[var(--mono)] uppercase tracking-[0.12em]">
                  <span className="rounded-full border px-2 py-0.5" style={LANE_STYLE[entry.lane]}>
                    {entry.lane}
                  </span>
                  <span className="rounded-full border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-2 py-0.5 text-[var(--hive-fg-dim)]">
                    {STAGE_LABEL[entry.stage]}
                  </span>
                  <span className="text-[var(--hive-fg-muted)]">{entry.source}</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
