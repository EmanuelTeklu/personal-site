import type { CSSProperties } from "react";
import type { AgentTier, HiveAgent } from "@/types/hive";

interface HiveAgentTreeProps {
  readonly agents: readonly HiveAgent[];
}

interface TreeNode {
  readonly agent: HiveAgent;
  readonly children: readonly TreeNode[];
}

const TIER_LABEL: Record<AgentTier, string> = {
  orchestrator: "ORCHESTRATOR",
  meta: "META",
  staff: "STAFF",
  swarm: "SWARM",
  unit: "UNIT",
};

const TIER_STYLE: Record<AgentTier, CSSProperties> = {
  orchestrator: {
    backgroundColor: "var(--hive-accent-dim)",
    color: "var(--hive-green-deep)",
    borderColor: "var(--hive-green-light)",
  },
  meta: {
    backgroundColor: "var(--hive-status-idle)",
    color: "var(--hive-green-mid)",
    borderColor: "var(--hive-card-border-strong)",
  },
  staff: {
    backgroundColor: "var(--hive-bg-soft)",
    color: "var(--hive-fg-dim)",
    borderColor: "var(--hive-card-border)",
  },
  swarm: {
    backgroundColor: "var(--hive-surface-muted)",
    color: "var(--hive-fg-dim)",
    borderColor: "var(--hive-card-border)",
  },
  unit: {
    backgroundColor: "var(--hive-card-bg)",
    color: "var(--hive-fg-muted)",
    borderColor: "var(--hive-card-border)",
  },
};

const STATUS_LABEL: Record<HiveAgent["status"], string> = {
  active: "ACTIVE",
  idle: "IDLE",
  offline: "OFFLINE",
};

const STATUS_STYLE: Record<HiveAgent["status"], CSSProperties> = {
  active: {
    backgroundColor: "var(--hive-status-live)",
    color: "var(--hive-green-deep)",
    borderColor: "var(--hive-green-light)",
  },
  idle: {
    backgroundColor: "var(--hive-status-idle)",
    color: "var(--hive-fg-dim)",
    borderColor: "var(--hive-card-border)",
  },
  offline: {
    backgroundColor: "var(--hive-status-offline)",
    color: "var(--hive-card-bg)",
    borderColor: "var(--hive-green-deep)",
  },
};

function buildTree(agents: readonly HiveAgent[]): readonly TreeNode[] {
  const byParent = new Map<string | null, HiveAgent[]>();

  for (const agent of agents) {
    const current = byParent.get(agent.parentId) ?? [];
    current.push(agent);
    byParent.set(agent.parentId, current);
  }

  const resolve = (parentId: string | null): readonly TreeNode[] => {
    const children = byParent.get(parentId) ?? [];
    return children.map((agent) => ({
      agent,
      children: resolve(agent.id),
    }));
  };

  return resolve(null);
}

function AgentBranch({
  node,
}: {
  readonly node: TreeNode;
}) {
  return (
    <li className="space-y-2">
      <div className="rounded-xl border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--hive-green-deep)]">{node.agent.icon}</span>
          <p className="text-sm font-medium text-[var(--hive-fg)]">{node.agent.name}</p>
          <span className="text-xs text-[var(--hive-fg-muted)]">{node.agent.role}</span>
          <span
            className="ml-auto rounded-full border px-2 py-0.5 text-[10px] font-[var(--mono)] tracking-[0.1em]"
            style={TIER_STYLE[node.agent.tier]}
          >
            {TIER_LABEL[node.agent.tier]}
          </span>
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-[var(--mono)] tracking-[0.1em]"
            style={STATUS_STYLE[node.agent.status]}
          >
            {STATUS_LABEL[node.agent.status]}
          </span>
        </div>
      </div>

      {node.children.length > 0 && (
        <ul className="ml-2 space-y-2 border-l border-[var(--hive-line)] pl-4">
          {node.children.map((child) => (
            <AgentBranch key={child.agent.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function HiveAgentTree({ agents }: HiveAgentTreeProps) {
  const tree = buildTree(agents);

  return (
    <section className="rounded-2xl border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-4">
      <header className="mb-3 border-b border-[var(--hive-card-border)] pb-2">
        <h3 className="text-sm font-medium text-[var(--hive-fg)]">Agent Hierarchy</h3>
        <p className="text-[11px] font-[var(--mono)] uppercase tracking-[0.15em] text-[var(--hive-fg-muted)]">
          command chain schematic
        </p>
      </header>

      <ul className="space-y-2">
        {tree.map((node) => (
          <AgentBranch key={node.agent.id} node={node} />
        ))}
      </ul>
    </section>
  );
}
