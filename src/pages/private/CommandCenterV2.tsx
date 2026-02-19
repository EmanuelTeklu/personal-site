import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  GitCompare,
  HelpCircle,
  Image,
  MessageSquare,
  Mic,
  Palette,
  Search,
  Settings2,
  Sliders,
  SmilePlus,
  Sparkles,
  Type,
  X,
  Zap,
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { HIVE_ACTIVITY, HIVE_CAMPAIGNS, HIVE_STATS } from "@/data/hive";
import { HiveStatsRow } from "@/components/private/hive/HiveStatsRow";
import { TaskFilter } from "@/components/private/tasks/TaskFilter";
import { TaskList } from "@/components/private/tasks/TaskList";
import type { HiveCampaign } from "@/types/hive";
import type { TaskStatus } from "@/types/task";

type View = "dashboard" | "taste-engine" | "projects" | "production" | "history" | "settings" | "tasks";

type TasteTab = "vocabulary" | "preferences" | "patterns";

const VALID_VIEWS: readonly View[] = [
  "dashboard",
  "taste-engine",
  "projects",
  "production",
  "history",
  "settings",
  "tasks",
];

const LOOP_STEPS = [
  { id: "express", title: "Capture", subtitle: "intent in plain language", glyph: "◇", tone: "bg-[var(--hive-green-deep)] text-white" },
  { id: "interpret", title: "Frame", subtitle: "convert feedback into constraints", glyph: "▢", tone: "bg-[var(--hive-accent-dim)] text-[var(--hive-green-deep)]" },
  { id: "produce", title: "Build", subtitle: "generate variants and code", glyph: "◈", tone: "bg-[var(--hive-status-idle)] text-[var(--hive-green-mid)]" },
  { id: "judge", title: "Decide", subtitle: "pick winner, store memory", glyph: "⬡", tone: "bg-[var(--hive-bg-soft)] text-[var(--hive-fg-dim)]" },
] as const;

const INPUT_MODES = [
  { icon: Mic, label: "Voice", description: "quick spoken direction", active: true },
  { icon: Type, label: "Text", description: "precise implementation notes", active: true },
  { icon: SmilePlus, label: "Reactions", description: "fast pass or fail", active: true },
  { icon: Image, label: "References", description: "screenshot-based alignment", active: true },
  { icon: GitCompare, label: "Compare", description: "A vs B review", active: true },
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
  readonly learned?: readonly string[];
}

interface TasteTerm {
  readonly term: string;
  readonly meaning: string;
  readonly implies: readonly string[];
  readonly confidence: number;
  readonly usageCount: number;
}

interface PreferenceCategory {
  readonly category: string;
  readonly positive: readonly string[];
  readonly negative: readonly string[];
  readonly confidence: number;
}

const PRODUCTION_CYCLES: readonly ProductionCycle[] = [
  {
    id: "c-24",
    prompt: "refresh /cc language so it feels current and intentional",
    interpretation: "replace placeholder copy with concrete product and execution language",
    status: "deployed",
    time: "35m ago",
    variants: [
      {
        id: "A",
        label: "Concise modern copy",
        changes: ["Updated headings", "Real project names", "Sharper status language"],
        reaction: "winner",
      },
      {
        id: "B",
        label: "Verbose explanatory copy",
        changes: ["Long descriptions", "Extra helper text", "Lower scan speed"],
        reaction: "negative",
      },
      {
        id: "C",
        label: "Ops-heavy copy",
        changes: ["More lane markers", "More metric callouts", "Stronger technical tone"],
        reaction: "positive",
      },
    ],
    learned: [
      "you prefer direct copy over decorative labels",
      "project cards must describe actual current work",
    ],
  },
  {
    id: "c-23",
    prompt: "match figma framing while preserving your route structure",
    interpretation: "retain shell + tabs, modernize content model and review flow",
    status: "judging",
    time: "2h ago",
    variants: [
      {
        id: "A",
        label: "Figma-near framing",
        changes: ["Left rail cleanup", "Section hierarchy update", "Token polish"],
        reaction: "positive",
      },
      {
        id: "B",
        label: "Legacy framing",
        changes: ["Older labels", "dated cards", "lower visual clarity"],
      },
    ],
  },
];

const VOCAB_TERMS: readonly TasteTerm[] = [
  {
    term: "dated",
    meaning: "copy reads like placeholder demo text",
    implies: ["replace generic nouns", "use current project language", "shorten sentences"],
    confidence: 0.95,
    usageCount: 19,
  },
  {
    term: "operational",
    meaning: "clear, useful, and immediately scannable",
    implies: ["state current status", "state next action", "state owner"],
    confidence: 0.93,
    usageCount: 27,
  },
  {
    term: "generic drift",
    meaning: "looks like default template output",
    implies: ["avoid filler buzzwords", "avoid anonymous card text"],
    confidence: 0.96,
    usageCount: 34,
  },
  {
    term: "presence",
    meaning: "importance through scale and spacing",
    implies: ["larger light numerals", "strong section breaks"],
    confidence: 0.86,
    usageCount: 14,
  },
];

const PREFERENCES: readonly PreferenceCategory[] = [
  {
    category: "Copy Style",
    positive: ["direct", "specific", "decision-ready"],
    negative: ["filler", "vague claims", "marketing speak"],
    confidence: 0.94,
  },
  {
    category: "Palette",
    positive: ["forest green", "cream surfaces", "neutral text"],
    negative: ["purple/blue drift", "slate-heavy dark shell"],
    confidence: 0.95,
  },
  {
    category: "Structure",
    positive: ["vertical project stack", "clear top-to-bottom hierarchy", "balanced secondary panels"],
    negative: ["flat card wall", "equal weight everywhere", "status-dot overload"],
    confidence: 0.91,
  },
];

const INTERACTION_PATTERNS = [
  {
    trigger: "When you say \"this feels dated\"",
    response: "critic flags stale copy and asks for concrete replacement language",
  },
  {
    trigger: "When you react 🔥",
    response: "architect stores that pattern as a reusable preference rule",
  },
  {
    trigger: "When you react 💀 or ❌",
    response: "builder removes the motif in the next cycle, not later",
  },
  {
    trigger: "When you say \"keep layout, fix content\"",
    response: "builder does a copy-first pass before visual changes",
  },
] as const;

function normalizeView(value: string | null): View {
  if (value && (VALID_VIEWS as readonly string[]).includes(value)) return value as View;
  return "dashboard";
}

function statusTone(status: HiveCampaign["status"]): string {
  if (status === "active") return "bg-[var(--hive-status-live)] text-[var(--hive-green-deep)]";
  if (status === "planning") return "bg-[var(--hive-bg-soft)] text-[var(--hive-fg-dim)]";
  if (status === "queued") return "bg-[var(--hive-surface-muted)] text-[var(--hive-fg-muted)]";
  return "bg-[var(--hive-accent-dim)] text-[var(--hive-green-mid)]";
}

function SectionHeading({ title, subtitle }: { readonly title: string; readonly subtitle: string }) {
  return (
    <header>
      <p className="text-[12px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">{subtitle}</p>
      <h1 className="pt-1 text-[30px] leading-none tracking-tight text-[var(--hive-fg-strong)]" style={{ fontWeight: 300 }}>
        {title}
      </h1>
    </header>
  );
}

export function CommandCenterV2() {
  const [searchParams] = useSearchParams();
  const view = normalizeView(searchParams.get("view"));

  const { tasks, cycleStatus, removeTask } = useTasks();
  const [activeLoopStep, setActiveLoopStep] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState(HIVE_CAMPAIGNS[0]?.id ?? "");
  const [selectedCycleId, setSelectedCycleId] = useState(PRODUCTION_CYCLES[0]?.id ?? "");
  const [historyQuery, setHistoryQuery] = useState("");
  const [tasteTab, setTasteTab] = useState<TasteTab>("vocabulary");
  const [expandedTerm, setExpandedTerm] = useState<string | null>(VOCAB_TERMS[0]?.term ?? null);
  const [batchSize, setBatchSize] = useState(4);
  const [questionTolerance, setQuestionTolerance] = useState(3);
  const [autoDeploy, setAutoDeploy] = useState(false);
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");

  const selectedProject = HIVE_CAMPAIGNS.find((campaign) => campaign.id === selectedProjectId) ?? HIVE_CAMPAIGNS[0];
  const selectedCycle = PRODUCTION_CYCLES.find((cycle) => cycle.id === selectedCycleId) ?? PRODUCTION_CYCLES[0];

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

  const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length;
  const doneTasks = tasks.filter((task) => task.status === "done").length;

  if (view === "dashboard") {
    return (
      <div className="space-y-8">
        <SectionHeading title="Dashboard" subtitle="live studio operations" />

        <HiveStatsRow stats={HIVE_STATS.slice(0, 4)} />

        <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[18px] tracking-tight text-[var(--hive-fg-strong)]" style={{ fontWeight: 400 }}>
                Core Loop
              </h2>
              <p className="text-[13px] text-[var(--hive-fg-muted)]">capture → frame → build → decide</p>
            </div>
            <span className="flex items-center gap-1 text-[12px] text-[var(--hive-green-mid)]">
              <Activity size={14} /> Live
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
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-base ${step.tone}`}>
                    {step.glyph}
                  </span>
                  <p className="pt-2 text-[15px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
                    {step.title}
                  </p>
                  <p className="text-[12px] text-[var(--hive-fg-muted)]">{step.subtitle}</p>
                </button>
                {index < LOOP_STEPS.length - 1 && <ArrowRight size={14} className="text-[var(--hive-fg-muted)]" />}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-[var(--hive-radius-sm)] bg-[var(--hive-bg-soft)] px-4 py-3 text-[12px] text-[var(--hive-fg-dim)]">
            <span className="flex items-center gap-2">
              <Zap size={14} className="text-[var(--hive-green-mid)]" />
              feedback memory updates every cycle
            </span>
            <div className="flex items-end gap-1">
              {[6, 8, 11, 9, 13, 12, 10, 14, 12, 15].map((height, i) => (
                <span key={i} className="w-[3px] rounded-full bg-[var(--hive-green-mid)]/70" style={{ height }} />
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
          <section className="xl:col-span-3 rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[18px] tracking-tight text-[var(--hive-fg-strong)]" style={{ fontWeight: 400 }}>
                Recent Cycles
              </h3>
              <span className="flex items-center gap-1 text-[12px] text-[var(--hive-green-mid)]">
                Open timeline <ChevronRight size={13} />
              </span>
            </div>
            <div className="space-y-3">
              {HIVE_ACTIVITY.slice(0, 5).map((entry) => (
                <article key={`${entry.time}-${entry.msg}`} className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="pt-0.5 text-[var(--hive-green-deep)]">{entry.glyph}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
                        {entry.msg}
                      </p>
                      <p className="pt-1 text-[12px] text-[var(--hive-fg-muted)]">
                        {entry.source} · {entry.time}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="xl:col-span-2 rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
            <h3 className="mb-4 text-[18px] tracking-tight text-[var(--hive-fg-strong)]" style={{ fontWeight: 400 }}>
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
                  <span className="rounded-full bg-[var(--hive-status-live)] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--hive-green-deep)]">
                    {mode.active ? "on" : "off"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (view === "taste-engine") {
    return (
      <div className="space-y-8">
        <SectionHeading title="Taste Engine" subtitle="language and judgment memory" />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {[
            { label: "Vocab Terms", value: "31" },
            { label: "Patterns", value: "247" },
            { label: "Accuracy", value: "89%" },
            { label: "Cycles", value: "42" },
          ].map((stat) => (
            <article key={stat.label} className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5">
              <p className="text-[12px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">{stat.label}</p>
              <p className="pt-2 text-[42px] leading-none text-[var(--hive-fg-strong)]" style={{ fontWeight: 300 }}>
                {stat.value}
              </p>
            </article>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-[var(--hive-radius-sm)] bg-[var(--hive-bg-soft)] p-1 w-fit">
          {(["vocabulary", "preferences", "patterns"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTasteTab(tab)}
              className={`rounded-[8px] px-4 py-2 text-[14px] transition-colors ${
                tasteTab === tab
                  ? "bg-[var(--hive-card-bg)] text-[var(--hive-fg-strong)]"
                  : "text-[var(--hive-fg-dim)] hover:text-[var(--hive-fg)]"
              }`}
              style={{ fontWeight: tasteTab === tab ? 500 : 400 }}
            >
              {tab}
            </button>
          ))}
        </div>

        {tasteTab === "vocabulary" && (
          <div className="space-y-3">
            {VOCAB_TERMS.map((term) => {
              const expanded = expandedTerm === term.term;
              return (
                <article key={term.term} className="overflow-hidden rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)]">
                  <button
                    onClick={() => setExpandedTerm(expanded ? null : term.term)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left"
                  >
                    {expanded ? <ChevronDown size={16} className="text-[var(--hive-fg-muted)]" /> : <ChevronRight size={16} className="text-[var(--hive-fg-muted)]" />}
                    <div className="min-w-0 flex-1">
                      <span className="font-[var(--mono)] text-[14px] text-[var(--hive-green-mid)]">"{term.term}"</span>
                      <span className="pl-2 text-[14px] text-[var(--hive-fg-dim)]">{term.meaning}</span>
                    </div>
                    <span className="text-[12px] text-[var(--hive-fg-muted)]">{term.usageCount} uses</span>
                  </button>

                  {expanded && (
                    <div className="border-t border-[var(--hive-card-border)] px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {term.implies.map((item) => (
                          <span key={item} className="rounded-[8px] bg-[var(--hive-accent-dim)] px-2.5 py-1 text-[12px] text-[var(--hive-green-mid)]">
                            {item}
                          </span>
                        ))}
                      </div>
                      <p className="pt-3 text-[12px] text-[var(--hive-fg-muted)]">confidence: {Math.round(term.confidence * 100)}%</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {tasteTab === "preferences" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {PREFERENCES.map((pref) => (
              <article key={pref.category} className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders size={15} className="text-[var(--hive-green-mid)]" />
                    <h3 className="text-[16px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
                      {pref.category}
                    </h3>
                  </div>
                  <span className="text-[12px] text-[var(--hive-fg-muted)]">{Math.round(pref.confidence * 100)}%</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 flex items-center gap-1 text-[12px] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">
                      <Check size={12} className="text-[var(--hive-green-mid)]" /> positive
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pref.positive.map((item) => (
                        <span key={item} className="rounded-[8px] bg-[var(--hive-accent-dim)] px-2.5 py-1 text-[12px] text-[var(--hive-green-mid)]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 flex items-center gap-1 text-[12px] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">
                      <X size={12} className="text-[var(--hive-fg-dim)]" /> negative
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pref.negative.map((item) => (
                        <span key={item} className="rounded-[8px] bg-[var(--hive-bg-soft)] px-2.5 py-1 text-[12px] text-[var(--hive-fg-dim)]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {tasteTab === "patterns" && (
          <div className="space-y-3">
            {INTERACTION_PATTERNS.map((pattern) => (
              <article key={pattern.trigger} className="flex items-start gap-4 rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5">
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--hive-accent-dim)] text-[var(--hive-green-mid)]">
                  <HelpCircle size={14} />
                </span>
                <div>
                  <p className="text-[14px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
                    {pattern.trigger}
                  </p>
                  <p className="pt-1 text-[13px] text-[var(--hive-fg-dim)]">→ {pattern.response}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "projects" && selectedProject) {
    return (
      <div className="space-y-8">
        <SectionHeading title="Projects" subtitle="active workstreams" />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <section className="space-y-3">
            {HIVE_CAMPAIGNS.map((campaign) => (
              <button
                key={campaign.id}
                onClick={() => setSelectedProjectId(campaign.id)}
                className={`w-full rounded-[var(--hive-radius-lg)] border px-4 py-4 text-left transition-colors ${
                  selectedProject.id === campaign.id
                    ? "border-[var(--hive-green-light)] bg-[var(--hive-accent-dim)]"
                    : "border-[var(--hive-card-border)] bg-[var(--hive-card-bg)]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
                      {campaign.name}
                    </p>
                    <p className="pt-1 text-[12px] text-[var(--hive-fg-muted)]">{campaign.focus}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${statusTone(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
              </button>
            ))}
          </section>

          <section className="space-y-5 xl:col-span-2">
            <article className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[22px] tracking-tight text-[var(--hive-fg-strong)]" style={{ fontWeight: 400 }}>
                    {selectedProject.name}
                  </h2>
                  <p className="pt-1 text-[14px] text-[var(--hive-fg-dim)]">{selectedProject.objective}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${statusTone(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-[var(--hive-radius-sm)] bg-[var(--hive-bg-soft)] p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">Progress</p>
                  <p className="pt-1 text-[30px] leading-none text-[var(--hive-fg-strong)]" style={{ fontWeight: 300 }}>
                    {selectedProject.progress}%
                  </p>
                </div>
                <div className="rounded-[var(--hive-radius-sm)] bg-[var(--hive-bg-soft)] p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">Tokens</p>
                  <p className="pt-1 text-[30px] leading-none text-[var(--hive-fg-strong)]" style={{ fontWeight: 300 }}>
                    {selectedProject.tokens.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-[var(--hive-radius-sm)] bg-[var(--hive-bg-soft)] p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">Cost</p>
                  <p className="pt-1 text-[30px] leading-none text-[var(--hive-fg-strong)]" style={{ fontWeight: 300 }}>
                    ${selectedProject.apiCost.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-[var(--hive-radius-sm)] bg-[var(--hive-bg-soft)] p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">ETA</p>
                  <p className="pt-1 text-[30px] leading-none text-[var(--hive-fg-strong)]" style={{ fontWeight: 300 }}>
                    {selectedProject.eta ?? "done"}
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
              <h3 className="mb-3 text-[14px] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">Task lanes</h3>
              <div className="space-y-2">
                {selectedProject.tasks.length === 0 ? (
                  <p className="text-[14px] text-[var(--hive-fg-muted)]">No active tasks.</p>
                ) : (
                  selectedProject.tasks.map((task) => (
                    <article key={task.name} className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
                          {task.name}
                        </p>
                        <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--hive-fg-dim)]">{task.status}</span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--hive-card-border)]">
                        <div className="h-full rounded-full bg-[var(--hive-green-mid)]" style={{ width: `${task.progress}%` }} />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </article>
          </section>
        </div>
      </div>
    );
  }

  if (view === "production" && selectedCycle) {
    return (
      <div className="space-y-8">
        <SectionHeading title="Production" subtitle="variant pipeline" />

        <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Describe the change you want to ship..."
              className="min-w-[260px] flex-1 rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-4 py-3 text-sm text-[var(--hive-fg)] outline-none"
            />
            <button className="rounded-[var(--hive-radius-sm)] bg-[var(--hive-green-deep)] px-4 py-3 text-[12px] text-white">
              Generate variants
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
              <div className="flex items-center gap-2 text-[12px] text-[var(--hive-fg-muted)]">
                <MessageSquare size={13} /> interpretation
              </div>
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
                    <span className="rounded-full bg-[var(--hive-bg-soft)] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--hive-fg-dim)]">
                      {variant.reaction ?? "pending"}
                    </span>
                  </div>

                  <ul className="mt-3 space-y-1 text-[12px] text-[var(--hive-fg-dim)]">
                    {variant.changes.map((change) => (
                      <li key={change}>• {change}</li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="rounded-[var(--hive-radius-sm)] bg-[var(--hive-status-live)] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[var(--hive-green-deep)]">
                      ✅ winner
                    </button>
                    <button className="rounded-[var(--hive-radius-sm)] bg-[var(--hive-bg-soft)] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[var(--hive-fg-dim)]">
                      💀 reject
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {selectedCycle.learned && selectedCycle.learned.length > 0 && (
              <article className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5">
                <div className="flex items-center gap-2 text-[13px] text-[var(--hive-green-mid)]">
                  <Sparkles size={14} /> Cycle takeaways
                </div>
                <div className="mt-3 space-y-2">
                  {selectedCycle.learned.map((lesson) => (
                    <p key={lesson} className="text-[13px] text-[var(--hive-fg-dim)]">
                      • {lesson}
                    </p>
                  ))}
                </div>
              </article>
            )}
          </section>
        </div>
      </div>
    );
  }

  if (view === "history") {
    return (
      <div className="space-y-8">
        <SectionHeading title="History" subtitle="feedback and decisions" />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {[
            { label: "Interactions", value: String(HIVE_ACTIVITY.length) },
            { label: "Accepted", value: String(HIVE_ACTIVITY.filter((entry) => entry.stage === "verify").length) },
            { label: "Lanes", value: "S2/S3/S4" },
            { label: "Window", value: "24h" },
          ].map((stat) => (
            <article key={stat.label} className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5">
              <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">{stat.label}</p>
              <p className="pt-2 text-[42px] leading-none text-[var(--hive-fg-strong)]" style={{ fontWeight: 300 }}>
                {stat.value}
              </p>
            </article>
          ))}
        </div>

        <section className="space-y-4 rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5">
          <div className="relative max-w-[440px]">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hive-fg-muted)]" />
            <input
              type="text"
              value={historyQuery}
              onChange={(event) => setHistoryQuery(event.target.value)}
              placeholder="search events, decisions, or owners"
              className="w-full rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] py-2 pl-9 pr-3 text-sm text-[var(--hive-fg)] outline-none"
            />
          </div>

          <div className="space-y-2">
            {filteredHistory.map((entry) => (
              <article key={`${entry.time}-${entry.msg}`} className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="pt-0.5 text-[var(--hive-green-deep)]">{entry.glyph}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-[var(--hive-fg-strong)]">{entry.msg}</p>
                    <p className="pt-1 text-[11px] uppercase tracking-[0.1em] text-[var(--hive-fg-muted)]">
                      {entry.source} · {entry.lane} · {entry.time}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (view === "settings") {
    return (
      <div className="space-y-8">
        <SectionHeading title="Settings" subtitle="workflow controls" />

        <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
          <div className="flex items-center gap-2">
            <Settings2 size={15} className="text-[var(--hive-green-mid)]" />
            <h3 className="text-[16px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
              Interaction Preferences
            </h3>
          </div>

          <div className="mt-5 space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between text-[13px] text-[var(--hive-fg)]">
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
              <div className="mb-2 flex items-center justify-between text-[13px] text-[var(--hive-fg)]">
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
                <p className="text-[14px] text-[var(--hive-fg-strong)]">Auto deploy winners</p>
                <p className="text-[12px] text-[var(--hive-fg-muted)]">still requires production gate</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${autoDeploy ? "bg-[var(--hive-status-live)] text-[var(--hive-green-deep)]" : "bg-[var(--hive-card-bg)] text-[var(--hive-fg-dim)]"}`}>
                {autoDeploy ? "on" : "off"}
              </span>
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <section className="space-y-6 rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5">
      <div className="flex items-center gap-2">
        <Palette size={16} className="text-[var(--hive-green-mid)]" />
        <h2 className="text-[16px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
          Task Queue
        </h2>
      </div>

      <TaskFilter
        filter={filter}
        onChange={setFilter}
        totalTasks={tasks.length}
        inProgressTasks={inProgressTasks}
        doneTasks={doneTasks}
      />

      <TaskList tasks={tasks} filter={filter} onCycleStatus={cycleStatus} onRemove={removeTask} />
    </section>
  );
}
