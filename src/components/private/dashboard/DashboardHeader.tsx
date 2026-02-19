import { Bell, Command, Rocket } from "lucide-react";

interface DashboardHeaderProps {
  readonly title: string;
  readonly subtitle: string;
  readonly onLaunchCampaign?: () => void;
}

export function DashboardHeader({ title, subtitle, onLaunchCampaign }: DashboardHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1
          className="text-[28px] tracking-tight text-[var(--hive-fg-strong)]"
          style={{ fontWeight: 300 }}
        >
          {title}
        </h1>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {onLaunchCampaign && (
          <button
            onClick={onLaunchCampaign}
            className="flex items-center gap-1.5 rounded-[4px] bg-[var(--hive-green-deep)] px-3 py-2 text-[12px] text-white transition-colors hover:bg-[var(--hive-green-mid)]"
          >
            <Rocket size={14} />
            Launch Campaign
          </button>
        )}

        <button className="flex items-center gap-1.5 rounded-[4px] border border-[var(--hive-card-border)] px-2.5 py-2 text-[12px] text-[var(--hive-fg-dim)] transition-colors hover:bg-[var(--hive-bg-soft)]">
          <Command size={12} />K
        </button>

        <button className="relative rounded-[4px] border border-[var(--hive-card-border)] p-2 text-[var(--hive-fg-dim)] transition-colors hover:bg-[var(--hive-bg-soft)]">
          <Bell size={16} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white" style={{ fontFamily: "var(--mono)" }}>
            3
          </span>
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--hive-green-deep)] text-[12px] text-white" style={{ fontWeight: 500 }}>
          ET
        </div>
      </div>
    </header>
  );
}
