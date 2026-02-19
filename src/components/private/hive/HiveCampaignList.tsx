import { HiveCampaignCard } from "./HiveCampaignCard";
import type { HiveCampaign, HiveCampaignStatus } from "@/types/hive";

interface HiveCampaignListProps {
  readonly campaigns: readonly HiveCampaign[];
}

const STATUS_ORDER: readonly HiveCampaignStatus[] = [
  "active",
  "planning",
  "queued",
  "done",
];

const STATUS_HEADER: Record<HiveCampaignStatus, string> = {
  active: "Active Lanes",
  planning: "Planning",
  queued: "Queued",
  done: "Completed",
};

export function HiveCampaignList({ campaigns }: HiveCampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] px-5 py-8 text-center text-sm text-[var(--hive-fg-muted)]">
        No campaigns in this command view.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {STATUS_ORDER.map((status) => {
        const grouped = campaigns.filter((campaign) => campaign.status === status);
        if (grouped.length === 0) return null;

        return (
          <section key={status} className="space-y-3">
            <header className="flex items-center justify-between border-b border-[var(--hive-line)] pb-2">
              <h3 className="text-[11px] font-[var(--mono)] uppercase tracking-[0.2em] text-[var(--hive-fg-muted)]">
                {STATUS_HEADER[status]}
              </h3>
              <span className="text-[11px] font-[var(--mono)] text-[var(--hive-fg-dim)]">
                {grouped.length}
              </span>
            </header>
            <div className="space-y-3">
              {grouped.map((campaign) => (
                <HiveCampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
