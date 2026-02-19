import { Line, LineChart, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DashboardMetric } from "@/data/dashboard";

function TrendIcon({ direction }: { readonly direction: "up" | "down" | "neutral" }) {
  if (direction === "up") return <TrendingUp size={12} />;
  if (direction === "down") return <TrendingDown size={12} />;
  return <Minus size={12} />;
}

function trendColor(direction: "up" | "down" | "neutral"): string {
  if (direction === "up") return "text-[var(--hive-green-mid)]";
  if (direction === "down") return "text-[var(--hive-fg-dim)]";
  return "text-[var(--hive-fg-muted)]";
}

function MetricCard({ metric }: { readonly metric: DashboardMetric }) {
  return (
    <article className="relative overflow-hidden rounded-[var(--hive-radius-lg)] border border-[var(--hive-card-border)] bg-[var(--hive-card-bg)] p-5">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
        {metric.label}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p
          className="text-[36px] leading-none tracking-tight text-[var(--hive-fg-strong)]"
          style={{ fontFamily: "var(--mono)", fontWeight: 500 }}
        >
          {metric.value}
        </p>

        <div className="h-10 w-16 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[...metric.sparkline]} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
              <Line
                type="monotone"
                dataKey="y"
                dot={false}
                stroke="var(--hive-green-mid)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`mt-3 flex items-center gap-1.5 text-[12px] ${trendColor(metric.trend.direction)}`}>
        <TrendIcon direction={metric.trend.direction} />
        <span>{metric.trend.text}</span>
      </div>
    </article>
  );
}

export function MetricsRow({ metrics }: { readonly metrics: readonly DashboardMetric[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}
