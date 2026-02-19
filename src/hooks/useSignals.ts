import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface Commit {
  readonly type: "commit";
  readonly repo: string;
  readonly hash: string;
  readonly message: string;
  readonly date: string;
  readonly seed: string;
}

interface SignalsResponse {
  readonly commits: readonly Commit[];
}

export function useSignals() {
  return useQuery<SignalsResponse>({
    queryKey: ["signals"],
    queryFn: () => apiFetch<SignalsResponse>("/api/signals"),
    refetchInterval: 60_000,
  });
}
