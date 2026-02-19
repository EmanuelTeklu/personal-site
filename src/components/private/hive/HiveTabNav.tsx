const TABS = ["dashboard", "campaigns", "agents", "activity", "tasks", "context"] as const;

const TAB_LABELS: Record<(typeof TABS)[number], string> = {
  dashboard: "Board",
  campaigns: "Campaigns",
  agents: "Hierarchy",
  activity: "Timeline",
  tasks: "Tasks",
  context: "Context",
};

interface HiveTabNavProps {
  readonly activeTab: string;
  readonly onTabChange: (tab: string) => void;
}

export function HiveTabNav({ activeTab, onTabChange }: HiveTabNavProps) {
  return (
    <nav className="rounded-2xl border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-2">
      <p className="px-1 pb-2 text-[10px] font-[var(--mono)] uppercase tracking-[0.2em] text-[var(--hive-fg-muted)]">
        Command Views
      </p>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`shrink-0 rounded-xl border px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] transition-colors ${
              activeTab === tab
                ? "border-[var(--hive-green-deep)] bg-[var(--hive-green-deep)] text-[var(--hive-card-bg)]"
                : "border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] text-[var(--hive-fg-dim)] hover:border-[var(--hive-card-border-strong)] hover:text-[var(--hive-fg)]"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>
    </nav>
  );
}
