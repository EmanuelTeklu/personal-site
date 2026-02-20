import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCampaignReview } from "@/hooks/useCampaignConsole";
import type { CurationStatus } from "@/types/campaign";

const CURATION_OPTIONS: readonly CurationStatus[] = [
  "pending",
  "valuable",
  "noise",
  "archive",
];

function formatCurrency(value: number | null | undefined): string {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function formatPercent(value: number | null | undefined): string {
  if (value == null) return "-";
  return `${Math.round(value * 100)}%`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
}

function statusTone(status: string): string {
  if (status === "running") return "bg-green-600/30 text-green-100";
  if (status === "complete") return "bg-emerald-700/30 text-emerald-100";
  if (status === "failed") return "bg-red-700/30 text-red-100";
  if (status === "paused") return "bg-amber-600/30 text-amber-100";
  return "bg-zinc-700/40 text-zinc-100";
}

export function CampaignReview() {
  const { campaignId } = useParams();
  const { detail, loading, error, updatingExplorationId, updateCurationStatus } = useCampaignReview(
    campaignId ?? null,
  );
  const [updateError, setUpdateError] = useState<string | null>(null);

  const summary = useMemo(() => {
    if (!detail) {
      return {
        valuableCount: 0,
        totalCost: 0,
      };
    }

    return {
      valuableCount: detail.valuable_count,
      totalCost: detail.total_cost,
    };
  }, [detail]);

  async function handleCurationChange(explorationId: string, status: CurationStatus) {
    setUpdateError(null);
    const result = await updateCurationStatus(explorationId, status);
    if (result.error) setUpdateError(result.error);
  }

  if (!campaignId) {
    return (
      <div className="janehive-review min-h-[calc(100vh-4rem)] -m-8 bg-[var(--cc-bg)] p-6 text-[var(--cc-fg)]">
        <p className="text-sm text-[var(--cc-muted)]">Missing campaign id.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="janehive-review min-h-[calc(100vh-4rem)] -m-8 bg-[var(--cc-bg)] p-6 text-[var(--cc-fg)]">
        <p className="text-sm text-[var(--cc-muted)]">Loading campaign review...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="janehive-review min-h-[calc(100vh-4rem)] -m-8 bg-[var(--cc-bg)] p-6 text-[var(--cc-fg)]">
        <Link to="/cc" className="mb-4 inline-block text-sm text-[var(--cc-muted)] hover:text-[var(--cc-fg)]">
          ← Back to Console
        </Link>
        <div className="rounded-lg border border-red-300/25 bg-red-900/20 px-4 py-3 text-sm text-red-100">
          {error ?? "Campaign not found."}
        </div>
      </div>
    );
  }

  const { campaign, briefing, explorations, events } = detail;

  return (
    <div className="janehive-review min-h-[calc(100vh-4rem)] -m-8 bg-[var(--cc-bg)] p-6 text-[var(--cc-fg)] md:p-8">
      <div className="mb-6">
        <Link to="/cc" className="text-sm text-[var(--cc-muted)] transition-colors hover:text-[var(--cc-fg)]">
          ← Back to Console
        </Link>
      </div>

      <header className="mb-8">
        <div className="text-sm uppercase tracking-wider text-[var(--cc-muted)]">Morning Review</div>
        <h1 className="text-3xl font-light">{campaign.name}</h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--cc-muted)]">{campaign.root_question}</p>
      </header>

      {updateError && (
        <div className="mb-6 rounded-lg border border-red-300/25 bg-red-900/20 px-4 py-3 text-sm text-red-100">
          {updateError}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-[var(--cc-panel-border)] bg-[var(--cc-panel)] p-4">
          <div className="text-xs uppercase text-[var(--cc-muted)]">Status</div>
          <div className="mt-2">
            <span className={`rounded-full px-2 py-1 text-xs uppercase ${statusTone(campaign.status)}`}>
              {campaign.status}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--cc-panel-border)] bg-[var(--cc-panel)] p-4">
          <div className="text-xs uppercase text-[var(--cc-muted)]">Explorations</div>
          <div className="text-3xl">{campaign.exploration_count}</div>
        </div>

        <div className="rounded-lg border border-[var(--cc-panel-border)] bg-[var(--cc-panel)] p-4">
          <div className="text-xs uppercase text-[var(--cc-muted)]">Valuable</div>
          <div className="text-3xl">{summary.valuableCount}</div>
        </div>

        <div className="rounded-lg border border-[var(--cc-panel-border)] bg-[var(--cc-panel)] p-4">
          <div className="text-xs uppercase text-[var(--cc-muted)]">Total Cost</div>
          <div className="text-3xl">{formatCurrency(summary.totalCost)}</div>
        </div>
      </div>

      <section className="mb-8 rounded-lg border border-[var(--cc-panel-border)] bg-[var(--cc-panel)] p-5">
        <h2 className="mb-3 text-lg">Campaign Summary</h2>
        <div className="grid grid-cols-1 gap-3 text-sm text-[var(--cc-muted)] md:grid-cols-2">
          <div>
            <span className="text-[var(--cc-fg)]">Budget:</span>{" "}
            {formatCurrency(campaign.budget_spent)} / {formatCurrency(campaign.budget_cap)}
          </div>
          <div>
            <span className="text-[var(--cc-fg)]">Exploration Cap:</span> {campaign.exploration_count} / {campaign.exploration_cap}
          </div>
          <div>
            <span className="text-[var(--cc-fg)]">Started:</span> {formatDate(campaign.started_at)}
          </div>
          <div>
            <span className="text-[var(--cc-fg)]">Completed:</span> {formatDate(campaign.completed_at)}
          </div>
        </div>
        {campaign.context && (
          <div className="mt-4 rounded bg-[var(--cc-input)] p-3 text-sm text-[var(--cc-muted)]">
            <div className="mb-1 text-xs uppercase">Context</div>
            {campaign.context}
          </div>
        )}
      </section>

      <section className="mb-8 rounded-lg border border-[var(--cc-panel-border)] bg-[var(--cc-panel)] p-5">
        <h2 className="mb-3 text-lg">Briefing</h2>
        {briefing ? (
          <div className="space-y-4 text-sm">
            <p className="text-[var(--cc-fg)]">{briefing.summary}</p>

            <div>
              <h3 className="mb-1 text-xs uppercase tracking-wide text-[var(--cc-muted)]">Key Findings</h3>
              {briefing.key_findings.length > 0 ? (
                <ul className="space-y-1 text-[var(--cc-muted)]">
                  {briefing.key_findings.map((finding) => (
                    <li key={finding}>• {finding}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[var(--cc-muted)]">No findings captured.</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-1 text-xs uppercase tracking-wide text-[var(--cc-muted)]">Gaps</h3>
                {briefing.gaps.length > 0 ? (
                  <ul className="space-y-1 text-[var(--cc-muted)]">
                    {briefing.gaps.map((gap) => (
                      <li key={gap}>• {gap}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[var(--cc-muted)]">No gaps listed.</p>
                )}
              </div>

              <div>
                <h3 className="mb-1 text-xs uppercase tracking-wide text-[var(--cc-muted)]">Next Actions</h3>
                {briefing.next_actions.length > 0 ? (
                  <ul className="space-y-1 text-[var(--cc-muted)]">
                    {briefing.next_actions.map((action) => (
                      <li key={action}>• {action}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[var(--cc-muted)]">No actions listed.</p>
                )}
              </div>
            </div>

            <div className="text-xs uppercase tracking-wide text-[var(--cc-muted)]">
              Slack sent: {briefing.slack_sent ? "yes" : "no"}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--cc-muted)]">Briefing not available yet.</p>
        )}
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg">Explorations</h2>
          <span className="text-sm text-[var(--cc-muted)]">{explorations.length} total</span>
        </div>

        <div className="space-y-4">
          {explorations.length === 0 ? (
            <div className="rounded-lg border border-[var(--cc-panel-border)] bg-[var(--cc-panel)] p-4 text-sm text-[var(--cc-muted)]">
              No explorations generated.
            </div>
          ) : (
            explorations.map((exploration) => (
              <article
                key={exploration.id}
                className="rounded-lg border border-[var(--cc-panel-border)] bg-[var(--cc-panel)] p-5"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-[var(--cc-muted)]">{exploration.source_model}</p>
                    <h3 className="mt-1 text-base">{exploration.question}</h3>
                  </div>
                  <div className="text-right text-xs text-[var(--cc-muted)]">
                    <div>Predicted Value: {formatPercent(exploration.predicted_value)}</div>
                    <div>Cost: {formatCurrency(exploration.cost_dollars)}</div>
                    <div>Tokens: {exploration.tokens_used ?? "-"}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--cc-muted)]">
                    Curation Status
                  </label>
                  <select
                    value={exploration.curation_status}
                    onChange={(event) =>
                      void handleCurationChange(
                        exploration.id,
                        event.target.value as CurationStatus,
                      )
                    }
                    disabled={updatingExplorationId === exploration.id}
                    className="rounded border border-[var(--cc-running-border)] bg-[var(--cc-input)] px-2 py-1.5 text-sm"
                  >
                    {CURATION_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-1 text-xs uppercase tracking-wide text-[var(--cc-muted)]">Claims</h4>
                    {exploration.claims.length > 0 ? (
                      <ul className="space-y-1 text-sm text-[var(--cc-muted)]">
                        {exploration.claims.map((claim) => (
                          <li key={claim}>• {claim}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[var(--cc-muted)]">No claims captured.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="mb-1 text-xs uppercase tracking-wide text-[var(--cc-muted)]">Evidence</h4>
                    {exploration.evidence.length > 0 ? (
                      <div className="space-y-2 text-sm text-[var(--cc-muted)]">
                        {exploration.evidence.map((evidence, index) => (
                          <div key={`${evidence.claim ?? "evidence"}-${index}`} className="rounded bg-[var(--cc-input)] p-2">
                            <p>{typeof evidence.source === "string" ? evidence.source : "Source not provided"}</p>
                            {typeof evidence.quote === "string" && (
                              <p className="mt-1 text-xs text-[var(--cc-fg)]">“{evidence.quote}”</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--cc-muted)]">No evidence captured.</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <h4 className="mb-1 text-xs uppercase tracking-wide text-[var(--cc-muted)]">Uncertainty</h4>
                    <p className="text-sm text-[var(--cc-muted)]">{exploration.uncertainty ?? "-"}</p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-xs uppercase tracking-wide text-[var(--cc-muted)]">Follow-ups</h4>
                    {exploration.follow_ups.length > 0 ? (
                      <ul className="space-y-1 text-sm text-[var(--cc-muted)]">
                        {exploration.follow_ups.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[var(--cc-muted)]">No follow-ups.</p>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--cc-panel-border)] bg-[var(--cc-panel)] p-5">
        <h2 className="mb-3 text-lg">Event Timeline</h2>
        {events.length === 0 ? (
          <p className="text-sm text-[var(--cc-muted)]">No events recorded.</p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex flex-wrap items-center justify-between rounded bg-[var(--cc-input)] px-3 py-2 text-sm"
              >
                <div>
                  <span className="uppercase text-[var(--cc-fg)]">{event.event_type}</span>
                  {Object.keys(event.event_data).length > 0 && (
                    <span className="ml-2 text-[var(--cc-muted)]">{JSON.stringify(event.event_data)}</span>
                  )}
                </div>
                <span className="text-xs text-[var(--cc-muted)]">{formatDate(event.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
