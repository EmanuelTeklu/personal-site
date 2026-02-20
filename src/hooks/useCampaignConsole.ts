import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type {
  Campaign,
  CampaignEvent,
  CampaignModel,
  CampaignReviewData,
  CurationStatus,
  Briefing,
  Exploration,
  LaunchCampaignInput,
} from "@/types/campaign";

const DEFAULT_MODELS: readonly CampaignModel[] = ["claude", "gemini"];

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asObjectArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Record<string, unknown> => !!item && typeof item === "object",
  );
}

function mapCampaign(row: Record<string, unknown>): Campaign {
  return {
    id: String(row.id ?? ""),
    user_id: String(row.user_id ?? ""),
    name: String(row.name ?? ""),
    root_question: String(row.root_question ?? ""),
    context: typeof row.context === "string" ? row.context : null,
    budget_cap: asNumber(row.budget_cap),
    exploration_cap: asNumber(row.exploration_cap),
    models: asStringArray(row.models),
    status: String(row.status ?? "pending") as Campaign["status"],
    budget_spent: asNumber(row.budget_spent),
    exploration_count: asNumber(row.exploration_count),
    created_at: String(row.created_at ?? ""),
    started_at: typeof row.started_at === "string" ? row.started_at : null,
    completed_at: typeof row.completed_at === "string" ? row.completed_at : null,
    error_message: typeof row.error_message === "string" ? row.error_message : null,
  };
}

function mapExploration(row: Record<string, unknown>): Exploration {
  return {
    id: String(row.id ?? ""),
    campaign_id: String(row.campaign_id ?? ""),
    question: String(row.question ?? ""),
    source_model: String(row.source_model ?? ""),
    claims: asStringArray(row.claims),
    evidence: asObjectArray(row.evidence),
    confidence: row.confidence == null ? null : asNumber(row.confidence, 0),
    uncertainty: typeof row.uncertainty === "string" ? row.uncertainty : null,
    follow_ups: asStringArray(row.follow_ups),
    raw_response: typeof row.raw_response === "string" ? row.raw_response : null,
    tokens_used: row.tokens_used == null ? null : asNumber(row.tokens_used),
    cost_dollars: row.cost_dollars == null ? null : asNumber(row.cost_dollars),
    predicted_value: row.predicted_value == null ? null : asNumber(row.predicted_value),
    curation_status: String(row.curation_status ?? "pending") as CurationStatus,
    curated_at: typeof row.curated_at === "string" ? row.curated_at : null,
    created_at: String(row.created_at ?? ""),
  };
}

function mapBriefing(row: Record<string, unknown>): Briefing {
  return {
    id: String(row.id ?? ""),
    campaign_id: String(row.campaign_id ?? ""),
    summary: String(row.summary ?? ""),
    key_findings: asStringArray(row.key_findings),
    claim_graph:
      row.claim_graph && typeof row.claim_graph === "object"
        ? (row.claim_graph as Record<string, unknown>)
        : null,
    gaps: asStringArray(row.gaps),
    next_actions: asStringArray(row.next_actions),
    total_explorations: row.total_explorations == null ? null : asNumber(row.total_explorations),
    valuable_count: row.valuable_count == null ? null : asNumber(row.valuable_count),
    total_cost: row.total_cost == null ? null : asNumber(row.total_cost),
    slack_sent: Boolean(row.slack_sent),
    created_at: String(row.created_at ?? ""),
  };
}

function mapEvent(row: Record<string, unknown>): CampaignEvent {
  return {
    id: String(row.id ?? ""),
    campaign_id: String(row.campaign_id ?? ""),
    event_type: String(row.event_type ?? ""),
    event_data:
      row.event_data && typeof row.event_data === "object"
        ? (row.event_data as Record<string, unknown>)
        : {},
    created_at: String(row.created_at ?? ""),
  };
}

export function useCampaignConsole() {
  const [campaigns, setCampaigns] = useState<readonly Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    if (!supabase) {
      setError("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setCampaigns([]);
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    const mapped = (data ?? []).map((row) => mapCampaign(row as Record<string, unknown>));
    setCampaigns(mapped);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchCampaigns();

    if (!supabase) return;

    const client = supabase;
    const channel = client
      .channel("campaigns-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaigns" },
        () => {
          void fetchCampaigns();
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [fetchCampaigns]);

  const launchCampaign = useCallback(
    async (input: LaunchCampaignInput): Promise<{ campaign: Campaign | null; error: string | null }> => {
      if (!supabase) {
        return {
          campaign: null,
          error: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
        };
      }

      setLaunching(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLaunching(false);
        return { campaign: null, error: "You must be signed in to launch campaigns." };
      }

      const models = input.models.length > 0 ? input.models : DEFAULT_MODELS;

      const { data: inserted, error: insertError } = await supabase
        .from("campaigns")
        .insert({
          user_id: user.id,
          name: input.name,
          root_question: input.root_question,
          context: input.context,
          budget_cap: input.budget_cap,
          exploration_cap: input.exploration_cap,
          models,
        })
        .select("*")
        .single();

      if (insertError || !inserted) {
        setLaunching(false);
        return { campaign: null, error: insertError?.message ?? "Failed to create campaign." };
      }

      const campaign = mapCampaign(inserted as Record<string, unknown>);
      setCampaigns((prev) => [campaign, ...prev]);
      setLaunching(false);

      void supabase.functions
        .invoke("run-campaign", { body: { campaignId: campaign.id } })
        .then(({ error: invokeError }) => {
          if (invokeError) {
            setError(`Campaign created, but run failed to start: ${invokeError.message}`);
          }
          void fetchCampaigns();
        })
        .catch((invokeError: unknown) => {
          setError(`Campaign created, but run failed to start: ${String(invokeError)}`);
          void fetchCampaigns();
        });

      return { campaign, error: null };
    },
    [fetchCampaigns],
  );

  const runningCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.status === "running") ?? null,
    [campaigns],
  );

  const completedCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.status === "complete"),
    [campaigns],
  );

  const totals = useMemo(() => {
    const totalSpent = campaigns.reduce((sum, campaign) => sum + campaign.budget_spent, 0);
    const totalExplorations = campaigns.reduce(
      (sum, campaign) => sum + campaign.exploration_count,
      0,
    );

    return {
      activeCount: campaigns.filter((campaign) => campaign.status === "running").length,
      completeCount: completedCampaigns.length,
      totalSpent,
      totalExplorations,
    };
  }, [campaigns, completedCampaigns.length]);

  return {
    campaigns,
    loading,
    error,
    launching,
    runningCampaign,
    completedCampaigns,
    totals,
    launchCampaign,
    refetchCampaigns: fetchCampaigns,
  } as const;
}

export function useCampaignReview(campaignId: string | null) {
  const [detail, setDetail] = useState<CampaignReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingExplorationId, setUpdatingExplorationId] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!campaignId) {
      setDetail(null);
      setLoading(false);
      return;
    }

    if (!supabase) {
      setError("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setDetail(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const [campaignResult, briefingResult, explorationsResult, eventsResult] = await Promise.all([
      supabase.from("campaigns").select("*").eq("id", campaignId).single(),
      supabase
        .from("briefings")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("explorations")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false }),
      supabase
        .from("campaign_events")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false }),
    ]);

    if (campaignResult.error || !campaignResult.data) {
      setError(campaignResult.error?.message ?? "Campaign not found.");
      setDetail(null);
      setLoading(false);
      return;
    }

    if (explorationsResult.error) {
      setError(explorationsResult.error.message);
      setDetail(null);
      setLoading(false);
      return;
    }

    if (eventsResult.error) {
      setError(eventsResult.error.message);
      setDetail(null);
      setLoading(false);
      return;
    }

    const campaign = mapCampaign(campaignResult.data as Record<string, unknown>);
    const briefing = briefingResult.data
      ? mapBriefing(briefingResult.data as Record<string, unknown>)
      : null;
    const explorations = (explorationsResult.data ?? []).map((row) =>
      mapExploration(row as Record<string, unknown>),
    );
    const events = (eventsResult.data ?? []).map((row) =>
      mapEvent(row as Record<string, unknown>),
    );

    const valuableCount = explorations.filter(
      (exploration) => (exploration.predicted_value ?? 0) >= 0.5,
    ).length;

    const totalCost = briefing?.total_cost ?? campaign.budget_spent;

    setDetail({
      campaign,
      briefing,
      explorations,
      events,
      valuable_count: valuableCount,
      total_cost: totalCost,
    });
    setError(null);
    setLoading(false);
  }, [campaignId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDetail();

    if (!supabase || !campaignId) return;

    const client = supabase;
    const channel = client
      .channel(`campaign-review-${campaignId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaigns", filter: `id=eq.${campaignId}` },
        () => {
          void fetchDetail();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "explorations",
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          void fetchDetail();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "briefings",
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          void fetchDetail();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaign_events",
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          void fetchDetail();
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [campaignId, fetchDetail]);

  const updateCurationStatus = useCallback(
    async (explorationId: string, status: CurationStatus): Promise<{ error: string | null }> => {
      if (!campaignId) return { error: "Campaign id is required." };
      if (!supabase) return { error: "Supabase is not configured." };

      setUpdatingExplorationId(explorationId);

      const { error: updateError } = await supabase
        .from("explorations")
        .update({
          curation_status: status,
          curated_at: new Date().toISOString(),
        })
        .eq("id", explorationId)
        .eq("campaign_id", campaignId);

      setUpdatingExplorationId(null);

      if (updateError) {
        return { error: updateError.message };
      }

      await fetchDetail();
      return { error: null };
    },
    [campaignId, fetchDetail],
  );

  return {
    detail,
    loading,
    error,
    updatingExplorationId,
    updateCurationStatus,
    refetch: fetchDetail,
  } as const;
}
