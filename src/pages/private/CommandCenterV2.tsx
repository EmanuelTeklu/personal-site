import { useMemo, useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useContextEntries } from "@/hooks/useContextEntries";
import { HIVE_ACTIVITY, HIVE_AGENTS, HIVE_CAMPAIGNS, HIVE_STATS } from "@/data/hive";
import { HiveActivityFeed } from "@/components/private/hive/HiveActivityFeed";
import { HiveAgentTree } from "@/components/private/hive/HiveAgentTree";
import { HiveCampaignList } from "@/components/private/hive/HiveCampaignList";
import { HiveStatsRow } from "@/components/private/hive/HiveStatsRow";
import { HiveTabNav } from "@/components/private/hive/HiveTabNav";
import { TaskFilter } from "@/components/private/tasks/TaskFilter";
import { TaskList } from "@/components/private/tasks/TaskList";
import type { TaskStatus } from "@/types/task";

type Tab = "dashboard" | "campaigns" | "agents" | "activity" | "tasks" | "context";

function PanelHeader({
  title,
  subtitle,
}: {
  readonly title: string;
  readonly subtitle: string;
}) {
  return (
    <header className="mb-4 border-b border-[var(--hive-line)] pb-2">
      <h2 className="text-sm font-medium text-[var(--hive-fg)]">{title}</h2>
      <p className="text-[10px] font-[var(--mono)] uppercase tracking-[0.15em] text-[var(--hive-fg-muted)]">
        {subtitle}
      </p>
    </header>
  );
}

export function CommandCenterV2() {
  const { tasks, cycleStatus, removeTask } = useTasks();
  const { entries, compileContext } = useContextEntries();

  const [tab, setTab] = useState<Tab>("dashboard");
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");

  const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length;
  const doneTasks = tasks.filter((task) => task.status === "done").length;

  const dashboardCampaigns = useMemo(
    () => HIVE_CAMPAIGNS.filter((campaign) => campaign.status !== "done"),
    [],
  );

  const cycleStamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const activeCampaigns = HIVE_CAMPAIGNS.filter((campaign) => campaign.status === "active").length;
  const activeAgents = HIVE_AGENTS.filter((agent) => agent.status === "active").length;

  return (
    <div className="space-y-6 pb-8">
      <header className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[1.7rem] font-[300] leading-none text-[var(--hive-fg-strong)]">Command Center</h1>
            <p className="pt-2 text-[10px] font-[var(--mono)] uppercase tracking-[0.15em] text-[var(--hive-fg-muted)]">
              janehive operational board
            </p>
          </div>
          <div className="rounded-full border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-3 py-1 text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-dim)]">
            refreshed {cycleStamp}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] p-3 text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-dim)] sm:grid-cols-4">
          <span>{activeCampaigns} active campaigns</span>
          <span>{activeAgents} active agents</span>
          <span>{inProgressTasks} tasks in progress</span>
          <span>{doneTasks} tasks complete</span>
        </div>
      </header>

      <HiveStatsRow stats={HIVE_STATS} />
      <HiveTabNav activeTab={tab} onTabChange={(next) => setTab(next as Tab)} />

      {tab === "dashboard" && (
        <div className="space-y-6">
          <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-4">
            <PanelHeader title="Campaign Operations" subtitle="primary command lanes" />
            <HiveCampaignList campaigns={dashboardCampaigns} />
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section>
              <HiveAgentTree agents={HIVE_AGENTS} />
            </section>
            <section>
              <HiveActivityFeed entries={HIVE_ACTIVITY} />
            </section>
          </div>
        </div>
      )}

      {tab === "campaigns" && (
        <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-4">
          <PanelHeader title="All Campaigns" subtitle="active, planning, queued, complete" />
          <HiveCampaignList campaigns={HIVE_CAMPAIGNS} />
        </section>
      )}

      {tab === "agents" && <HiveAgentTree agents={HIVE_AGENTS} />}
      {tab === "activity" && <HiveActivityFeed entries={HIVE_ACTIVITY} />}

      {tab === "tasks" && (
        <section className="space-y-6 rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5">
          <PanelHeader title="Execution Tasks" subtitle="task queue and state transitions" />
          <TaskFilter
            filter={filter}
            onChange={setFilter}
            totalTasks={tasks.length}
            inProgressTasks={inProgressTasks}
            doneTasks={doneTasks}
          />
          <TaskList tasks={tasks} filter={filter} onCycleStatus={cycleStatus} onRemove={removeTask} />
        </section>
      )}

      {tab === "context" && (
        <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
          <PanelHeader title="Context Ledger" subtitle="compiled working memory" />
          <p className="text-sm text-[var(--hive-fg-dim)]">{entries.length} entries tracked.</p>
          <pre className="mt-4 max-h-[480px] overflow-auto rounded-[var(--hive-radius-sm)] bg-[var(--hive-bg-soft)] p-3 text-xs whitespace-pre-wrap font-[var(--mono)] text-[var(--hive-fg-dim)]">
            {compileContext("all")}
          </pre>
        </section>
      )}
    </div>
  );
}
