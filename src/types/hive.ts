export type AgentTier = "orchestrator" | "meta" | "staff" | "swarm" | "unit";
export type CampaignPhase = "Intel" | "Build" | "Review" | "Deploy";
export type HiveCampaignStatus = "active" | "planning" | "queued" | "done";
export type ActivityType = "build" | "intel" | "flag" | "cost" | "meta";
export type ActivityLane = "S2" | "S3" | "S4" | "META";
export type ActivitySeverity = "routine" | "watch" | "critical";
export type HiveRiskLevel = "low" | "watch" | "high";

export interface HiveSparkPoint {
  readonly x: string;
  readonly y: number;
}

export interface HiveStat {
  readonly label: string;
  readonly value: number;
  readonly unit?: string;
  readonly accent?: boolean;
  readonly trendLabel: string;
  readonly context: string;
  readonly sparkline: readonly HiveSparkPoint[];
}

export interface HiveAgent {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly tier: AgentTier;
  readonly parentId: string | null;
  readonly status: "active" | "idle" | "offline";
  readonly icon: string;
}

export interface HiveTask {
  readonly name: string;
  readonly status: "done" | "active" | "pending";
  readonly progress: number;
  readonly cell: ActivityLane;
}

export interface HiveCampaign {
  readonly id: string;
  readonly name: string;
  readonly objective: string;
  readonly status: HiveCampaignStatus;
  readonly phase: CampaignPhase;
  readonly progress: number;
  readonly apiCost: number;
  readonly budget: number;
  readonly tokens: number;
  readonly linesWritten: number;
  readonly tasks: readonly HiveTask[];
  readonly started: string | null;
  readonly owner: string;
  readonly staffCell: ActivityLane;
  readonly risk: HiveRiskLevel;
  readonly swarmCount: number;
  readonly eta: string | null;
  readonly momentum: readonly HiveSparkPoint[];
}

export interface HiveActivityEntry {
  readonly time: string;
  readonly type: ActivityType;
  readonly source: string;
  readonly msg: string;
  readonly lane: ActivityLane;
  readonly severity: ActivitySeverity;
  readonly glyph: string;
}
