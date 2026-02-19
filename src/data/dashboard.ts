import type { HiveSparkPoint } from "@/types/hive";

// ── Metric cards for the top row ──────────────────────────
export interface DashboardMetric {
  readonly label: string;
  readonly value: string;
  readonly sparkline: readonly HiveSparkPoint[];
  readonly trend: {
    readonly direction: "up" | "down" | "neutral";
    readonly text: string;
  };
}

export const DASHBOARD_METRICS: readonly DashboardMetric[] = [
  {
    label: "Active Campaigns",
    value: "2",
    sparkline: [
      { x: "Mon", y: 1 },
      { x: "Tue", y: 1 },
      { x: "Wed", y: 2 },
      { x: "Thu", y: 2 },
      { x: "Fri", y: 3 },
      { x: "Sat", y: 2 },
      { x: "Sun", y: 2 },
    ],
    trend: { direction: "up", text: "+1 this week" },
  },
  {
    label: "Total Spent",
    value: "$24.50",
    sparkline: [
      { x: "Mon", y: 2.1 },
      { x: "Tue", y: 4.3 },
      { x: "Wed", y: 8.7 },
      { x: "Thu", y: 12.4 },
      { x: "Fri", y: 16.1 },
      { x: "Sat", y: 20.8 },
      { x: "Sun", y: 24.5 },
    ],
    trend: { direction: "down", text: "-12% vs budget" },
  },
  {
    label: "Insights Found",
    value: "47",
    sparkline: [
      { x: "Mon", y: 4 },
      { x: "Tue", y: 8 },
      { x: "Wed", y: 14 },
      { x: "Thu", y: 22 },
      { x: "Fri", y: 31 },
      { x: "Sat", y: 39 },
      { x: "Sun", y: 47 },
    ],
    trend: { direction: "up", text: "23% hit rate" },
  },
  {
    label: "Agent Efficiency",
    value: "78%",
    sparkline: [
      { x: "Mon", y: 71 },
      { x: "Tue", y: 73 },
      { x: "Wed", y: 74 },
      { x: "Thu", y: 75 },
      { x: "Fri", y: 77 },
      { x: "Sat", y: 76 },
      { x: "Sun", y: 78 },
    ],
    trend: { direction: "up", text: "+5% improvement" },
  },
];

// ── Inbox items ───────────────────────────────────────────
export type InboxItemType =
  | "CAMPAIGN"
  | "REVIEW"
  | "RESEARCH"
  | "SYNTHESIS"
  | "PREDICTION"
  | "AGENT"
  | "ALERT";

export interface InboxItem {
  readonly id: string;
  readonly type: InboxItemType;
  readonly priority: "high" | "medium" | "low";
  readonly title: string;
  readonly subtitle: string;
  readonly metadata: string;
  readonly status?: string;
  readonly statusColor?: string;
  readonly progress?: number;
  readonly latestUpdate?: string;
  readonly actionLabel?: string;
}

export const INBOX_ITEMS: readonly InboxItem[] = [
  {
    id: "inb-1",
    type: "CAMPAIGN",
    priority: "high",
    title: "Multi-Agent Coordination Mechanisms",
    subtitle: "Overnight campaign in progress",
    metadata: "12/20 explorations \u00B7 4 agents active \u00B7 $2.40 spent",
    status: "RUNNING",
    statusColor: "running",
    progress: 60,
    latestUpdate:
      "Veto-based evaluation shows 23% improvement over consensus in early results...",
  },
  {
    id: "inb-2",
    type: "REVIEW",
    priority: "high",
    title: "Explorations from Stigmergy Research",
    subtitle: "Findings need human curation",
    metadata: "Completed 2h ago \u00B7 8 valuable \u00B7 5 need curation",
    status: "3 pending",
    statusColor: "warning",
    actionLabel: "Review",
  },
  {
    id: "inb-3",
    type: "RESEARCH",
    priority: "low",
    title: "New paper on \u03B1_\u03C1 phase transitions",
    subtitle: "Flagged by ARCH-01 as highly relevant",
    metadata: "Relevance: 0.87 \u00B7 10 min read",
    status: "HIGH MATCH",
    statusColor: "complete",
    actionLabel: "Read",
  },
  {
    id: "inb-4",
    type: "SYNTHESIS",
    priority: "low",
    title: "Weekly research digest",
    subtitle: "Auto-compiled from completed campaigns",
    metadata: "12 campaigns \u00B7 47 insights \u00B7 3 patterns detected",
    status: "READY",
    statusColor: "idle",
    actionLabel: "View",
  },
];

// ── Campaign data ─────────────────────────────────────────
export interface Campaign {
  readonly id: string;
  readonly name: string;
  readonly question: string;
  readonly status: "pending" | "running" | "paused" | "complete" | "failed";
  readonly progress: { readonly current: number; readonly total: number; readonly percentage: number };
  readonly budget: { readonly spent: number; readonly cap: number; readonly percentage: number };
  readonly agents: readonly AgentAssignment[];
  readonly recentActivity: readonly ActivityItem[];
  readonly findings: readonly string[];
  readonly metrics: {
    readonly explorationCount: number;
    readonly valuableCount: number;
    readonly hitRate: number;
    readonly avgCost: number;
  };
  readonly createdAt: string;
  readonly startedAt?: string;
}

export interface AgentAssignment {
  readonly code: string;
  readonly status: "active" | "idle";
  readonly reputation: number;
}

export interface ActivityItem {
  readonly agent: string;
  readonly action: string;
  readonly time: string;
}

export const CAMPAIGNS: readonly Campaign[] = [
  {
    id: "camp-1",
    name: "Multi-Agent Coordination Mechanisms",
    question:
      "What are the most effective coordination mechanisms for multi-agent AI systems, and what conditions determine when each is appropriate?",
    status: "running",
    progress: { current: 12, total: 20, percentage: 60 },
    budget: { spent: 2.4, cap: 5.0, percentage: 48 },
    agents: [
      { code: "ARCH-01", status: "idle", reputation: 0.82 },
      { code: "BUILD-01", status: "active", reputation: 0.78 },
      { code: "CRIT-01", status: "active", reputation: 0.85 },
      { code: "CRIT-02", status: "idle", reputation: 0.69 },
    ],
    recentActivity: [
      { agent: "CRIT-01", action: 'Evaluated exploration #12 (VALUABLE)', time: "2 min ago" },
      { agent: "BUILD-01", action: "Produced synthesis on stigmergy patterns", time: "5 min ago" },
      { agent: "ARCH-01", action: "Proposed new sub-question on veto mechanisms", time: "8 min ago" },
    ],
    findings: [
      "Stigmergy scales O(n) vs message-passing O(n\u00B2)",
      "Veto-based evaluation reduces Goodhart effects by 23%",
      "Phase transition threshold \u03B1_\u03C1 \u2248 1 is critical boundary",
    ],
    metrics: {
      explorationCount: 12,
      valuableCount: 8,
      hitRate: 0.42,
      avgCost: 0.2,
    },
    createdAt: "Feb 19, 2026 11:00 PM",
    startedAt: "Feb 19, 2026 11:05 PM",
  },
  {
    id: "camp-2",
    name: "Stigmergic Communication Patterns",
    question:
      "How can stigmergic communication principles from biological systems be effectively translated to multi-agent AI architectures?",
    status: "complete",
    progress: { current: 20, total: 20, percentage: 100 },
    budget: { spent: 4.12, cap: 5.0, percentage: 82 },
    agents: [
      { code: "ARCH-01", status: "idle", reputation: 0.82 },
      { code: "BUILD-02", status: "idle", reputation: 0.74 },
      { code: "CRIT-01", status: "idle", reputation: 0.85 },
    ],
    recentActivity: [
      { agent: "SYSTEM", action: "Campaign completed - 20/20 explorations", time: "2h ago" },
      { agent: "CRIT-01", action: "Final evaluation batch processed", time: "2h ago" },
    ],
    findings: [
      "Indirect coordination through shared artifacts outperforms direct messaging at scale",
      "Environmental modification signals create emergent task allocation",
      "Biological stigmergy principles map well to shared-context AI patterns",
    ],
    metrics: {
      explorationCount: 20,
      valuableCount: 8,
      hitRate: 0.4,
      avgCost: 0.21,
    },
    createdAt: "Feb 18, 2026 11:00 PM",
    startedAt: "Feb 18, 2026 11:02 PM",
  },
  {
    id: "camp-3",
    name: "Prediction Market Mechanisms",
    question:
      "What mechanisms enable accurate aggregation of probabilistic predictions across distributed agents?",
    status: "pending",
    progress: { current: 0, total: 15, percentage: 0 },
    budget: { spent: 0, cap: 3.0, percentage: 0 },
    agents: [],
    recentActivity: [],
    findings: [],
    metrics: {
      explorationCount: 0,
      valuableCount: 0,
      hitRate: 0,
      avgCost: 0,
    },
    createdAt: "Feb 20, 2026",
  },
];

// ── Agent roster ──────────────────────────────────────────
export interface Agent {
  readonly id: string;
  readonly code: string;
  readonly branch: "architect" | "builder" | "critic";
  readonly personality: string;
  readonly status: "active" | "idle" | "error";
  readonly currentTask?: string;
  readonly metrics: {
    readonly reputation: number;
    readonly accuracy?: number;
    readonly vetoRate?: number;
    readonly vindicatedDissents?: number;
    readonly totalInteractions: number;
    readonly costEfficiency: number;
  };
}

export const AGENTS: readonly Agent[] = [
  {
    id: "arch-01",
    code: "ARCH-01",
    branch: "architect",
    personality: "The Contrarian",
    status: "active",
    currentTask: "Multi-Agent Coordination",
    metrics: {
      reputation: 0.82,
      vindicatedDissents: 3,
      totalInteractions: 147,
      costEfficiency: 0.89,
    },
  },
  {
    id: "arch-02",
    code: "ARCH-02",
    branch: "architect",
    personality: "The Synthesizer",
    status: "idle",
    metrics: {
      reputation: 0.71,
      vindicatedDissents: 1,
      totalInteractions: 83,
      costEfficiency: 0.82,
    },
  },
  {
    id: "build-01",
    code: "BUILD-01",
    branch: "builder",
    personality: "The Pragmatist",
    status: "active",
    currentTask: "Multi-Agent Coordination",
    metrics: {
      reputation: 0.78,
      accuracy: 0.84,
      totalInteractions: 214,
      costEfficiency: 0.91,
    },
  },
  {
    id: "build-02",
    code: "BUILD-02",
    branch: "builder",
    personality: "The Iterator",
    status: "idle",
    metrics: {
      reputation: 0.74,
      accuracy: 0.79,
      totalInteractions: 156,
      costEfficiency: 0.86,
    },
  },
  {
    id: "crit-01",
    code: "CRIT-01",
    branch: "critic",
    personality: "The Skeptic",
    status: "active",
    currentTask: "Multi-Agent Coordination",
    metrics: {
      reputation: 0.85,
      vetoRate: 0.18,
      totalInteractions: 189,
      costEfficiency: 0.93,
    },
  },
  {
    id: "crit-02",
    code: "CRIT-02",
    branch: "critic",
    personality: "The Calibrator",
    status: "idle",
    metrics: {
      reputation: 0.69,
      vetoRate: 0.12,
      totalInteractions: 92,
      costEfficiency: 0.78,
    },
  },
  {
    id: "crit-03",
    code: "CRIT-03",
    branch: "critic",
    personality: "The Auditor",
    status: "idle",
    metrics: {
      reputation: 0.72,
      vetoRate: 0.22,
      totalInteractions: 64,
      costEfficiency: 0.81,
    },
  },
];

// ── Morning briefing ──────────────────────────────────────
export interface BriefingData {
  readonly date: string;
  readonly campaigns: readonly {
    readonly name: string;
    readonly explorations: number;
    readonly valuable: number;
    readonly hitRate: number;
    readonly spent: number;
    readonly keyFindings: readonly string[];
    readonly gaps: readonly string[];
    readonly recommendations: readonly string[];
  }[];
  readonly attentionItems: readonly {
    readonly priority: "high" | "medium" | "low";
    readonly text: string;
  }[];
  readonly agentHighlights: readonly {
    readonly code: string;
    readonly personality: string;
    readonly message: string;
    readonly actionable: boolean;
  }[];
  readonly systemStatus: {
    readonly budgetSpent: number;
    readonly budgetRemaining: number;
    readonly agentsTotal: number;
    readonly agentsAssigned: number;
    readonly hitRate: number;
    readonly hitRateDelta: number;
  };
}

export const MORNING_BRIEFING: BriefingData = {
  date: "February 20, 2026",
  campaigns: [
    {
      name: "Multi-Agent Coordination",
      explorations: 20,
      valuable: 8,
      hitRate: 0.4,
      spent: 4.12,
      keyFindings: [
        "Stigmergy scales O(n) vs message-passing O(n\u00B2)",
        "Veto-based evaluation reduces Goodhart effects",
        "\u03B1_\u03C1 \u2248 1 is critical phase transition boundary",
      ],
      gaps: [
        "How to measure \u03B1_\u03C1 in practice",
        "Optimal decomposition depth unknown",
      ],
      recommendations: [
        "Launch follow-up campaign on \u03B1_\u03C1 measurement",
        "Test veto vs consensus in your system",
      ],
    },
  ],
  attentionItems: [
    { priority: "high", text: "5 explorations need curation (high confidence)" },
    { priority: "medium", text: "3 explorations need curation (medium confidence)" },
    { priority: "low", text: "Prediction P-AS-1 resolves today" },
  ],
  agentHighlights: [
    {
      code: "ARCH-01",
      personality: "The Contrarian",
      message: "Had 2 vindicated dissents. Consider increasing influence weight?",
      actionable: true,
    },
    {
      code: "CRIT-03",
      personality: "The Auditor",
      message: "0% accuracy this week. Review or reset?",
      actionable: true,
    },
  ],
  systemStatus: {
    budgetSpent: 24.5,
    budgetRemaining: 75.5,
    agentsTotal: 7,
    agentsAssigned: 4,
    hitRate: 0.42,
    hitRateDelta: 5,
  },
};

// ── Analytics data ────────────────────────────────────────
export interface AnalyticsPoint {
  readonly date: string;
  readonly cost: number;
  readonly hitRate: number;
  readonly explorations: number;
}

export const ANALYTICS_DATA: readonly AnalyticsPoint[] = [
  { date: "Feb 14", cost: 3.2, hitRate: 35, explorations: 15 },
  { date: "Feb 15", cost: 4.1, hitRate: 38, explorations: 18 },
  { date: "Feb 16", cost: 2.8, hitRate: 42, explorations: 12 },
  { date: "Feb 17", cost: 5.5, hitRate: 40, explorations: 22 },
  { date: "Feb 18", cost: 4.8, hitRate: 44, explorations: 20 },
  { date: "Feb 19", cost: 4.1, hitRate: 42, explorations: 20 },
  { date: "Feb 20", cost: 0, hitRate: 0, explorations: 0 },
];

export const AGENT_PERFORMANCE: readonly {
  readonly code: string;
  readonly reputation: number;
  readonly interactions: number;
  readonly efficiency: number;
}[] = [
  { code: "ARCH-01", reputation: 82, interactions: 147, efficiency: 89 },
  { code: "ARCH-02", reputation: 71, interactions: 83, efficiency: 82 },
  { code: "BUILD-01", reputation: 78, interactions: 214, efficiency: 91 },
  { code: "BUILD-02", reputation: 74, interactions: 156, efficiency: 86 },
  { code: "CRIT-01", reputation: 85, interactions: 189, efficiency: 93 },
  { code: "CRIT-02", reputation: 69, interactions: 92, efficiency: 78 },
  { code: "CRIT-03", reputation: 72, interactions: 64, efficiency: 81 },
];
