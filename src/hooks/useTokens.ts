import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface TokenPeriod {
  readonly input_tokens: number;
  readonly output_tokens: number;
  readonly cost_usd: number;
}

export interface TokenUsage {
  readonly today: TokenPeriod;
  readonly this_week: TokenPeriod;
  readonly this_month: TokenPeriod;
  readonly by_source: Readonly<Record<string, TokenPeriod>>;
  readonly last_updated: string;
}

export function useTokens() {
  return useQuery<TokenUsage>({
    queryKey: ["tokens"],
    queryFn: () => apiFetch<TokenUsage>("/api/tokens"),
    refetchInterval: 30_000,
  });
}
