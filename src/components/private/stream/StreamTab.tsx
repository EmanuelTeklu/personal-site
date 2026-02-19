import { useState } from "react";
import { useSignals } from "@/hooks/useSignals";
import { useStreamEntries } from "@/hooks/useStreamEntries";
import { StreamCompose } from "@/components/private/stream/StreamCompose";

function formatCommitDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function StreamTab() {
  const { data, isLoading } = useSignals();
  const { addEntry } = useStreamEntries();
  const [seed, setSeed] = useState<string>("");

  const commits = data?.commits ?? [];

  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* Left: signal feed */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-zinc-500 tracking-widest uppercase">
            Recent Activity
          </span>
          <button
            onClick={() => setSeed("")}
            className="font-mono text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            free write
          </button>
        </div>

        {isLoading && (
          <p className="font-mono text-xs text-zinc-500">loading signals...</p>
        )}

        {commits.map((commit) => (
          <button
            key={`${commit.repo}-${commit.hash}`}
            onClick={() => setSeed(commit.seed)}
            className={`text-left p-3 rounded border transition-colors ${
              seed === commit.seed
                ? "border-violet-500 bg-violet-500/10"
                : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-violet-400 truncate">
                {commit.repo}
              </span>
              <span className="font-mono text-xs text-zinc-600 flex-shrink-0">
                {commit.hash}
              </span>
            </div>
            <p className="font-sans text-xs text-zinc-300 leading-relaxed line-clamp-2">
              {commit.message}
            </p>
            <span className="font-mono text-xs text-zinc-600 mt-1 block">
              {formatCommitDate(commit.date)}
            </span>
          </button>
        ))}

        {!isLoading && commits.length === 0 && (
          <p className="font-mono text-xs text-zinc-500">
            No activity in the last 7 days.
          </p>
        )}
      </div>

      {/* Right: compose */}
      <div className="flex-1 min-w-0">
        <div className="mb-3">
          <span className="font-mono text-xs text-zinc-500 tracking-widest uppercase">
            Compose
          </span>
          {seed && (
            <span className="font-mono text-xs text-zinc-600 ml-3">
              seeded from activity
            </span>
          )}
        </div>
        <StreamCompose
          key={seed}
          initialContent={seed}
          onPublish={async (content, tags) => {
            const { error } = await addEntry(content, tags);
            if (!error) setSeed("");
            return error;
          }}
        />
      </div>
    </div>
  );
}
