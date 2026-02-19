import {
  Cpu,
  Hammer,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import type { Agent } from "@/data/dashboard";

function branchIcon(branch: Agent["branch"]) {
  if (branch === "architect") return <Cpu size={14} />;
  if (branch === "builder") return <Hammer size={14} />;
  return <ShieldCheck size={14} />;
}

function branchLabel(branch: Agent["branch"]): string {
  if (branch === "architect") return "Architects";
  if (branch === "builder") return "Builders";
  return "Critics";
}

function branchTone(branch: Agent["branch"]): string {
  if (branch === "architect") return "bg-blue-50 text-blue-600";
  if (branch === "builder") return "bg-[var(--hive-accent-dim)] text-[var(--hive-green-mid)]";
  return "bg-amber-50 text-amber-600";
}

function AgentCard({ agent }: { readonly agent: Agent }) {
  return (
    <article className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-4 transition-colors hover:border-[var(--hive-card-border-strong)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className="text-[14px] text-[var(--hive-fg-strong)]"
            style={{ fontFamily: "var(--mono)", fontWeight: 500 }}
          >
            {agent.code}
          </p>
          <p className="mt-0.5 text-[12px] italic text-[var(--hive-fg-dim)]">
            "{agent.personality}"
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${branchTone(agent.branch)}`}
        >
          {branchIcon(agent.branch)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            agent.status === "active"
              ? "bg-[var(--hive-green-bright)] animate-pulse"
              : agent.status === "error"
                ? "bg-red-400"
                : "bg-[var(--hive-fg-muted)]"
          }`}
        />
        <span className="text-[12px] text-[var(--hive-fg-dim)]">{agent.status}</span>
      </div>

      {/* Metrics */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--hive-fg-muted)]">
            Reputation
          </p>
          <p
            className="mt-0.5 text-[18px] leading-none text-[var(--hive-fg-strong)]"
            style={{ fontFamily: "var(--mono)", fontWeight: 500 }}
          >
            {agent.metrics.reputation.toFixed(2)}
          </p>
        </div>

        {agent.metrics.accuracy !== undefined && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--hive-fg-muted)]">
              Accuracy
            </p>
            <p
              className="mt-0.5 text-[18px] leading-none text-[var(--hive-fg-strong)]"
              style={{ fontFamily: "var(--mono)", fontWeight: 500 }}
            >
              {Math.round(agent.metrics.accuracy * 100)}%
            </p>
          </div>
        )}

        {agent.metrics.vetoRate !== undefined && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--hive-fg-muted)]">
              Veto Rate
            </p>
            <p
              className="mt-0.5 text-[18px] leading-none text-[var(--hive-fg-strong)]"
              style={{ fontFamily: "var(--mono)", fontWeight: 500 }}
            >
              {Math.round(agent.metrics.vetoRate * 100)}%
            </p>
          </div>
        )}

        {agent.metrics.vindicatedDissents !== undefined && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--hive-fg-muted)]">
              Vindicated
            </p>
            <p
              className="mt-0.5 text-[18px] leading-none text-[var(--hive-fg-strong)]"
              style={{ fontFamily: "var(--mono)", fontWeight: 500 }}
            >
              {agent.metrics.vindicatedDissents}
            </p>
          </div>
        )}
      </div>

      {/* Current task */}
      {agent.currentTask && (
        <p className="mt-3 truncate rounded-[4px] bg-[var(--hive-spark-bg)] px-2 py-1 text-[11px] text-[var(--hive-green-mid)]">
          Current: {agent.currentTask}
        </p>
      )}
    </article>
  );
}

export function AgentGrid({ agents }: { readonly agents: readonly Agent[] }) {
  const branches = ["architect", "builder", "critic"] as const;

  return (
    <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
      <div className="flex items-center justify-between gap-3">
        <h2
          className="text-[18px] tracking-tight text-[var(--hive-fg-strong)]"
          style={{ fontWeight: 500 }}
        >
          Agents
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[var(--hive-fg-muted)]">
            {agents.length} total
          </span>
          <button className="flex items-center gap-1 text-[12px] text-[var(--hive-green-mid)]">
            Manage <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {branches.map((branch) => {
          const branchAgents = agents.filter((a) => a.branch === branch);
          if (branchAgents.length === 0) return null;

          return (
            <div key={branch}>
              <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
                {branchLabel(branch)}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {branchAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
