import { useState } from "react";
import {
  X,
  Rocket,
  Shield,
  Users,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AGENTS } from "@/data/dashboard";

interface LaunchCampaignModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function LaunchCampaignModal({ open, onClose }: LaunchCampaignModalProps) {
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [budgetCap, setBudgetCap] = useState(5);
  const [maxExplorations, setMaxExplorations] = useState(20);
  const [decompositionDepth, setDecompositionDepth] = useState(2);
  const [models, setModels] = useState({ claude: true, gemini: true, gpt: false });
  const [autoAssign, setAutoAssign] = useState(true);
  const [startNow, setStartNow] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!open) return null;

  const canLaunch = name.trim().length > 0 && question.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] px-6 py-4">
          <div>
            <h2
              className="text-[18px] tracking-tight text-[var(--hive-fg-strong)]"
              style={{ fontWeight: 500 }}
            >
              Launch Overnight Campaign
            </h2>
            <p className="mt-0.5 text-[12px] text-[var(--hive-fg-muted)]">
              Run autonomous research while you sleep. Review findings in the morning.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-[4px] p-1.5 text-[var(--hive-fg-muted)] transition-colors hover:bg-[var(--hive-bg-soft)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Campaign Name */}
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
              Campaign Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Multi-Agent Coordination"
              className="w-full rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-4 py-2.5 text-[14px] text-[var(--hive-fg)] outline-none transition-colors focus:border-[var(--hive-green-mid)]"
            />
          </div>

          {/* Research Question */}
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
              Research Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What are the most effective coordination mechanisms for multi-agent AI systems?"
              rows={3}
              className="w-full rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-4 py-2.5 text-[14px] text-[var(--hive-fg)] outline-none transition-colors focus:border-[var(--hive-green-mid)]"
            />
          </div>

          {/* Context */}
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
              Context (optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="For JaneHive - a system for extracting and scaling human judgment through AI orchestration."
              rows={2}
              className="w-full rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-4 py-2.5 text-[14px] text-[var(--hive-fg)] outline-none transition-colors focus:border-[var(--hive-green-mid)]"
            />
          </div>

          {/* Safeguards section */}
          <div className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] p-4">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-[var(--hive-green-mid)]" />
              <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--hive-fg-dim)]" style={{ fontWeight: 500 }}>
                Safeguards
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {/* Budget cap */}
              <div>
                <div className="flex items-center justify-between text-[12px] text-[var(--hive-fg-dim)]">
                  <span>Budget Cap</span>
                  <span className="text-[var(--hive-fg-strong)]" style={{ fontFamily: "var(--mono)" }}>
                    ${budgetCap.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={budgetCap}
                  onChange={(e) => setBudgetCap(Number(e.target.value))}
                  className="mt-1 w-full accent-[var(--hive-green-mid)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--hive-fg-muted)]">
                  <span>$1</span>
                  <span>$10</span>
                </div>
              </div>

              {/* Max explorations */}
              <div>
                <div className="flex items-center justify-between text-[12px] text-[var(--hive-fg-dim)]">
                  <span>Max Explorations</span>
                  <span className="text-[var(--hive-fg-strong)]" style={{ fontFamily: "var(--mono)" }}>
                    {maxExplorations}
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={maxExplorations}
                  onChange={(e) => setMaxExplorations(Number(e.target.value))}
                  className="mt-1 w-full accent-[var(--hive-green-mid)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--hive-fg-muted)]">
                  <span>10</span>
                  <span>50</span>
                </div>
              </div>

              {/* Models */}
              <div>
                <p className="mb-2 text-[12px] text-[var(--hive-fg-dim)]">Models</p>
                <div className="flex flex-wrap gap-3">
                  {(["claude", "gemini", "gpt"] as const).map((model) => (
                    <label key={model} className="flex items-center gap-2 text-[13px] text-[var(--hive-fg)]">
                      <input
                        type="checkbox"
                        checked={models[model]}
                        onChange={(e) => setModels({ ...models, [model]: e.target.checked })}
                        className="accent-[var(--hive-green-mid)]"
                      />
                      {model === "claude" ? "Claude" : model === "gemini" ? "Gemini" : "GPT-4"}
                    </label>
                  ))}
                </div>
              </div>

              {/* Decomposition depth */}
              <div>
                <div className="flex items-center justify-between text-[12px] text-[var(--hive-fg-dim)]">
                  <span>Decomposition Depth</span>
                  <span className="text-[var(--hive-fg-strong)]" style={{ fontFamily: "var(--mono)" }}>
                    {decompositionDepth}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={4}
                  value={decompositionDepth}
                  onChange={(e) => setDecompositionDepth(Number(e.target.value))}
                  className="mt-1 w-full accent-[var(--hive-green-mid)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--hive-fg-muted)]">
                  <span>1</span>
                  <span>4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Agent assignment */}
          <div className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] p-4">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[var(--hive-green-mid)]" />
              <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--hive-fg-dim)]" style={{ fontWeight: 500 }}>
                Agent Assignment
              </p>
            </div>

            <label className="mt-3 flex items-center justify-between">
              <span className="text-[13px] text-[var(--hive-fg)]">Auto-assign best agents</span>
              <input
                type="checkbox"
                checked={autoAssign}
                onChange={(e) => setAutoAssign(e.target.checked)}
                className="accent-[var(--hive-green-mid)]"
              />
            </label>

            {!autoAssign && (
              <div className="mt-3 space-y-2">
                {["architect", "builder", "critic"].map((branch) => (
                  <div key={branch} className="flex items-center gap-3">
                    <span className="w-14 text-[11px] uppercase tracking-[0.1em] text-[var(--hive-fg-muted)]">
                      {branch.substring(0, 5)}:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {AGENTS.filter((a) => a.branch === branch).map((agent) => (
                        <label key={agent.code} className="flex items-center gap-1.5 text-[12px] text-[var(--hive-fg-dim)]">
                          <input type="checkbox" className="accent-[var(--hive-green-mid)]" />
                          {agent.code}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule */}
          <div className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] p-4">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[var(--hive-green-mid)]" />
              <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--hive-fg-dim)]" style={{ fontWeight: 500 }}>
                Schedule
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-[13px] text-[var(--hive-fg)]">
                <input
                  type="radio"
                  checked={startNow}
                  onChange={() => setStartNow(true)}
                  className="accent-[var(--hive-green-mid)]"
                />
                Start now
              </label>
              <label className="flex items-center gap-2 text-[13px] text-[var(--hive-fg)]">
                <input
                  type="radio"
                  checked={!startNow}
                  onChange={() => setStartNow(false)}
                  className="accent-[var(--hive-green-mid)]"
                />
                Schedule for 11:00 PM
              </label>
            </div>
          </div>

          {/* Advanced safeguards (collapsible) */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-between text-[12px] text-[var(--hive-fg-muted)]"
          >
            <span>Built-in Safeguards (read-only)</span>
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdvanced && (
            <div className="rounded-[var(--hive-radius-sm)] bg-[var(--hive-bg-soft)] p-4 text-[12px] text-[var(--hive-fg-dim)]">
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[var(--hive-green-mid)]" />
                  {'Auto-archive items predicted <20% valuable'}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[var(--hive-green-mid)]" />
                  Circuit breaker: Stop after 3 consecutive failures
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[var(--hive-green-mid)]" />
                  Human gate: All actions require morning review
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[var(--hive-green-mid)]" />
                  No external actions (read/search/synthesize only)
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] px-4 py-2.5 text-[13px] text-[var(--hive-fg-dim)] transition-colors hover:bg-[var(--hive-bg-soft)]"
          >
            Cancel
          </button>
          <button
            disabled={!canLaunch}
            className={`flex items-center gap-1.5 rounded-[var(--hive-radius-sm)] px-4 py-2.5 text-[13px] transition-colors ${
              canLaunch
                ? "bg-[var(--hive-green-deep)] text-white hover:bg-[var(--hive-green-mid)]"
                : "bg-[var(--hive-bg-soft)] text-[var(--hive-fg-muted)]"
            }`}
          >
            <Rocket size={14} />
            Launch Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
