import { useState, type CSSProperties } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { HiveCampaign, HiveCampaignStatus, HiveTask } from "@/types/hive";

interface HiveCampaignCardProps {
  readonly campaign: HiveCampaign;
}

const STATUS_LABEL: Record<HiveCampaignStatus, string> = {
  active: "ACTIVE",
  planning: "PLANNING",
  queued: "QUEUED",
  done: "COMPLETE",
};

const STATUS_STYLE: Record<HiveCampaignStatus, CSSProperties> = {
  active: {
    backgroundColor: "var(--hive-status-live)",
    color: "var(--hive-green-deep)",
    borderColor: "var(--hive-green-light)",
  },
  planning: {
    backgroundColor: "var(--hive-surface-muted)",
    color: "var(--hive-fg-dim)",
    borderColor: "var(--hive-card-border)",
  },
  queued: {
    backgroundColor: "var(--hive-bg-soft)",
    color: "var(--hive-fg-muted)",
    borderColor: "var(--hive-card-border)",
  },
  done: {
    backgroundColor: "var(--hive-accent-dim)",
    color: "var(--hive-green-mid)",
    borderColor: "var(--hive-green-light)",
  },
};

const RISK_LABEL: Record<HiveCampaign["risk"], string> = {
  low: "LOW RISK",
  watch: "WATCH",
  high: "HIGH RISK",
};

const RISK_STYLE: Record<HiveCampaign["risk"], CSSProperties> = {
  low: {
    backgroundColor: "var(--hive-accent-dim)",
    color: "var(--hive-green-mid)",
    borderColor: "var(--hive-green-light)",
  },
  watch: {
    backgroundColor: "var(--hive-surface-muted)",
    color: "var(--hive-fg-dim)",
    borderColor: "var(--hive-card-border)",
  },
  high: {
    backgroundColor: "var(--hive-status-offline)",
    color: "var(--hive-card-bg)",
    borderColor: "var(--hive-green-deep)",
  },
};

const TASK_STATUS_STYLE: Record<HiveTask["status"], CSSProperties> = {
  done: {
    backgroundColor: "var(--hive-accent-dim)",
    color: "var(--hive-green-mid)",
    borderColor: "var(--hive-green-light)",
  },
  active: {
    backgroundColor: "var(--hive-status-live)",
    color: "var(--hive-green-deep)",
    borderColor: "var(--hive-green-light)",
  },
  pending: {
    backgroundColor: "var(--hive-bg-soft)",
    color: "var(--hive-fg-muted)",
    borderColor: "var(--hive-card-border)",
  },
};

const TASK_STATUS_LABEL: Record<HiveTask["status"], string> = {
  done: "DONE",
  active: "ACTIVE",
  pending: "PENDING",
};

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(2)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return String(tokens);
}

function formatCost(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function HiveCampaignCard({ campaign }: HiveCampaignCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="rounded-2xl border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)]">
      <button
        onClick={() => setExpanded((previous) => !previous)}
        className="w-full p-5 text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-[var(--hive-fg-muted)]">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>

          <div className="min-w-0 flex-1 space-y-4">
            <header className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[1.05rem] font-medium text-[var(--hive-fg-strong)]">
                  {campaign.name}
                </h3>
                <span
                  className="rounded-full border px-2.5 py-0.5 text-[10px] font-[var(--mono)] tracking-[0.12em]"
                  style={STATUS_STYLE[campaign.status]}
                >
                  {STATUS_LABEL[campaign.status]}
                </span>
                <span className="rounded-full border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-2.5 py-0.5 text-[10px] font-[var(--mono)] tracking-[0.12em] text-[var(--hive-fg-dim)]">
                  {campaign.staffCell}
                </span>
                <span
                  className="rounded-full border px-2.5 py-0.5 text-[10px] font-[var(--mono)] tracking-[0.12em]"
                  style={RISK_STYLE[campaign.risk]}
                >
                  {RISK_LABEL[campaign.risk]}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--hive-fg-dim)]">{campaign.objective}</p>
            </header>

            <section className="grid grid-cols-2 gap-x-5 gap-y-3 border-y border-[var(--hive-card-border)] py-3 text-xs sm:grid-cols-4">
              <div>
                <p className="font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">Phase</p>
                <p className="pt-1 font-medium text-[var(--hive-fg)]">{campaign.phase}</p>
              </div>
              <div>
                <p className="font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">Owner</p>
                <p className="pt-1 font-medium text-[var(--hive-fg)]">{campaign.owner}</p>
              </div>
              <div>
                <p className="font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">Swarms</p>
                <p className="pt-1 font-medium text-[var(--hive-fg)]">{campaign.swarmCount}</p>
              </div>
              <div>
                <p className="font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">ETA</p>
                <p className="pt-1 font-medium text-[var(--hive-fg)]">{campaign.eta ?? "Complete"}</p>
              </div>
            </section>

            <section className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-[var(--mono)] uppercase tracking-[0.12em]">
                <span className="text-[var(--hive-fg-muted)]">Progress</span>
                <span className="text-[var(--hive-fg-dim)]">{campaign.progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--hive-surface-muted)]">
                <div
                  className="h-full rounded-full bg-[var(--hive-green-mid)]"
                  style={{ width: `${campaign.progress}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-[var(--mono)] text-[var(--hive-fg-dim)]">
                <span>{formatCost(campaign.apiCost)} / {formatCost(campaign.budget)}</span>
                <span>{formatTokens(campaign.tokens)} TOK</span>
                <span>{campaign.linesWritten.toLocaleString()} LOC</span>
              </div>
            </section>
          </div>
        </div>
      </button>

      {expanded && (
        <section className="border-t border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-5 py-4">
          {campaign.tasks.length === 0 ? (
            <p className="text-sm text-[var(--hive-fg-muted)]">No active tasks in this campaign lane.</p>
          ) : (
            <div className="space-y-2.5">
              {campaign.tasks.map((task) => (
                <div
                  key={task.name}
                  className="rounded-xl border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--hive-fg)]">{task.name}</p>
                      <p className="text-[11px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">
                        {task.cell} lane
                      </p>
                    </div>
                    <span
                      className="rounded-full border px-2 py-0.5 text-[10px] font-[var(--mono)] tracking-[0.1em]"
                      style={TASK_STATUS_STYLE[task.status]}
                    >
                      {TASK_STATUS_LABEL[task.status]}
                    </span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--hive-surface-muted)]">
                    <div
                      className="h-full rounded-full bg-[var(--hive-green-mid)]"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </article>
  );
}
