import { useState } from "react";
import { useResearchList, useResearchDetail } from "@/hooks/useResearch";
import { FileText, ArrowLeft, Clock } from "lucide-react";

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Research() {
  const { data: briefs, isLoading, error } = useResearchList();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const { data: detail, isLoading: detailLoading } = useResearchDetail(selectedSlug);

  if (selectedSlug && detail) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedSlug(null)}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft size={16} /> Back to briefs
        </button>
        <h1 className="text-xl font-semibold">{detail.name}</h1>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="prose prose-invert prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-sans leading-relaxed">
              {detail.content}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (selectedSlug && detailLoading) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedSlug(null)}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft size={16} /> Back to briefs
        </button>
        <p className="text-sm text-zinc-500">Loading brief...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold flex items-center gap-2">
        <FileText size={20} className="text-violet-400" /> Research
      </h1>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading briefs...</p>
      ) : error ? (
        <div className="bg-zinc-900 border border-red-800/30 rounded-xl p-4">
          <p className="text-sm text-red-400">
            {error instanceof Error ? error.message : "Failed to load research briefs"}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Make sure the FastAPI server is running on localhost:8000
          </p>
        </div>
      ) : !briefs || briefs.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <p className="text-sm text-zinc-500">No research briefs yet.</p>
          <p className="text-xs text-zinc-600 mt-1">
            ClawdBot generates these during overnight runs.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {briefs.map((brief) => (
            <button
              key={brief.slug}
              onClick={() => setSelectedSlug(brief.slug)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-violet-400 group-hover:text-violet-300" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100">
                    {brief.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={12} className="text-zinc-600" />
                    <span className="text-xs text-zinc-500">{formatDate(brief.modified)}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
