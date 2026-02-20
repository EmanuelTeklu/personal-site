CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  root_question TEXT NOT NULL,
  context TEXT,
  budget_cap DECIMAL NOT NULL DEFAULT 5.00 CHECK (budget_cap <= 10.00),
  exploration_cap INTEGER NOT NULL DEFAULT 20 CHECK (exploration_cap <= 50),
  models TEXT[] NOT NULL DEFAULT ARRAY['claude', 'gemini'],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'paused', 'complete', 'failed')),
  budget_spent DECIMAL NOT NULL DEFAULT 0.0,
  exploration_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS public.explorations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  source_model TEXT NOT NULL,
  claims JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence DECIMAL,
  uncertainty TEXT,
  follow_ups TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  raw_response TEXT,
  tokens_used INTEGER,
  cost_dollars DECIMAL,
  predicted_value DECIMAL CHECK (predicted_value >= 0 AND predicted_value <= 1),
  curation_status TEXT NOT NULL DEFAULT 'pending' CHECK (curation_status IN ('pending', 'valuable', 'noise', 'archive')),
  curated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.briefings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_findings TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  claim_graph JSONB,
  gaps TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  next_actions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  total_explorations INTEGER,
  valuable_count INTEGER,
  total_cost DECIMAL,
  slack_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campaign_events (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status_running
  ON public.campaigns(status)
  WHERE status = 'running';

CREATE INDEX IF NOT EXISTS idx_explorations_campaign
  ON public.explorations(campaign_id);

CREATE INDEX IF NOT EXISTS idx_explorations_curation
  ON public.explorations(curation_status);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explorations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS campaigns_policy ON public.campaigns;
CREATE POLICY campaigns_policy
  ON public.campaigns
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS explorations_policy ON public.explorations;
CREATE POLICY explorations_policy
  ON public.explorations
  FOR ALL
  USING (
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS briefings_policy ON public.briefings;
CREATE POLICY briefings_policy
  ON public.briefings
  FOR ALL
  USING (
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS events_policy ON public.campaign_events;
CREATE POLICY events_policy
  ON public.campaign_events
  FOR ALL
  USING (
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.increment_spend(
  p_campaign_id UUID,
  p_amount DECIMAL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.campaigns
  SET budget_spent = budget_spent + COALESCE(p_amount, 0),
      exploration_count = exploration_count + 1
  WHERE id = p_campaign_id;
END;
$$;
