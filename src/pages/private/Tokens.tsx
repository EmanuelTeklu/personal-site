import { useTokens, type TokenPeriod } from "@/hooks/useTokens";
import { DollarSign, Zap, Clock, Calendar, RefreshCw } from "lucide-react";

function formatCost(usd: number): string {
  return `$${usd.toFixed(4)}`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function PeriodCard({
  label,
  icon: Icon,
  period,
}: {
  readonly label: string;
  readonly icon: React.ElementType;
  readonly period: TokenPeriod;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
      <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
        <Icon size={14} className="text-violet-400" /> {label}
      </h3>
      <p className="text-3xl font-bold text-zinc-100">{formatCost(period.cost_usd)}</p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-zinc-500">Input</p>
          <p className="text-zinc-300 font-medium">{formatTokens(period.input_tokens)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Output</p>
          <p className="text-zinc-300 font-medium">{formatTokens(period.output_tokens)}</p>
        </div>
      </div>
    </div>
  );
}

function SourceBreakdown({ sources }: { readonly sources: Readonly<Record<string, TokenPeriod>> }) {
  const entries = Object.entries(sources);
  if (entries.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">By Source</h3>
        <p className="text-sm text-zinc-600 text-center py-4">No source data yet</p>
      </div>
    );
  }

  const sorted = [...entries].sort(([, a], [, b]) => b.cost_usd - a.cost_usd);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">By Source</h3>
      <div className="space-y-3">
        {sorted.map(([source, period]) => (
          <div key={source} className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">{source}</span>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-zinc-500">{formatTokens(period.input_tokens + period.output_tokens)} tokens</span>
              <span className="text-zinc-100 font-medium">{formatCost(period.cost_usd)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Tokens() {
  const { data, isLoading, error, dataUpdatedAt } = useTokens();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Tokens</h1>
        <p className="text-sm text-zinc-500">Loading spend data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Tokens</h1>
        <div className="bg-zinc-900 border border-red-800/30 rounded-xl p-4">
          <p className="text-sm text-red-400">
            {error instanceof Error ? error.message : "Failed to load token data"}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Make sure the FastAPI server is running on localhost:8000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <DollarSign size={20} className="text-emerald-400" /> Tokens
        </h1>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <RefreshCw size={12} />
          <span>
            {dataUpdatedAt
              ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}`
              : "Auto-refreshes every 30s"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PeriodCard label="Today" icon={Clock} period={data.today} />
        <PeriodCard label="This Week" icon={Calendar} period={data.this_week} />
        <PeriodCard label="This Month" icon={Zap} period={data.this_month} />
      </div>

      <SourceBreakdown sources={data.by_source} />
    </div>
  );
}
