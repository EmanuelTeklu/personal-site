import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type CampaignStatus = "draft" | "active" | "paused" | "ended";

export interface Campaign {
  readonly id: string;
  readonly name: string;
  readonly goal: string;
  readonly status: CampaignStatus;
  readonly createdAt: number;
  readonly launchedAt?: number;
  readonly notes: string;
}

const STORAGE_KEY = "cc-campaigns";

export function useCampaigns() {
  const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>(
    STORAGE_KEY,
    [],
  );

  const addCampaign = useCallback(
    (fields: { name: string; goal: string }) => {
      const next: Campaign = {
        id: crypto.randomUUID(),
        name: fields.name.trim(),
        goal: fields.goal.trim(),
        status: "draft",
        createdAt: Date.now(),
        notes: "",
      };
      setCampaigns((prev) => [...prev, next]);
    },
    [setCampaigns],
  );

  const updateStatus = useCallback(
    (id: string, status: CampaignStatus) => {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status,
                launchedAt:
                  status === "active" && !c.launchedAt
                    ? Date.now()
                    : c.launchedAt,
              }
            : c,
        ),
      );
    },
    [setCampaigns],
  );

  const updateNotes = useCallback(
    (id: string, notes: string) => {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, notes } : c)),
      );
    },
    [setCampaigns],
  );

  const removeCampaign = useCallback(
    (id: string) => {
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    },
    [setCampaigns],
  );

  return {
    campaigns,
    addCampaign,
    updateStatus,
    updateNotes,
    removeCampaign,
  } as const;
}
