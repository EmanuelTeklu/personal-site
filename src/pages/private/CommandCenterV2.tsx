import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronRight,
  Eye,
  GitCompare,
  Image,
  MessageSquare,
  Mic,
  Search,
  Settings2,
  SmilePlus,
  Sparkles,
  Type,
  Zap,
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { HIVE_ACTIVITY, HIVE_CAMPAIGNS, HIVE_STATS } from "@/data/hive";
import { HiveStatsRow } from "@/components/private/hive/HiveStatsRow";
import { TaskFilter } from "@/components/private/tasks/TaskFilter";
import { TaskList } from "@/components/private/tasks/TaskList";
import type { TaskStatus } from "@/types/task";
import type { HiveCampaign } from "@/types/hive";

type View = "dashboard" | "projects" | "production" | "history" | "settings" | "tasks";

const VALID_VIEWS: readonly View[] = [
  "dashboard",
  "projects",
  "production",
  "history",
  "settings",
  "tasks",
];

const LOOP_STEPS = [
  {
    id: "express",
    title: "Express",
    subtitle: "voice, text, reactions",
    glyph: "◇",
    tone: "bg-[var(--hive-green-deep)] text-white",
  },
  {
    id: "interpret",
    title: "Interpret",
    subtitle: "context + constraints",
    glyph: "▢",
    tone: "bg-[var(--hive-accent-dim)] text-[var(--hive-green-deep)]",
  },
  {
    id: "produce",
    title: "Produce",
    subtitle: "variants + implementation",
    glyph: "◈",
    tone: "bg-[var(--hive-status-idle)] text-[var(--hive-green-mid)]",
  },
  {
    id: "judge",
    title: "Judge",
    subtitle: "critic + human gate",
    glyph: "⬡",
    tone: "bg-[var(--hive-bg-soft)] text-[var(--hive-fg-dim)]",
  },
] as const;

const INPUT_MODES = [
  { icon: Mic, label: "Voice", description: "streamed direction", active: true },
  { icon: Type, label: "Text", description: "specific constraints", active: true },
  { icon: SmilePlus, label: "Reactions", description: "quick judgments", active: true },
  { icon: Image, label: "References", description: "visual targets", active: true },
  { icon: GitCompare, label: "Comparison", description: "A over B rationale", active: true },
] as const;

interface ProductionVariant {
  readonly id: string;
  readonly label: string;
  readonly changes: readonly string[];
  readonly reaction?: "winner" | "positive" | "negative";
}

interface ProductionCycle {
  readonly id: string;
  readonly prompt: string;
  readonly interpretation: string;
  readonly status: "judging" | "deployed";
  readonly time: string;
  readonly variants: readonly ProductionVariant[];
}

const PRODUCTION_CYCLES: readonly ProductionCycle[] = [
  {
    id: "c-18",
    prompt: "rebalance dashboard layout around campaigns",
    interpretation: "primary campaigns + symmetric context band",
    status: "deployed",
    time: "2h ago",
    variants: [
      {
        id: "A",
        label: "Vertical stack focus",
        changes: ["Campaign lane expanded", "Bottom row split equally", "Signal density reduced"],
        reaction: "winner",
      },
      {
        id: "B",
        label: "Dense compact variant",
        changes: ["Tighter cards", "Smaller typography", "Higher information density"],
        reaction: "negative",
      },
      {
        id: "C",
        label: "Minimal rhythm variant",
        changes: ["Larger gutters", "Mono labels simplified", "Reduced chrome"],
        reaction: "positive",
      },
    ],
  },
  {
    id: "c-17",
    prompt: "tighten production feedback loop",
    interpretation: "explicit winner gate + automatic memory update",
    status: "judging",
    time: "5h ago",
    variants: [
      {
        id: "A",
        label: "Slack thread gate",
        changes: ["emoji scoring", "comment capture", "cycle summary sync"],
        reaction: "positive",
      },
      {
        id: "B",
        label: "manual markdown gate",
        changes: ["local-only review", "no webhook capture", "deferred memory sync"],
      },
    ],
  },
];

function normalizeView(value: string | null): View {
  if (value && (VALID_VIEWS as readonly string[]).includes(value)) return value as View;
  return "dashboard";
}

function viewTitle(view: View): { title: string; subtitle: string } {
  switch (view) {
    case "dashboard":
      return {
        title: "Studio Control",
        subtitle: "personal operating dashboard",
      };
    case "projects":
      return {
        title: "Projects",
        subtitle: "active contexts and constraints",
      };
    case "production":
      return {
        title: "Production",
        subtitle: "prompt → variant → critic → ship",
      };
    case "history":
      return {
        title: "History",
        subtitle: "interaction timeline and outcomes",
      };
    case "settings":
      return {
        title: "Settings",
        subtitle: "feedback and execution preferences",
      };
    case "tasks":
      return {
        title: "Tasks",
        subtitle: "execution queue",
      };
    default:
      return {
        title: "Studio Control",
        subtitle: "personal operating dashboard",
      };
  }
}

function StatusPill({ status }: { readonly status: HiveCampaign["status"] }) {
  const tone =
    status === "active"
      ? "bg-[var(--hive-status-live)] text-[var(--hive-green-deep)] border-[var(--hive-green-light)]"
      : status === "planning"
        ? "bg-[var(--hive-surface-muted)] text-[var(--hive-fg-dim)] border-[var(--hive-card-border)]"
        : status === "queued"
          ? "bg-[var(--hive-bg-soft)] text-[var(--hive-fg-muted)] border-[var(--hive-card-border)]"
          : "bg-[var(--hive-accent-dim)] text-[var(--hive-green-mid)] border-[var(--hive-green-light)]";

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] ${tone}`}>
      {status}
    </span>
  );
}

export function CommandCenterV2() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = normalizeView(searchParams.get("view"));
  const { tasks, cycleStatus, removeTask } = useTasks();

  const [activeLoopStep, setActiveLoopStep] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState(HIVE_CAMPAIGNS[0]?.id ?? "");
  const [selectedCycleId, setSelectedCycleId] = useState(PRODUCTION_CYCLES[0]?.id ?? "");
  const [historyQuery, setHistoryQuery] = useState("");
  const [batchSize, setBatchSize] = useState(4);
  const [questionTolerance, setQuestionTolerance] = useState(3);
  const [autoDeploy, setAutoDeploy] = useState(false);
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");

  const heading = viewTitle(view);

  const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length;
  const doneTasks = tasks.filter((task) => task.status === "done").length;

  const selectedProject = HIVE_CAMPAIGNS.find((campaign) => campaign.id === selectedProjectId) ?? HIVE_CAMPAIGNS[0];

  const selectedCycle =
    PRODUCTION_CYCLES.find((cycle) => cycle.id === selectedCycleId) ?? PRODUCTION_CYCLES[0];

  const filteredHistory = useMemo(() => {
    const query = historyQuery.trim().toLowerCase();
    if (!query) return HIVE_ACTIVITY;
    return HIVE_ACTIVITY.filter(
      (entry) =>
        entry.msg.toLowerCase().includes(query) ||
        entry.source.toLowerCase().includes(query) ||
        entry.lane.toLowerCase().includes(query),
    );
  }, [historyQuery]);

  const setView = (next: View) => {
    const nextParams = new URLSearchParams(searchParams);
    if (next === "dashboard") nextParams.delete("view");
    else nextParams.set("view", next);
    setSearchParams(nextParams);
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-[var(--mono)] uppercase tracking-[0.16em] text-[var(--hive-fg-muted)]">
              {heading.subtitle}
            </p>
            <h1 className="pt-1 text-[1.7rem] leading-none font-[300] text-[var(--hive-fg-strong)]">{heading.title}</h1>
          </div>
          <div className="rounded-full border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-3 py-1 text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-dim)]">
            live session
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {VALID_VIEWS.map((item) => (
            <button
              key={item}
              onClick={() => setView(item)}
              className={`rounded-[var(--hive-radius-sm)] border px-3 py-1.5 text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] transition-colors ${
                item === view
                  ? "border-[var(--hive-green-deep)] bg-[var(--hive-green-deep)] text-[var(--hive-card-bg)]"
                  : "border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] text-[var(--hive-fg-dim)] hover:text-[var(--hive-fg)]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      {view === "dashboard" && (
        <div className="space-y-6">
          <HiveStatsRow stats={HIVE_STATS} />

          <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[18px] tracking-tight text-[var(--hive-fg-strong)]" style={{ fontWeight: 400 }}>
                  Core Loop
                </h2>
                <p className="text-[12px] text-[var(--hive-fg-muted)]">express → interpret → produce → judge</p>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-green-mid)]">
                <Activity size={14} /> live
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {LOOP_STEPS.map((step, index) => (
                <div key={step.id} className="flex min-w-[220px] flex-1 items-center gap-3">
                  <button
                    onClick={() => setActiveLoopStep(index)}
                    className={`w-full rounded-[var(--hive-radius-sm)] border p-4 text-left transition-colors ${
                      activeLoopStep === index
                        ? "border-[var(--hive-green-light)] bg-[var(--hive-accent-dim)]"
                        : "border-[var(--hive-card-border)] bg-[var(--hive-card-bg)]"
                    }`}
                  >
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-sm ${step.tone}`}>{step.glyph}</span>
                    <p className="pt-2 text-[14px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
                      {step.title}
                    </p>
                    <p className="text-[11px] text-[var(--hive-fg-muted)]">{step.subtitle}</p>
                  </button>
                  {index < LOOP_STEPS.length - 1 && <ArrowRight size={14} className="text-[var(--hive-fg-muted)]" />}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-4 py-3 text-[12px] text-[var(--hive-fg-dim)]">
              <span className="flex items-center gap-2">
                <Zap size={14} className="text-[var(--hive-green-mid)]" />
                feedback accumulates between cycles
              </span>
              <div className="flex items-end gap-1">
                {[4, 8, 6, 10, 9, 12, 8, 14, 11, 9].map((height, i) => (
                  <span key={i} className="w-[3px] rounded-full bg-[var(--hive-green-mid)]/70" style={{ height }} />
                ))}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
            <section className="xl:col-span-3 rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[17px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 400 }}>
                  Recent Cycles
                </h3>
                <button className="flex items-center gap-1 text-[11px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-green-mid)]">
                  view all <ChevronRight size={12} />
                </button>
              </div>

              <div className="space-y-3">
                {HIVE_ACTIVITY.slice(0, 5).map((entry, index) => (
                  <article key={`${entry.time}-${entry.msg}`} className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span className="pt-0.5 text-[var(--hive-green-deep)]">{entry.glyph}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
                          {entry.msg}
                        </p>
                        <p className="pt-1 text-[11px] text-[var(--hive-fg-muted)]">
                          {entry.source} · {entry.time}
                        </p>
                      </div>
                      <span className="rounded-full border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-2 py-0.5 text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-dim)]">
                        {index === 0 ? "latest" : "record"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="xl:col-span-2 rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
              <h3 className="mb-4 text-[17px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 400 }}>
                Input Modes
              </h3>
              <div className="space-y-2">
                {INPUT_MODES.map((mode) => (
                  <div key={mode.label} className="flex items-center gap-3 rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-3 py-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--hive-accent-dim)] text-[var(--hive-green-mid)]">
                      <mode.icon size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
                        {mode.label}
                      </p>
                      <p className="text-[11px] text-[var(--hive-fg-muted)]">{mode.description}</p>
                    </div>
                    <span className="rounded-full border border-[var(--hive-green-light)] bg-[var(--hive-status-live)] px-2 py-0.5 text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-green-deep)]">
                      {mode.active ? "on" : "off"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {view === "projects" && selectedProject && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <section className="space-y-2">
            {HIVE_CAMPAIGNS.map((campaign) => (
              <button
                key={campaign.id}
                onClick={() => setSelectedProjectId(campaign.id)}
                className={`w-full rounded-[var(--hive-radius-sm)] border px-4 py-3 text-left transition-colors ${
                  selectedProject.id === campaign.id
                    ? "border-[var(--hive-green-light)] bg-[var(--hive-accent-dim)]"
                    : "border-[var(--hive-card-border)] bg-[var(--hive-card-bg)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
                    {campaign.name}
                  </p>
                  <StatusPill status={campaign.status} />
                </div>
                <p className="pt-1 text-[11px] text-[var(--hive-fg-muted)]">{campaign.focus}</p>
              </button>
            ))}
          </section>

          <section className="space-y-5 xl:col-span-2">
            <article className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[20px] tracking-tight text-[var(--hive-fg-strong)]" style={{ fontWeight: 400 }}>
                    {selectedProject.name}
                  </h3>
                  <p className="pt-1 text-[13px] text-[var(--hive-fg-dim)]">{selectedProject.objective}</p>
                </div>
                <StatusPill status={selectedProject.status} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] p-3">
                  <p className="text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">Progress</p>
                  <p className="pt-1 text-[26px] leading-none font-[300] text-[var(--hive-fg-strong)]">{selectedProject.progress}%</p>
                </div>
                <div className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] p-3">
                  <p className="text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">Tokens</p>
                  <p className="pt-1 text-[26px] leading-none font-[300] text-[var(--hive-fg-strong)]">{selectedProject.tokens.toLocaleString()}</p>
                </div>
                <div className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] p-3">
                  <p className="text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">Cost</p>
                  <p className="pt-1 text-[26px] leading-none font-[300] text-[var(--hive-fg-strong)]">${selectedProject.apiCost.toFixed(2)}</p>
                </div>
                <div className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] p-3">
                  <p className="text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">ETA</p>
                  <p className="pt-1 text-[26px] leading-none font-[300] text-[var(--hive-fg-strong)]">{selectedProject.eta ?? "Done"}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-4 py-3">
                <p className="text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">Next Action</p>
                <p className="pt-1 text-[14px] text-[var(--hive-fg)]">{selectedProject.nextAction}</p>
              </div>
            </article>

            <article className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
              <h4 className="text-[14px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">
                Task Lanes
              </h4>
              <div className="mt-3 space-y-2">
                {selectedProject.tasks.length === 0 ? (
                  <p className="text-sm text-[var(--hive-fg-muted)]">No active tasks.</p>
                ) : (
                  selectedProject.tasks.map((task) => (
                    <div key={task.name} className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
                          {task.name}
                        </p>
                        <span className="text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-dim)]">
                          {task.status}
                        </span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--hive-card-border)]">
                        <div className="h-full rounded-full bg-[var(--hive-green-mid)]" style={{ width: `${task.progress}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>
        </div>
      )}

      {view === "production" && selectedCycle && (
        <div className="space-y-5">
          <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="express your direction..."
                className="min-w-[260px] flex-1 rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-4 py-3 text-sm text-[var(--hive-fg)] outline-none"
              />
              <button className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-green-deep)] bg-[var(--hive-green-deep)] px-4 py-3 text-[11px] font-[var(--mono)] uppercase tracking-[0.12em] text-white">
                run cycle
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
            <section className="space-y-2">
              {PRODUCTION_CYCLES.map((cycle) => (
                <button
                  key={cycle.id}
                  onClick={() => setSelectedCycleId(cycle.id)}
                  className={`w-full rounded-[var(--hive-radius-sm)] border px-4 py-3 text-left transition-colors ${
                    cycle.id === selectedCycle.id
                      ? "border-[var(--hive-green-light)] bg-[var(--hive-accent-dim)]"
                      : "border-[var(--hive-card-border)] bg-[var(--hive-card-bg)]"
                  }`}
                >
                  <p className="text-[13px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
                    {cycle.prompt}
                  </p>
                  <p className="pt-1 text-[11px] text-[var(--hive-fg-muted)]">{cycle.time}</p>
                </button>
              ))}
            </section>

            <section className="space-y-4 xl:col-span-3">
              <article className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5">
                <p className="text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">interpretation</p>
                <p className="pt-2 text-[14px] text-[var(--hive-fg)]">{selectedCycle.interpretation}</p>
              </article>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {selectedCycle.variants.map((variant) => (
                  <article key={variant.id} className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
                          Variant {variant.id}
                        </p>
                        <p className="text-[12px] text-[var(--hive-fg-dim)]">{variant.label}</p>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] ${
                        variant.reaction === "winner"
                          ? "border-[var(--hive-green-light)] bg-[var(--hive-status-live)] text-[var(--hive-green-deep)]"
                          : variant.reaction === "negative"
                            ? "border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] text-[var(--hive-fg-muted)]"
                            : "border-[var(--hive-card-border)] bg-[var(--hive-surface-muted)] text-[var(--hive-fg-dim)]"
                      }`}>
                        {variant.reaction ?? "pending"}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-1 text-[12px] text-[var(--hive-fg-dim)]">
                      {variant.changes.map((change) => (
                        <li key={change}>• {change}</li>
                      ))}
                    </ul>

                    <div className="mt-4 flex gap-2">
                      <button className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-green-light)] bg-[var(--hive-status-live)] px-2 py-1 text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-green-deep)]">
                        ✅ winner
                      </button>
                      <button className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-2 py-1 text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-dim)]">
                        💀 reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {view === "history" && (
        <section className="space-y-4 rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[280px] flex-1">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hive-fg-muted)]" />
              <input
                type="text"
                value={historyQuery}
                onChange={(event) => setHistoryQuery(event.target.value)}
                placeholder="search timeline"
                className="w-full rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] py-2 pl-9 pr-3 text-sm text-[var(--hive-fg)] outline-none"
              />
            </div>
            <p className="text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-dim)]">
              {filteredHistory.length} events
            </p>
          </div>

          <div className="space-y-2">
            {filteredHistory.map((entry) => (
              <article key={`${entry.time}-${entry.msg}`} className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="pt-0.5 text-[var(--hive-green-deep)]">{entry.glyph}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-[var(--hive-fg-strong)]">{entry.msg}</p>
                    <p className="pt-1 text-[11px] text-[var(--hive-fg-muted)]">
                      {entry.source} · {entry.time} · {entry.stage}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {view === "settings" && (
        <div className="space-y-5">
          <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
            <div className="flex items-center gap-2">
              <Settings2 size={16} className="text-[var(--hive-green-mid)]" />
              <h3 className="text-[16px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
                Feedback Preferences
              </h3>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-[12px] text-[var(--hive-fg)]">
                  <span>Variant batch size</span>
                  <span className="font-[var(--mono)] text-[var(--hive-fg-dim)]">{batchSize}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={6}
                  value={batchSize}
                  onChange={(event) => setBatchSize(Number(event.target.value))}
                  className="w-full accent-[var(--hive-green-mid)]"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-[12px] text-[var(--hive-fg)]">
                  <span>Question tolerance</span>
                  <span className="font-[var(--mono)] text-[var(--hive-fg-dim)]">{questionTolerance}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={questionTolerance}
                  onChange={(event) => setQuestionTolerance(Number(event.target.value))}
                  className="w-full accent-[var(--hive-green-mid)]"
                />
              </div>

              <button
                onClick={() => setAutoDeploy((current) => !current)}
                className="flex w-full items-center justify-between rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-4 py-3"
              >
                <div className="text-left">
                  <p className="text-[13px] text-[var(--hive-fg-strong)]">Auto deploy winners</p>
                  <p className="text-[11px] text-[var(--hive-fg-muted)]">requires production approval gate</p>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-[var(--mono)] uppercase tracking-[0.12em] ${
                  autoDeploy
                    ? "border-[var(--hive-green-light)] bg-[var(--hive-status-live)] text-[var(--hive-green-deep)]"
                    : "border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] text-[var(--hive-fg-dim)]"
                }`}>
                  {autoDeploy ? "on" : "off"}
                </span>
              </button>
            </div>
          </section>
        </div>
      )}

      {view === "tasks" && (
        <section className="space-y-6 rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5">
          <h2 className="text-sm font-medium text-[var(--hive-fg)]">Execution Tasks</h2>
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
    </div>
  );
}
