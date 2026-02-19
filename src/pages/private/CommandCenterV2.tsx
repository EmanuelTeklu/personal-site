import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { DashboardHeader } from "@/components/private/dashboard/DashboardHeader";
import { MetricsRow } from "@/components/private/dashboard/MetricsRow";
import { AttentionInbox } from "@/components/private/dashboard/AttentionInbox";
import { CampaignCard } from "@/components/private/dashboard/CampaignCard";
import { AgentGrid } from "@/components/private/dashboard/AgentGrid";
import { MorningBriefing } from "@/components/private/dashboard/MorningBriefing";
import { LaunchCampaignModal } from "@/components/private/dashboard/LaunchCampaignModal";

import {
  DASHBOARD_METRICS,
  INBOX_ITEMS,
  CAMPAIGNS,
  AGENTS,
  MORNING_BRIEFING,
  ANALYTICS_DATA,
  AGENT_PERFORMANCE,
} from "@/data/dashboard";

type View =
  | "dashboard"
  | "campaigns"
  | "agents"
  | "research"
  | "analytics"
  | "settings"
  | "docs";

const VALID_VIEWS: readonly View[] = [
  "dashboard",
  "campaigns",
  "agents",
  "research",
  "analytics",
  "settings",
  "docs",
];

function normalizeView(value: string | null): View {
  if (value && (VALID_VIEWS as readonly string[]).includes(value)) return value as View;
  return "dashboard";
}

/* ── Dashboard View ─────────────────────────────────────── */
function DashboardView({ onLaunchCampaign }: { readonly onLaunchCampaign: () => void }) {
  const [briefingDismissed, setBriefingDismissed] = useState(false);

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Command Console"
        subtitle="taste-to-production"
        onLaunchCampaign={onLaunchCampaign}
      />

      {/* Morning briefing */}
      {!briefingDismissed && (
        <MorningBriefing data={MORNING_BRIEFING} onDismiss={() => setBriefingDismissed(true)} />
      )}

      {/* Metrics */}
      <MetricsRow metrics={DASHBOARD_METRICS} />

      {/* Inbox + Running campaigns layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <AttentionInbox items={INBOX_ITEMS} />
        </div>

        <div className="space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2
              className="text-[18px] tracking-tight text-[var(--hive-fg-strong)]"
              style={{ fontWeight: 500 }}
            >
              Running Campaigns
            </h2>
            <button className="flex items-center gap-1 text-[12px] text-[var(--hive-green-mid)]">
              View All <ChevronRight size={13} />
            </button>
          </div>
          {CAMPAIGNS.filter((c) => c.status === "running").map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Campaigns View ─────────────────────────────────────── */
function CampaignsView({ onLaunchCampaign }: { readonly onLaunchCampaign: () => void }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredCampaigns =
    statusFilter === "all"
      ? CAMPAIGNS
      : CAMPAIGNS.filter((c) => c.status === statusFilter);

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Campaigns"
        subtitle="research campaigns"
        onLaunchCampaign={onLaunchCampaign}
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: CAMPAIGNS.length },
          { label: "Running", value: CAMPAIGNS.filter((c) => c.status === "running").length },
          { label: "Complete", value: CAMPAIGNS.filter((c) => c.status === "complete").length },
          { label: "Pending", value: CAMPAIGNS.filter((c) => c.status === "pending").length },
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5"
          >
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
              {stat.label}
            </p>
            <p
              className="mt-2 text-[36px] leading-none text-[var(--hive-fg-strong)]"
              style={{ fontFamily: "var(--mono)", fontWeight: 300 }}
            >
              {stat.value}
            </p>
          </article>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "running", "complete", "pending", "paused"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-[4px] px-3 py-1.5 text-[12px] capitalize transition-colors ${
              statusFilter === status
                ? "bg-[var(--hive-green-deep)] text-white"
                : "border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] text-[var(--hive-fg-dim)] hover:bg-[var(--hive-bg-soft)]"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Campaign list */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}

/* ── Agents View ────────────────────────────────────────── */
function AgentsView() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Agents" subtitle="ai agent roster" />

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Agents", value: AGENTS.length },
          { label: "Active", value: AGENTS.filter((a) => a.status === "active").length },
          { label: "Avg Reputation", value: (AGENTS.reduce((acc, a) => acc + a.metrics.reputation, 0) / AGENTS.length).toFixed(2) },
          { label: "Interactions", value: AGENTS.reduce((acc, a) => acc + a.metrics.totalInteractions, 0) },
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5"
          >
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
              {stat.label}
            </p>
            <p
              className="mt-2 text-[36px] leading-none text-[var(--hive-fg-strong)]"
              style={{ fontFamily: "var(--mono)", fontWeight: 300 }}
            >
              {stat.value}
            </p>
          </article>
        ))}
      </div>

      <AgentGrid agents={AGENTS} />
    </div>
  );
}

/* ── Research View ──────────────────────────────────────── */
function ResearchView() {
  const hypotheses = [
    {
      id: "h1",
      text: "Stigmergy scales better than message-passing for coordination",
      status: "validated" as const,
      confidence: 0.87,
      source: "Multi-Agent Coordination campaign",
    },
    {
      id: "h2",
      text: "Veto-based evaluation reduces Goodhart effects",
      status: "validated" as const,
      confidence: 0.78,
      source: "Multi-Agent Coordination campaign",
    },
    {
      id: "h3",
      text: "Phase transition threshold alpha_rho ~ 1 is a critical boundary",
      status: "testing" as const,
      confidence: 0.65,
      source: "Stigmergic Communication campaign",
    },
    {
      id: "h4",
      text: "Decomposition depth > 3 decreases finding quality",
      status: "testing" as const,
      confidence: 0.52,
      source: "System observation",
    },
    {
      id: "h5",
      text: "GPT-4 produces higher confidence findings than Gemini",
      status: "falsified" as const,
      confidence: 0.3,
      source: "Model comparison analysis",
    },
  ];

  return (
    <div className="space-y-8">
      <DashboardHeader title="Research" subtitle="hypothesis tracker" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Validated", value: hypotheses.filter((h) => h.status === "validated").length },
          { label: "Testing", value: hypotheses.filter((h) => h.status === "testing").length },
          { label: "Falsified", value: hypotheses.filter((h) => h.status === "falsified").length },
          { label: "Total", value: hypotheses.length },
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5"
          >
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
              {stat.label}
            </p>
            <p
              className="mt-2 text-[36px] leading-none text-[var(--hive-fg-strong)]"
              style={{ fontFamily: "var(--mono)", fontWeight: 300 }}
            >
              {stat.value}
            </p>
          </article>
        ))}
      </div>

      {/* Hypotheses */}
      <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
        <h2
          className="mb-5 text-[18px] tracking-tight text-[var(--hive-fg-strong)]"
          style={{ fontWeight: 500 }}
        >
          Hypothesis Tracker
        </h2>

        <div className="space-y-3">
          {hypotheses.map((hypothesis) => (
            <article
              key={hypothesis.id}
              className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] p-4 transition-colors hover:bg-[var(--hive-bg-soft)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[14px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
                    {hypothesis.text}
                  </p>
                  <p className="mt-1 text-[12px] text-[var(--hive-fg-muted)]">
                    Source: {hypothesis.source}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-[14px]"
                    style={{ fontFamily: "var(--mono)" }}
                  >
                    <span className="text-[var(--hive-fg-muted)]">conf:</span>{" "}
                    <span className="text-[var(--hive-fg-strong)]">
                      {(hypothesis.confidence * 100).toFixed(0)}%
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${
                      hypothesis.status === "validated"
                        ? "bg-[var(--hive-status-live)] text-[var(--hive-green-deep)]"
                        : hypothesis.status === "testing"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-600"
                    }`}
                  >
                    {hypothesis.status}
                  </span>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--hive-card-border)]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    hypothesis.status === "validated"
                      ? "bg-[var(--hive-green-mid)]"
                      : hypothesis.status === "testing"
                        ? "bg-amber-400"
                        : "bg-red-400"
                  }`}
                  style={{ width: `${hypothesis.confidence * 100}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Validated Principles */}
      <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
        <h2
          className="mb-4 text-[18px] tracking-tight text-[var(--hive-fg-strong)]"
          style={{ fontWeight: 500 }}
        >
          Validated Principles
        </h2>
        <div className="space-y-2">
          {hypotheses
            .filter((h) => h.status === "validated")
            .map((h) => (
              <div
                key={h.id}
                className="flex items-start gap-2 rounded-[4px] bg-[var(--hive-accent-dim)] px-3 py-2 text-[13px] text-[var(--hive-green-deep)]"
              >
                <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--hive-green-mid)]" />
                {h.text}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}

/* ── Analytics View ─────────────────────────────────────── */
function AnalyticsView() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Analytics" subtitle="system performance" />

      {/* Top-level metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Campaigns", value: "5" },
          { label: "Avg Hit Rate", value: "40%" },
          { label: "Avg Cost", value: "$4.12" },
          { label: "Total Insights", value: "47" },
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5"
          >
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
              {stat.label}
            </p>
            <p
              className="mt-2 text-[36px] leading-none text-[var(--hive-fg-strong)]"
              style={{ fontFamily: "var(--mono)", fontWeight: 300 }}
            >
              {stat.value}
            </p>
          </article>
        ))}
      </div>

      {/* Cost & Hit Rate chart */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
          <h3
            className="mb-4 text-[16px] tracking-tight text-[var(--hive-fg-strong)]"
            style={{ fontWeight: 500 }}
          >
            Cost Over Time
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...ANALYTICS_DATA]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--hive-card-border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--hive-fg-muted)" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--hive-fg-muted)" }}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--hive-card-bg)",
                    border: "1px solid var(--hive-card-border)",
                    borderRadius: "4px",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="cost" fill="var(--hive-green-mid)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
          <h3
            className="mb-4 text-[16px] tracking-tight text-[var(--hive-fg-strong)]"
            style={{ fontWeight: 500 }}
          >
            Hit Rate Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...ANALYTICS_DATA]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--hive-card-border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--hive-fg-muted)" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--hive-fg-muted)" }}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--hive-card-bg)",
                    border: "1px solid var(--hive-card-border)",
                    borderRadius: "4px",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hitRate"
                  stroke="var(--hive-green-mid)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--hive-green-mid)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Agent performance comparison */}
      <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
        <h3
          className="mb-4 text-[16px] tracking-tight text-[var(--hive-fg-strong)]"
          style={{ fontWeight: 500 }}
        >
          Agent Performance Comparison
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...AGENT_PERFORMANCE]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--hive-card-border)" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--hive-fg-muted)" }}
                domain={[0, 100]}
              />
              <YAxis
                type="category"
                dataKey="code"
                tick={{ fontSize: 11, fill: "var(--hive-fg-muted)", fontFamily: "var(--mono)" }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--hive-card-bg)",
                  border: "1px solid var(--hive-card-border)",
                  borderRadius: "4px",
                  fontSize: 12,
                }}
              />
              <Legend />
              <Bar dataKey="reputation" fill="var(--hive-green-mid)" name="Reputation" radius={[0, 4, 4, 0]} />
              <Bar dataKey="efficiency" fill="var(--hive-green-light)" name="Efficiency" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Exploration volume */}
      <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
        <h3
          className="mb-4 text-[16px] tracking-tight text-[var(--hive-fg-strong)]"
          style={{ fontWeight: 500 }}
        >
          Exploration Volume
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...ANALYTICS_DATA]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--hive-card-border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--hive-fg-muted)" }}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--hive-fg-muted)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--hive-card-bg)",
                  border: "1px solid var(--hive-card-border)",
                  borderRadius: "4px",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="explorations" fill="var(--hive-green-deep)" name="Explorations" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

/* ── Settings View ──────────────────────────────────────── */
function SettingsView() {
  const [notifySlack, setNotifySlack] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(100);

  return (
    <div className="space-y-8">
      <DashboardHeader title="Settings" subtitle="system configuration" />

      {/* API Keys */}
      <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
        <h3
          className="mb-4 text-[16px] tracking-tight text-[var(--hive-fg-strong)]"
          style={{ fontWeight: 500 }}
        >
          API Keys
        </h3>
        <div className="space-y-3">
          {["Anthropic (Claude)", "Google (Gemini)", "OpenAI (GPT-4)"].map((provider) => (
            <div
              key={provider}
              className="flex items-center justify-between rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-4 py-3"
            >
              <span className="text-[13px] text-[var(--hive-fg)]">{provider}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[var(--hive-fg-muted)]" style={{ fontFamily: "var(--mono)" }}>
                  sk-...{Math.random().toString(36).substring(2, 6)}
                </span>
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--hive-green-bright)]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
        <h3
          className="mb-4 text-[16px] tracking-tight text-[var(--hive-fg-strong)]"
          style={{ fontWeight: 500 }}
        >
          Notifications
        </h3>
        <div className="space-y-3">
          <button
            onClick={() => setNotifySlack(!notifySlack)}
            className="flex w-full items-center justify-between rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-4 py-3"
          >
            <span className="text-[13px] text-[var(--hive-fg)]">Slack notifications</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${
                notifySlack
                  ? "bg-[var(--hive-status-live)] text-[var(--hive-green-deep)]"
                  : "bg-[var(--hive-bg-soft)] text-[var(--hive-fg-muted)]"
              }`}
            >
              {notifySlack ? "on" : "off"}
            </span>
          </button>
          <button
            onClick={() => setNotifyEmail(!notifyEmail)}
            className="flex w-full items-center justify-between rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-4 py-3"
          >
            <span className="text-[13px] text-[var(--hive-fg)]">Email digest</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${
                notifyEmail
                  ? "bg-[var(--hive-status-live)] text-[var(--hive-green-deep)]"
                  : "bg-[var(--hive-bg-soft)] text-[var(--hive-fg-muted)]"
              }`}
            >
              {notifyEmail ? "on" : "off"}
            </span>
          </button>
        </div>
      </section>

      {/* Budget */}
      <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
        <h3
          className="mb-4 text-[16px] tracking-tight text-[var(--hive-fg-strong)]"
          style={{ fontWeight: 500 }}
        >
          Budget Limits
        </h3>
        <div>
          <div className="flex items-center justify-between text-[13px] text-[var(--hive-fg)]">
            <span>Monthly budget cap</span>
            <span style={{ fontFamily: "var(--mono)" }}>${monthlyBudget}</span>
          </div>
          <input
            type="range"
            min={25}
            max={500}
            step={25}
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--hive-green-mid)]"
          />
          <div className="flex justify-between text-[10px] text-[var(--hive-fg-muted)]">
            <span>$25</span>
            <span>$500</span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export function CommandCenterV2() {
  const [searchParams] = useSearchParams();
  const view = normalizeView(searchParams.get("view"));
  const [launchModalOpen, setLaunchModalOpen] = useState(false);

  const openLaunchModal = () => setLaunchModalOpen(true);
  const closeLaunchModal = () => setLaunchModalOpen(false);

  return (
    <>
      {view === "dashboard" && <DashboardView onLaunchCampaign={openLaunchModal} />}
      {view === "campaigns" && <CampaignsView onLaunchCampaign={openLaunchModal} />}
      {view === "agents" && <AgentsView />}
      {view === "research" && <ResearchView />}
      {view === "analytics" && <AnalyticsView />}
      {view === "settings" && <SettingsView />}
      {view === "docs" && (
        <div className="space-y-8">
          <DashboardHeader title="Documentation" subtitle="system reference" />
          <section className="rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-6">
            <p className="text-[14px] text-[var(--hive-fg-dim)]">
              Documentation for the JaneHive Command Console. This system orchestrates AI agents for overnight
              research campaigns, managing exploration, evaluation, and synthesis workflows.
            </p>
          </section>
        </div>
      )}

      <LaunchCampaignModal open={launchModalOpen} onClose={closeLaunchModal} />
    </>
  );
}
