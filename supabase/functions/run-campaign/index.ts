import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
const SLACK_WEBHOOK = Deno.env.get("SLACK_WEBHOOK_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const MAX_RUNTIME_MS = 10 * 60 * 60 * 1000;
const MAX_FAILURES = 3;
const CLAUDE_TOKEN_RATE = 0.000003;
const GEMINI_TOKEN_RATE = 0.0000001;

type ModelName = "claude" | "gemini";

type CampaignRow = {
  id: string;
  user_id: string;
  name: string;
  root_question: string;
  context: string | null;
  budget_cap: number;
  exploration_cap: number;
  models: string[];
  status: "pending" | "running" | "paused" | "complete" | "failed";
  budget_spent: number;
  exploration_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
};

type ExplorationResult = {
  claims: string[];
  evidence: Array<Record<string, unknown>>;
  confidence: number;
  uncertainty: string;
  follow_ups: string[];
  raw: string;
  tokens: number;
};

type BriefingResult = {
  summary: string;
  key_findings: string[];
  gaps: string[];
  next_actions: string[];
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function safeString(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractFirstJsonBlock(raw: string, openChar: "{" | "["): string | null {
  const closeChar = openChar === "{" ? "}" : "]";
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === openChar) {
      if (depth === 0) start = i;
      depth += 1;
      continue;
    }

    if (ch === closeChar && depth > 0) {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        return raw.slice(start, i + 1);
      }
    }
  }

  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function asEvidenceArray(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .slice(0, 20);
}

function parseJsonObject<T extends Record<string, unknown>>(raw: string): T | null {
  const objectBlock = extractFirstJsonBlock(raw, "{");
  if (!objectBlock) return null;

  try {
    const parsed = JSON.parse(objectBlock);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as T;
    }
  } catch {
    return null;
  }

  return null;
}

function parseJsonArray(raw: string): string[] {
  const arrayBlock = extractFirstJsonBlock(raw, "[");
  if (!arrayBlock) return [];

  try {
    const parsed = JSON.parse(arrayBlock);
    return asStringArray(parsed);
  } catch {
    return [];
  }
}

async function callClaude(prompt: string) {
  if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Claude request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const content = Array.isArray(data?.content)
    ? data.content
        .map((part: Record<string, unknown>) =>
          typeof part?.text === "string" ? part.text : "",
        )
        .join("\n")
    : "";

  const inputTokens = Number(data?.usage?.input_tokens ?? 0);
  const outputTokens = Number(data?.usage?.output_tokens ?? 0);

  return {
    content,
    tokens: inputTokens + outputTokens,
  };
}

async function callGemini(prompt: string) {
  if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY is not configured");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const parts = Array.isArray(data?.candidates?.[0]?.content?.parts)
    ? data.candidates[0].content.parts
    : [];
  const content = parts
    .map((part: Record<string, unknown>) =>
      typeof part?.text === "string" ? part.text : "",
    )
    .join("\n");

  const tokens = Number(data?.usageMetadata?.totalTokenCount ?? 1000);

  return { content, tokens };
}

async function decompose(question: string, context: string): Promise<string[]> {
  const prompt = `Decompose this research question into 4-5 independent sub-questions that together address it comprehensively.

QUESTION: ${question}
CONTEXT: ${context}

Return ONLY a JSON array: ["sub-question 1", "sub-question 2", ...]`;

  const { content } = await callClaude(prompt);
  const parsed = parseJsonArray(content);
  return parsed.length > 0 ? parsed.slice(0, 5) : [question];
}

async function explore(question: string, context: string, model: ModelName): Promise<ExplorationResult> {
  const prompt = `You are conducting research. Return structured findings.

QUESTION: ${question}
CONTEXT: ${context}

Return ONLY valid JSON:
{
  "claims": ["claim 1", "claim 2"],
  "evidence": [{"claim": "claim 1", "source": "description", "quote": "relevant excerpt"}],
  "confidence": 0.7,
  "uncertainty": "what would change this",
  "follow_ups": ["next question 1", "next question 2"]
}`;

  const result = model === "claude" ? await callClaude(prompt) : await callGemini(prompt);

  const parsed = parseJsonObject<Record<string, unknown>>(result.content) ?? {};

  const claims = asStringArray(parsed.claims);
  const evidence = asEvidenceArray(parsed.evidence);
  const followUps = asStringArray(parsed.follow_ups);
  const confidenceValue = Number(parsed.confidence);
  const confidence = Number.isFinite(confidenceValue)
    ? Math.max(0, Math.min(1, confidenceValue))
    : 0.5;
  const uncertainty = typeof parsed.uncertainty === "string" ? parsed.uncertainty : "";

  return {
    claims,
    evidence,
    confidence,
    uncertainty,
    follow_ups: followUps,
    raw: result.content,
    tokens: Number.isFinite(result.tokens) ? result.tokens : 1000,
  };
}

function score(exp: ExplorationResult): number {
  let value = 0.5;
  if (exp.claims.length > 2) value += 0.1;
  if (exp.evidence.length > 0) value += 0.15;
  if (exp.confidence > 0 && exp.confidence < 1) value += 0.05;
  if (exp.uncertainty.length > 20) value += 0.1;
  if (exp.follow_ups.length > 0) value += 0.1;
  return Math.min(1, Math.max(0, value));
}

async function sendSlack(briefing: Record<string, unknown>, campaign: CampaignRow): Promise<boolean> {
  if (!SLACK_WEBHOOK) return false;

  const keyFindings = Array.isArray(briefing.key_findings)
    ? briefing.key_findings.filter((entry): entry is string => typeof entry === "string").slice(0, 3)
    : [];

  const totalExplorations = Number(briefing.total_explorations ?? 0);
  const valuableCount = Number(briefing.valuable_count ?? 0);
  const totalCost = Number(briefing.total_cost ?? 0);

  const response = await fetch(SLACK_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: `✅ ${campaign.name} Complete` },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Findings:*\n${keyFindings.map((finding) => `• ${finding}`).join("\n")}`,
          },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Explorations:* ${totalExplorations}` },
            { type: "mrkdwn", text: `*Valuable:* ${valuableCount}` },
            { type: "mrkdwn", text: `*Cost:* $${totalCost.toFixed(2)}` },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Review →" },
              url: `https://emanuelteklu.com/cc/campaigns/${campaign.id}`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Slack webhook failed (${response.status}): ${text}`);
  }

  return true;
}

function parseBriefing(raw: string): BriefingResult {
  const parsed = parseJsonObject<Record<string, unknown>>(raw) ?? {};
  const summary = typeof parsed.summary === "string" && parsed.summary.trim().length > 0
    ? parsed.summary
    : "Campaign complete.";

  return {
    summary,
    key_findings: asStringArray(parsed.key_findings),
    gaps: asStringArray(parsed.gaps),
    next_actions: asStringArray(parsed.next_actions),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse(
      { error: "Supabase environment variables are missing in edge runtime" },
      500,
    );
  }

  let campaignId = "";
  let campaign: CampaignRow | null = null;
  let markedComplete = false;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing Authorization header" }, 401);
  }

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
    auth: {
      persistSession: false,
    },
  });

  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const body = await req.json();
    campaignId = typeof body?.campaignId === "string" ? body.campaignId : "";
    if (!campaignId) {
      return jsonResponse({ error: "campaignId is required" }, 400);
    }

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const campaignResult = await serviceClient
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .eq("user_id", user.id)
      .single<CampaignRow>();

    if (campaignResult.error || !campaignResult.data) {
      return jsonResponse({ error: "Campaign not found" }, 404);
    }

    campaign = campaignResult.data;

    await serviceClient
      .from("campaigns")
      .update({
        status: "running",
        started_at: new Date().toISOString(),
        completed_at: null,
        error_message: null,
      })
      .eq("id", campaignId);

    await serviceClient.from("campaign_events").insert({
      campaign_id: campaignId,
      event_type: "started",
      event_data: {},
    });

    const subQuestions = await decompose(campaign.root_question, campaign.context ?? "");

    await serviceClient.from("campaign_events").insert({
      campaign_id: campaignId,
      event_type: "decomposed",
      event_data: { count: subQuestions.length },
    });

    const queue: Array<{ q: string; m: ModelName }> = [];
    for (const question of subQuestions) {
      for (const model of campaign.models) {
        if (model === "claude" || model === "gemini") {
          queue.push({ q: question, m: model });
        }
      }
    }

    if (queue.length === 0) {
      queue.push({ q: campaign.root_question, m: "claude" });
    }

    const runStartedAt = Date.now();
    let failures = 0;

    for (const task of queue) {
      if (Date.now() - runStartedAt > MAX_RUNTIME_MS) {
        throw new Error("Runtime limit reached (10 hours)");
      }

      const capCheck = await serviceClient
        .from("campaigns")
        .select("budget_spent,budget_cap,exploration_count,exploration_cap")
        .eq("id", campaignId)
        .single<Pick<CampaignRow, "budget_spent" | "budget_cap" | "exploration_count" | "exploration_cap">>();

      if (!capCheck.data) {
        throw new Error("Campaign cap check failed");
      }

      if (
        Number(capCheck.data.budget_spent) >= Number(capCheck.data.budget_cap) ||
        Number(capCheck.data.exploration_count) >= Number(capCheck.data.exploration_cap)
      ) {
        await serviceClient.from("campaign_events").insert({
          campaign_id: campaignId,
          event_type: "limit_reached",
          event_data: {
            budget_spent: capCheck.data.budget_spent,
            budget_cap: capCheck.data.budget_cap,
            exploration_count: capCheck.data.exploration_count,
            exploration_cap: capCheck.data.exploration_cap,
          },
        });
        break;
      }

      try {
        const exploration = await explore(task.q, campaign.context ?? "", task.m);
        const cost =
          task.m === "claude"
            ? exploration.tokens * CLAUDE_TOKEN_RATE
            : exploration.tokens * GEMINI_TOKEN_RATE;
        const predicted = score(exploration);

        const insertExploration = await serviceClient.from("explorations").insert({
          campaign_id: campaignId,
          question: task.q,
          source_model: task.m,
          claims: exploration.claims,
          evidence: exploration.evidence,
          confidence: exploration.confidence,
          uncertainty: exploration.uncertainty,
          follow_ups: exploration.follow_ups,
          raw_response: exploration.raw,
          tokens_used: exploration.tokens,
          cost_dollars: cost,
          predicted_value: predicted,
          curation_status: predicted < 0.2 ? "archive" : "pending",
        });

        if (insertExploration.error) {
          throw new Error(insertExploration.error.message);
        }

        const spendResult = await serviceClient.rpc("increment_spend", {
          p_campaign_id: campaignId,
          p_amount: cost,
        });

        if (spendResult.error) {
          throw new Error(spendResult.error.message);
        }

        failures = 0;

        await serviceClient.from("campaign_events").insert({
          campaign_id: campaignId,
          event_type: "exploration_complete",
          event_data: {
            model: task.m,
            question: task.q,
            tokens: exploration.tokens,
            cost,
            predicted,
          },
        });

        await sleep(250);
      } catch (error) {
        failures += 1;

        await serviceClient.from("campaign_events").insert({
          campaign_id: campaignId,
          event_type: "error",
          event_data: {
            model: task.m,
            question: task.q,
            error: safeString(error),
            consecutive_failures: failures,
          },
        });

        if (failures >= MAX_FAILURES) {
          throw new Error("Circuit breaker triggered after 3 consecutive failures");
        }
      }
    }

    const { data: explorationsData, error: explorationsError } = await serviceClient
      .from("explorations")
      .select("*")
      .eq("campaign_id", campaignId);

    if (explorationsError) throw new Error(explorationsError.message);

    const explorations = explorationsData ?? [];
    const valuable = explorations.filter((exp) => Number(exp.predicted_value ?? 0) >= 0.5);
    const allClaims = explorations
      .flatMap((exp) => (Array.isArray(exp.claims) ? exp.claims : []))
      .filter((claim): claim is string => typeof claim === "string")
      .slice(0, 30);

    const briefingPrompt = `Summarize these research findings:

QUESTION: ${campaign.root_question}
CLAIMS: ${allClaims.join("; ")}

Return JSON:
{
  "summary": "2-3 sentences",
  "key_findings": ["finding 1", "finding 2", "finding 3"],
  "gaps": ["gap 1", "gap 2"],
  "next_actions": ["action 1", "action 2"]
}`;

    const { content: briefingRaw } = await callClaude(briefingPrompt);
    const briefingData = parseBriefing(briefingRaw);

    const totalsResult = await serviceClient
      .from("campaigns")
      .select("budget_spent,exploration_count")
      .eq("id", campaignId)
      .single<{ budget_spent: number; exploration_count: number }>();

    const totalCost = Number(totalsResult.data?.budget_spent ?? 0);
    const totalExplorations = Number(totalsResult.data?.exploration_count ?? explorations.length);

    const briefingInsert = await serviceClient
      .from("briefings")
      .insert({
        campaign_id: campaignId,
        summary: briefingData.summary,
        key_findings: briefingData.key_findings,
        gaps: briefingData.gaps,
        next_actions: briefingData.next_actions,
        total_explorations: totalExplorations,
        valuable_count: valuable.length,
        total_cost: totalCost,
        slack_sent: false,
      })
      .select("*")
      .single<Record<string, unknown>>();

    if (briefingInsert.error || !briefingInsert.data) {
      throw new Error(briefingInsert.error?.message ?? "Failed to insert briefing");
    }

    const briefing = briefingInsert.data;
    const briefingId = typeof briefing.id === "string" ? briefing.id : "";

    let slackSent = false;
    try {
      slackSent = await sendSlack(briefing, campaign);
    } catch (error) {
      await serviceClient.from("campaign_events").insert({
        campaign_id: campaignId,
        event_type: "slack_error",
        event_data: { error: safeString(error) },
      });
    }

    if (slackSent && briefingId) {
      await serviceClient
        .from("briefings")
        .update({ slack_sent: true })
        .eq("id", briefingId);
    }

    await serviceClient
      .from("campaigns")
      .update({
        status: "complete",
        completed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", campaignId);

    await serviceClient.from("campaign_events").insert({
      campaign_id: campaignId,
      event_type: "completed",
      event_data: {
        total_explorations: totalExplorations,
        valuable_count: valuable.length,
        total_cost: totalCost,
        slack_sent: slackSent,
      },
    });

    markedComplete = true;

    return jsonResponse({
      success: true,
      campaignId,
      totalExplorations,
      valuableCount: valuable.length,
      totalCost,
      slackSent,
    });
  } catch (error) {
    const message = safeString(error);

    if (campaignId && !markedComplete) {
      await serviceClient
        .from("campaigns")
        .update({
          status: "failed",
          error_message: message,
        })
        .eq("id", campaignId);

      await serviceClient.from("campaign_events").insert({
        campaign_id: campaignId,
        event_type: "failed",
        event_data: {
          error: message,
        },
      });
    }

    return jsonResponse({ error: message }, 500);
  }
});
