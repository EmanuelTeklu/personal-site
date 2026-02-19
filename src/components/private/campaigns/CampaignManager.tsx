import { useState } from "react";
import {
  Plus,
  Trash2,
  PlayCircle,
  PauseCircle,
  StopCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import type { CampaignStatus } from "@/hooks/useCampaigns";

const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; color: string; dot: string }
> = {
  draft: { label: "Draft", color: "text-zinc-400", dot: "bg-zinc-600" },
  active: { label: "Active", color: "text-emerald-400", dot: "bg-emerald-500" },
  paused: { label: "Paused", color: "text-amber-400", dot: "bg-amber-500" },
  ended: { label: "Ended", color: "text-rose-400", dot: "bg-rose-500" },
};

const NEXT_STATUS: Partial<Record<CampaignStatus, CampaignStatus>> = {
  draft: "active",
  active: "paused",
  paused: "active",
};

export function CampaignManager() {
  const { campaigns, addCampaign, updateStatus, updateNotes, removeCampaign } =
    useCampaigns();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", goal: "" });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingNotes, setEditingNotes] = useState<string | null>(null);

  const total = campaigns.length;
  const active = campaigns.filter((c) => c.status === "active").length;
  const drafts = campaigns.filter((c) => c.status === "draft").length;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addCampaign({ name: form.name, goal: form.goal });
    setForm({ name: "", goal: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-500">Total</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-emerald-400/70">Active</p>
          <p className="text-2xl font-bold text-emerald-400">{active}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-400/70">Drafts</p>
          <p className="text-2xl font-bold text-zinc-400">{drafts}</p>
        </div>
      </div>

      {/* Add Campaign form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-zinc-400 hover:text-violet-400 transition-colors"
          >
            <Plus size={16} /> New Campaign
          </button>
        ) : (
          <div className="space-y-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Campaign name..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-violet-500"
            />
            <textarea
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              placeholder="Goal / objective..."
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-violet-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
              >
                <Plus size={16} /> Add
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm({ name: "", goal: "" });
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Campaign list */}
      {campaigns.length === 0 && (
        <p className="text-center text-sm text-zinc-600 py-8">
          No campaigns yet.
        </p>
      )}

      <div className="space-y-3">
        {campaigns.map((c) => {
          const isExpanded = expanded.has(c.id);
          const cfg = STATUS_CONFIG[c.status];
          const nextStatus = NEXT_STATUS[c.status];

          return (
            <div
              key={c.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
            >
              {/* Header row */}
              <div className="flex items-center gap-3 p-4 hover:bg-zinc-800/30 transition-colors group">
                <button
                  onClick={() => toggleExpand(c.id)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  {c.goal && (
                    <p className="text-xs text-zinc-500 truncate">{c.goal}</p>
                  )}
                </div>

                <span className={`text-xs font-medium ${cfg.color}`}>
                  {cfg.label}
                </span>

                {nextStatus && (
                  <button
                    onClick={() => updateStatus(c.id, nextStatus)}
                    className="text-zinc-500 hover:text-violet-400 transition-colors"
                    title={
                      nextStatus === "active" ? "Launch / Resume" : "Pause"
                    }
                  >
                    {nextStatus === "active" ? (
                      <PlayCircle size={16} />
                    ) : (
                      <PauseCircle size={16} />
                    )}
                  </button>
                )}

                {(c.status === "active" || c.status === "paused") && (
                  <button
                    onClick={() => updateStatus(c.id, "ended")}
                    className="text-zinc-600 hover:text-rose-400 transition-colors"
                    title="End campaign"
                  >
                    <StopCircle size={16} />
                  </button>
                )}

                {(c.status === "draft" || c.status === "ended") && (
                  <button
                    onClick={() => removeCampaign(c.id)}
                    className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-zinc-800 px-4 py-3 space-y-3">
                  <div className="flex gap-4 text-xs text-zinc-500">
                    <span>
                      Created {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                    {c.launchedAt && (
                      <span>
                        Launched {new Date(c.launchedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {editingNotes === c.id ? (
                    <textarea
                      defaultValue={c.notes}
                      rows={4}
                      autoFocus
                      onBlur={(e) => {
                        updateNotes(c.id, e.target.value);
                        setEditingNotes(null);
                      }}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-violet-500 resize-none"
                    />
                  ) : (
                    <button
                      onClick={() => setEditingNotes(c.id)}
                      className="w-full text-left text-sm text-zinc-500 hover:text-zinc-300 transition-colors min-h-[2rem]"
                    >
                      {c.notes || (
                        <span className="italic">Add notes...</span>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}