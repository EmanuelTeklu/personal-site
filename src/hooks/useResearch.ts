import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface ResearchBrief {
  readonly slug: string;
  readonly name: string;
  readonly modified: number;
}

export interface ResearchDetail {
  readonly slug: string;
  readonly name: string;
  readonly content: string;
}

export function useResearchList() {
  return useQuery<readonly ResearchBrief[]>({
    queryKey: ["research"],
    queryFn: () => apiFetch<ResearchBrief[]>("/api/research"),
  });
}

export function useResearchDetail(slug: string | null) {
  return useQuery<ResearchDetail>({
    queryKey: ["research", slug],
    queryFn: () => apiFetch<ResearchDetail>(`/api/research/${slug}`),
    enabled: !!slug,
  });
}
