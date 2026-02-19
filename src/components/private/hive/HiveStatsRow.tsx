import { Line, LineChart, ResponsiveContainer } from "recharts";
import type { HiveStat } from "@/types/hive";

interface HiveStatsRowProps {
  readonly stats: readonly HiveStat[];
}

function formatValue(value: number, unit?: string): string {
  if (unit === "$/hr") return `$${value.toFixed(2)}/hr`;
  if (unit === "tok") {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  }
  if (unit === "loc") return value.toLocaleString();
  if (value >= 1_000) return value.toLocaleString();
  return String(value);
}

function StatCard({ stat }: { readonly stat: HiveStat }) {
  const isAccent = !!stat.accent;

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        isAccent
          ? "border-[var(--hive-green-deep)] bg-[var(--hive-green-deep)] text-white"
          : "border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] text-[var(--hive-fg)]"
      }`}
    >
      {isAccent && (
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(var(--hive-grid-tint) 1px, transparent 1px), linear-gradient(90deg, var(--hive-grid-tint) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
      )}

      <div className="relative space-y-4">
        <div className="space-y-2">
          <p
            className={`text-[11px] uppercase tracking-[0.18em] font-[var(--mono)] ${
              isAccent ? "text-white/70" : "text-[var(--hive-fg-muted)]"
            }`}
          >
            {stat.label}
          </p>
          <p className="text-[2.35rem] leading-none font-[300]">
            {formatValue(stat.value, stat.unit)}
          </p>
        </div>

        <div
          className="h-10 w-full rounded-lg"
          style={{
            backgroundColor: isAccent ? "var(--hive-grid-tint)" : "var(--hive-spark-bg)",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stat.sparkline} margin={{ top: 6, right: 4, left: 4, bottom: 6 }}>
              <Line
                type="monotone"
                dataKey="y"
                dot={false}
                stroke={isAccent ? "var(--hive-card-bg)" : "var(--hive-green-mid)"}
                strokeWidth={1.8}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between gap-3 text-[11px] font-[var(--mono)]">
          <span className={isAccent ? "text-white/75" : "text-[var(--hive-green-mid)]"}>
            {stat.trendLabel}
          </span>
          <span
            className={`truncate ${
              isAccent ? "text-white/70" : "text-[var(--hive-fg-muted)]"
            }`}
          >
            {stat.context}
          </span>
        </div>
      </div>
    </article>
  );
}

export function HiveStatsRow({ stats }: HiveStatsRowProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </section>
  );
}
