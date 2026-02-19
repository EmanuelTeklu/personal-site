import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Pause,
  Square,
  ArrowRight,
  Zap,
} from "lucide-react";
import type { Campaign } from "@/data/dashboard";

function statusDot(status: Campaign["status"]): string {
  if (status === "running") return "bg-[var(--hive-green-bright)] animate-pulse";
  if (status === "complete") return "bg-[var(--hive-green-mid)]";
  if (status === "paused") return "bg-amber-400";
  if (status === "failed") return "bg-red-400";
  return "bg-[var(--hive-fg-muted)]";
}

function statusLabel(status: Campaign["status"]): string {
  return status.toUpperCase();
}

function statusTone(status: Campaign["status"]): string {
  if (status === "running") return "bg-[var(--hive-status-live)] text-[var(--hive-green-deep)]";
  if (status === "complete") return "bg-[var(--hive-accent-dim)] text-[var(--hive-green-mid)]";
  if (status === "paused") return "bg-amber-100 text-amber-700";
  if (status === "failed") return "bg-red-100 text-red-700";
  return "bg-[var(--hive-bg-soft)] text-[var(--hive-fg-dim)]";
}

export function CampaignCard({ campaign }: { readonly campaign: Campaign }) {
  const [expanded, setExpanded] = useState(campaign.status === "running");

  return (
    <article className="overflow-hidden rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)]">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left transition-colors hover:bg-[var(--hive-bg-soft)]"
      >
        <div className="flex items-center gap-3">
          <span className={`block h-2.5 w-2.5 rounded-full ${statusDot(campaign.status)}`} />
          <h3
            className="text-[16px] tracking-tight text-[var(--hive-fg-strong)]"
            style={{ fontWeight: 500 }}
          >
            {campaign.name}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${statusTone(campaign.status)}`}
          >
            {statusLabel(campaign.status)}
          </span>
          {expanded ? (
            <ChevronUp size={16} className="text-[var(--hive-fg-muted)]" />
          ) : (
            <ChevronDown size={16} className="text-[var(--hive-fg-muted)]" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-[var(--hive-card-border)] px-6 py-5">
          {/* Question */}
          <p className="rounded-[4px] bg-[var(--hive-spark-bg)] px-3 py-2 text-[13px] italic leading-relaxed text-[var(--hive-fg-dim)]">
            {campaign.question}
          </p>

          {/* Progress and Budget */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-[var(--hive-radius-sm)] bg-[var(--hive-bg-soft)] p-4">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">
                <span>Progress</span>
                <span style={{ fontFamily: "var(--mono)" }}>
                  {campaign.progress.current}/{campaign.progress.total} ({campaign.progress.percentage}%)
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--hive-card-border)]">
                <div
                  className="h-full rounded-full bg-[var(--hive-green-mid)] transition-all duration-500"
                  style={{ width: `${campaign.progress.percentage}%` }}
                />
              </div>
            </div>

            <div className="rounded-[var(--hive-radius-sm)] bg-[var(--hive-bg-soft)] p-4">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">
                <span>Budget</span>
                <span style={{ fontFamily: "var(--mono)" }}>
                  ${campaign.budget.spent.toFixed(2)}/${campaign.budget.cap.toFixed(0)}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--hive-card-border)]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${campaign.budget.percentage > 80 ? "bg-amber-400" : "bg-[var(--hive-green-mid)]"}`}
                  style={{ width: `${campaign.budget.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Agents Assigned */}
          {campaign.agents.length > 0 && (
            <div className="mt-5">
              <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
                Agents Assigned
              </p>
              <div className="flex flex-wrap gap-3">
                {campaign.agents.map((agent) => (
                  <div
                    key={agent.code}
                    className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] px-3 py-2"
                  >
                    <p
                      className="text-[13px] text-[var(--hive-fg-strong)]"
                      style={{ fontFamily: "var(--mono)", fontWeight: 500 }}
                    >
                      {agent.code}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--hive-fg-muted)]">
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          agent.status === "active" ? "bg-[var(--hive-green-bright)]" : "bg-[var(--hive-fg-muted)]"
                        }`}
                      />
                      {agent.status}
                      <span className="text-[var(--hive-fg-dim)]">{agent.reputation.toFixed(2)} rep</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {campaign.recentActivity.length > 0 && (
            <div className="mt-5">
              <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
                Recent Activity
              </p>
              <div className="space-y-0 border-l-2 border-[var(--hive-card-border)] pl-4">
                {campaign.recentActivity.map((activity, index) => (
                  <div key={index} className="relative py-1.5">
                    <span className="absolute -left-[21px] top-1/2 block h-2 w-2 -translate-y-1/2 rounded-full border-2 border-[var(--hive-card-bg)] bg-[var(--hive-green-mid)]" />
                    <div className="flex items-baseline justify-between gap-3 text-[12px]">
                      <p className="text-[var(--hive-fg)]">
                        <span className="text-[var(--hive-green-mid)]" style={{ fontFamily: "var(--mono)" }}>
                          {activity.agent}
                        </span>{" "}
                        {activity.action}
                      </p>
                      <span className="shrink-0 text-[var(--hive-fg-muted)]">
                        <Clock size={10} className="mr-1 inline" />
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Findings */}
          {campaign.findings.length > 0 && (
            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
                  Findings So Far
                </p>
                <button className="flex items-center gap-1 text-[11px] text-[var(--hive-green-mid)]">
                  View All <ArrowRight size={10} />
                </button>
              </div>
              <ul className="space-y-1.5">
                {campaign.findings.map((finding, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-[13px] text-[var(--hive-fg-dim)]"
                  >
                    <Zap size={12} className="mt-0.5 shrink-0 text-[var(--hive-green-mid)]" />
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          {campaign.status === "running" && (
            <div className="mt-5 flex items-center justify-end gap-3">
              <button className="flex items-center gap-1.5 rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] px-3 py-2 text-[12px] text-[var(--hive-fg-dim)] transition-colors hover:bg-[var(--hive-bg-soft)]">
                <Pause size={12} />
                Pause
              </button>
              <button className="flex items-center gap-1.5 rounded-[var(--hive-radius-sm)] border border-red-200 px-3 py-2 text-[12px] text-red-500 transition-colors hover:bg-red-50">
                <Square size={12} />
                Stop Campaign
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
