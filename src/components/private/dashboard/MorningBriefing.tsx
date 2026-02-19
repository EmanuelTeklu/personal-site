import { useState } from "react";
import {
  Sun,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Star,
  AlertTriangle,
  X,
} from "lucide-react";
import type { BriefingData } from "@/data/dashboard";

function priorityDot(priority: "high" | "medium" | "low"): string {
  if (priority === "high") return "bg-red-500";
  if (priority === "medium") return "bg-amber-400";
  return "bg-[var(--hive-fg-muted)]";
}

export function MorningBriefing({
  data,
  onDismiss,
}: {
  readonly data: BriefingData;
  readonly onDismiss: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  if (!expanded) return null;

  return (
    <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-green-light)] bg-[var(--hive-accent-dim)] p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sun size={18} className="text-amber-500" />
          <h2
            className="text-[18px] tracking-tight text-[var(--hive-fg-strong)]"
            style={{ fontWeight: 500 }}
          >
            Morning Briefing
          </h2>
          <span className="text-[12px] text-[var(--hive-fg-muted)]">{data.date}</span>
        </div>
        <button
          onClick={() => {
            setExpanded(false);
            onDismiss();
          }}
          className="rounded-[4px] p-1 text-[var(--hive-fg-muted)] transition-colors hover:bg-[var(--hive-bg-soft)] hover:text-[var(--hive-fg-dim)]"
        >
          <X size={16} />
        </button>
      </div>

      <p className="mt-2 text-[14px] text-[var(--hive-fg-dim)]">
        {"Good morning. Here's what happened overnight:"}
      </p>

      {/* Completed campaigns */}
      {data.campaigns.map((campaign) => (
        <div
          key={campaign.name}
          className="mt-4 rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[var(--hive-green-mid)]" />
            <h3
              className="text-[15px] text-[var(--hive-fg-strong)]"
              style={{ fontWeight: 500 }}
            >
              {campaign.name}
            </h3>
          </div>
          <p className="mt-1 text-[12px] text-[var(--hive-fg-muted)]">
            {campaign.explorations} explorations \u00B7 {campaign.valuable} valuable (
            {Math.round(campaign.hitRate * 100)}%) \u00B7 ${campaign.spent.toFixed(2)} spent
          </p>

          <div className="mt-3">
            <p className="mb-1.5 text-[11px] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">
              Key Findings
            </p>
            <ul className="space-y-1">
              {campaign.keyFindings.map((finding) => (
                <li key={finding} className="flex items-start gap-2 text-[13px] text-[var(--hive-fg-dim)]">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--hive-green-mid)]" />
                  {finding}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3">
            <p className="mb-1.5 text-[11px] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">
              Gaps Identified
            </p>
            <ul className="space-y-1">
              {campaign.gaps.map((gap) => (
                <li key={gap} className="flex items-start gap-2 text-[13px] text-[var(--hive-fg-dim)]">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {gap}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3">
            <p className="mb-1.5 text-[11px] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">
              Recommended Next
            </p>
            <ul className="space-y-1">
              {campaign.recommendations.map((rec) => (
                <li key={rec} className="flex items-start gap-2 text-[13px] text-[var(--hive-green-mid)]">
                  <ArrowRight size={12} className="mt-0.5 shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          <button className="mt-3 flex items-center gap-1.5 text-[12px] text-[var(--hive-green-mid)]">
            Review Findings <ArrowRight size={12} />
          </button>
        </div>
      ))}

      {/* Attention items */}
      <div className="mt-4 rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-4">
        <p className="mb-3 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
          <AlertCircle size={12} />
          Needs Your Attention
        </p>
        <ul className="space-y-2">
          {data.attentionItems.map((item) => (
            <li key={item.text} className="flex items-center gap-2.5 text-[13px] text-[var(--hive-fg-dim)]">
              <span className={`block h-2 w-2 rounded-full ${priorityDot(item.priority)}`} />
              {item.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Agent highlights */}
      <div className="mt-4 rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-4">
        <p className="mb-3 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
          <Star size={12} />
          Agent Highlights
        </p>
        <div className="space-y-3">
          {data.agentHighlights.map((highlight) => (
            <div key={highlight.code} className="flex items-start gap-3">
              {highlight.message.includes("0%") ? (
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
              ) : (
                <Star size={14} className="mt-0.5 shrink-0 text-[var(--hive-green-mid)]" />
              )}
              <div>
                <p className="text-[13px] text-[var(--hive-fg)]">
                  <span style={{ fontFamily: "var(--mono)" }} className="text-[var(--hive-green-mid)]">
                    {highlight.code}
                  </span>{" "}
                  "{highlight.personality}" \u2014 {highlight.message}
                </p>
                {highlight.actionable && (
                  <div className="mt-1.5 flex gap-2">
                    <button className="rounded-[4px] bg-[var(--hive-accent-dim)] px-2 py-1 text-[11px] text-[var(--hive-green-mid)]">
                      Yes
                    </button>
                    <button className="rounded-[4px] bg-[var(--hive-bg-soft)] px-2 py-1 text-[11px] text-[var(--hive-fg-dim)]">
                      No
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System status */}
      <div className="mt-4 rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-4">
        <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
          System Status
        </p>
        <div className="flex flex-wrap gap-6 text-[13px] text-[var(--hive-fg-dim)]">
          <span>
            Budget: ${data.systemStatus.budgetSpent.toFixed(2)} spent \u00B7 $
            {data.systemStatus.budgetRemaining.toFixed(2)} remaining
          </span>
          <span>
            Agents: {data.systemStatus.agentsTotal} total \u00B7{" "}
            {data.systemStatus.agentsAssigned} assigned
          </span>
          <span>
            Hit Rate: {Math.round(data.systemStatus.hitRate * 100)}%{" "}
            <span className="text-[var(--hive-green-mid)]">
              (+{data.systemStatus.hitRateDelta}%)
            </span>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          onClick={() => {
            setExpanded(false);
            onDismiss();
          }}
          className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] px-3 py-2 text-[12px] text-[var(--hive-fg-dim)] transition-colors hover:bg-[var(--hive-bg-soft)]"
        >
          Dismiss
        </button>
        <button className="flex items-center gap-1.5 rounded-[var(--hive-radius-sm)] bg-[var(--hive-green-deep)] px-3 py-2 text-[12px] text-white">
          Go to Inbox <ArrowRight size={12} />
        </button>
      </div>
    </section>
  );
}
