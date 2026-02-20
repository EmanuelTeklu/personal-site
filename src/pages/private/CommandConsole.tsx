import { useState } from "react";
import { Link } from "react-router-dom";
import { useCampaignConsole } from "@/hooks/useCampaignConsole";
import type { CampaignModel } from "@/types/campaign";

const DEFAULT_MODELS: readonly CampaignModel[] = ["claude", "gemini"];

const TONIGHT_TEMPLATE = {
  name: "Multi-Agent Coordination Mechanisms",
  rootQuestion:
    "What are the most effective coordination mechanisms for multi-agent AI systems? Focus on: stigmergy vs message-passing, veto-based vs consensus evaluation, the α_ρ phase transition threshold, and Goodhart effects on self-evaluation.",
  context:
    "For JaneHive - a system for extracting and scaling human judgment through AI orchestration. Constraints: limited human attention as scarce resource, Goodhart effects on evaluation, need for robustness.",
  budget: 3,
  cap: 15,
};

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function CommandConsole() {
  const {
    campaigns,
    loading,
    error,
    launching,
    runningCampaign,
    completedCampaigns,
    totals,
    launchCampaign,
  } = useCampaignConsole();

  const [showLaunch, setShowLaunch] = useState(false);
  const [name, setName] = useState(TONIGHT_TEMPLATE.name);
  const [question, setQuestion] = useState(TONIGHT_TEMPLATE.rootQuestion);
  const [context, setContext] = useState(TONIGHT_TEMPLATE.context);
  const [budget, setBudget] = useState(TONIGHT_TEMPLATE.budget);
  const [cap, setCap] = useState(TONIGHT_TEMPLATE.cap);
  const [formError, setFormError] = useState<string | null>(null);

  async function launch() {
    if (!name.trim() || !question.trim()) return;

    setFormError(null);

    const result = await launchCampaign({
      name: name.trim(),
      root_question: question.trim(),
      context: context.trim(),
      budget_cap: budget,
      exploration_cap: cap,
      models: DEFAULT_MODELS,
    });

    if (result.error) {
      setFormError(result.error);
      return;
    }

    setShowLaunch(false);
    setName(TONIGHT_TEMPLATE.name);
    setQuestion(TONIGHT_TEMPLATE.rootQuestion);
    setContext(TONIGHT_TEMPLATE.context);
    setBudget(TONIGHT_TEMPLATE.budget);
    setCap(TONIGHT_TEMPLATE.cap);
  }

  return (
    <div className="janehive-console min-h-[calc(100vh-4rem)] -m-8 bg-[var(--cc-bg)] p-6 text-[var(--cc-fg)] md:p-8">
      <header className="mb-8">
        <div className="text-sm uppercase tracking-wider text-[var(--cc-muted)]">Taste-to-Production</div>
        <h1 className="text-3xl font-light">Command Console</h1>
      </header>

      {(error || formError) && (
        <div className="mb-6 rounded-lg border border-red-300/25 bg-red-900/20 px-4 py-3 text-sm text-red-100">
          {formError ?? error}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-[var(--cc-panel-border)] bg-[var(--cc-panel)] p-4">
          <div className="text-xs uppercase text-[var(--cc-muted)]">Active</div>
          <div className="text-3xl">{totals.activeCount}</div>
        </div>
        <div className="rounded-lg border border-[var(--cc-panel-border)] bg-[var(--cc-panel)] p-4">
          <div className="text-xs uppercase text-[var(--cc-muted)]">Complete</div>
          <div className="text-3xl">{totals.completeCount}</div>
        </div>
        <div className="rounded-lg border border-[var(--cc-panel-border)] bg-[var(--cc-panel)] p-4">
          <div className="text-xs uppercase text-[var(--cc-muted)]">Total Spent</div>
          <div className="text-3xl">{formatCurrency(totals.totalSpent)}</div>
        </div>
        <div className="rounded-lg border border-[var(--cc-panel-border)] bg-[var(--cc-panel)] p-4">
          <div className="text-xs uppercase text-[var(--cc-muted)]">Explorations</div>
          <div className="text-3xl">{totals.totalExplorations}</div>
        </div>
      </div>

      {runningCampaign && (
        <div className="mb-8 rounded-lg border border-[var(--cc-running-border)] bg-[var(--cc-panel)] p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm uppercase text-[var(--cc-muted)]">Running</span>
          </div>
          <h2 className="mb-2 text-xl">{runningCampaign.name}</h2>
          <div className="mb-4 text-sm text-[var(--cc-muted)]">
            {(runningCampaign.root_question ?? "").slice(0, 100)}
            {(runningCampaign.root_question ?? "").length > 100 ? "..." : ""}
          </div>
          <div className="flex flex-wrap gap-8 text-sm">
            <div>
              <span className="text-[var(--cc-muted)]">Progress:</span>{" "}
              {runningCampaign.exploration_count} / {runningCampaign.exploration_cap}
            </div>
            <div>
              <span className="text-[var(--cc-muted)]">Budget:</span>{" "}
              {formatCurrency(runningCampaign.budget_spent)} / {formatCurrency(runningCampaign.budget_cap)}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowLaunch(true)}
        className="mb-8 rounded-lg bg-[var(--cc-action)] px-6 py-3 transition-colors hover:bg-[var(--cc-action-hover)]"
      >
        Launch Campaign →
      </button>

      {loading && campaigns.length === 0 ? (
        <div className="rounded-lg border border-[var(--cc-panel-border)] bg-[var(--cc-panel)] p-4 text-sm text-[var(--cc-muted)]">
          Loading campaigns...
        </div>
      ) : (
        completedCampaigns.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg text-[var(--cc-muted)]">Recent Campaigns</h2>
            {completedCampaigns.slice(0, 5).map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between rounded-lg border border-[var(--cc-panel-border)] bg-[var(--cc-panel)] p-4"
              >
                <div>
                  <div className="font-medium">{campaign.name}</div>
                  <div className="text-sm text-[var(--cc-muted)]">
                    {campaign.exploration_count} explorations · {formatCurrency(campaign.budget_spent)}
                  </div>
                </div>
                <Link
                  to={`/cc/campaigns/${campaign.id}`}
                  className="text-[var(--cc-muted)] transition-colors hover:text-[var(--cc-fg)]"
                >
                  Review →
                </Link>
              </div>
            ))}
          </div>
        )
      )}

      {showLaunch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-xl rounded-lg border border-[var(--cc-running-border)] bg-[var(--cc-panel)] p-6">
            <h2 className="mb-2 text-xl">Launch Overnight Campaign</h2>
            <p className="mb-4 text-xs uppercase tracking-wide text-[var(--cc-muted)]">models: claude + gemini</p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-[var(--cc-muted)]">Campaign Name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded border border-[var(--cc-running-border)] bg-[var(--cc-input)] px-3 py-2 outline-none"
                  placeholder="Multi-Agent Coordination Mechanisms"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-[var(--cc-muted)]">Research Question</label>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows={3}
                  className="w-full rounded border border-[var(--cc-running-border)] bg-[var(--cc-input)] px-3 py-2 outline-none"
                  placeholder="What are the most effective coordination mechanisms..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-[var(--cc-muted)]">Context (optional)</label>
                <textarea
                  value={context}
                  onChange={(event) => setContext(event.target.value)}
                  rows={2}
                  className="w-full rounded border border-[var(--cc-running-border)] bg-[var(--cc-input)] px-3 py-2 outline-none"
                  placeholder="Background for the research..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-[var(--cc-muted)]">Budget Cap: {formatCurrency(budget)}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={budget}
                    onChange={(event) => setBudget(Number(event.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-[var(--cc-muted)]">Max Explorations: {cap}</label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={cap}
                    onChange={(event) => setCap(Number(event.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowLaunch(false)} className="px-4 py-2 text-[var(--cc-muted)]">
                Cancel
              </button>
              <button
                onClick={() => void launch()}
                disabled={!name.trim() || !question.trim() || launching}
                className="rounded bg-[var(--cc-action)] px-6 py-2 transition-colors hover:bg-[var(--cc-action-hover)] disabled:opacity-50"
              >
                {launching ? "Launching..." : "Launch →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
