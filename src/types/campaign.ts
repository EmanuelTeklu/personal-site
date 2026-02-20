export type CampaignStatus = "pending" | "running" | "paused" | "complete" | "failed";
export type CampaignModel = "claude" | "gemini";
export type CurationStatus = "pending" | "valuable" | "noise" | "archive";

export interface Campaign {
  readonly id: string;
  readonly user_id: string;
  readonly name: string;
  readonly root_question: string;
  readonly context: string | null;
  readonly budget_cap: number;
  readonly exploration_cap: number;
  readonly models: readonly string[];
  readonly status: CampaignStatus;
  readonly budget_spent: number;
  readonly exploration_count: number;
  readonly created_at: string;
  readonly started_at: string | null;
  readonly completed_at: string | null;
  readonly error_message: string | null;
}

export interface ExplorationEvidence {
  readonly claim?: string;
  readonly source?: string;
  readonly quote?: string;
  readonly [key: string]: unknown;
}

export interface Exploration {
  readonly id: string;
  readonly campaign_id: string;
  readonly question: string;
  readonly source_model: string;
  readonly claims: readonly string[];
  readonly evidence: readonly ExplorationEvidence[];
  readonly confidence: number | null;
  readonly uncertainty: string | null;
  readonly follow_ups: readonly string[];
  readonly raw_response: string | null;
  readonly tokens_used: number | null;
  readonly cost_dollars: number | null;
  readonly predicted_value: number | null;
  readonly curation_status: CurationStatus;
  readonly curated_at: string | null;
  readonly created_at: string;
}

export interface Briefing {
  readonly id: string;
  readonly campaign_id: string;
  readonly summary: string;
  readonly key_findings: readonly string[];
  readonly claim_graph: Record<string, unknown> | null;
  readonly gaps: readonly string[];
  readonly next_actions: readonly string[];
  readonly total_explorations: number | null;
  readonly valuable_count: number | null;
  readonly total_cost: number | null;
  readonly slack_sent: boolean;
  readonly created_at: string;
}

export interface CampaignEvent {
  readonly id: string;
  readonly campaign_id: string;
  readonly event_type: string;
  readonly event_data: Record<string, unknown>;
  readonly created_at: string;
}

export interface LaunchCampaignInput {
  readonly name: string;
  readonly root_question: string;
  readonly context: string;
  readonly budget_cap: number;
  readonly exploration_cap: number;
  readonly models: readonly CampaignModel[];
}

export interface CampaignReviewData {
  readonly campaign: Campaign;
  readonly briefing: Briefing | null;
  readonly explorations: readonly Exploration[];
  readonly events: readonly CampaignEvent[];
  readonly valuable_count: number;
  readonly total_cost: number;
}
