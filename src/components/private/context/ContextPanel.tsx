import { useState } from "react";
import {
  Lightbulb,
  AlertTriangle,
  FileText,
  Circle,
  CheckCircle2,
  Trash2,
  Copy,
} from "lucide-react";
import { PROJECTS } from "@/data/projects";
import type { ContextEntry, ContextType } from "@/types/task";

const CONTEXT_CONFIG: Record<ContextType, { icon: typeof Lightbulb; label: string; color: string }> = {
  decision: { icon: Lightbulb, label: "Decision", color: "text-violet-400" },
  blocker: { icon: AlertTriangle, label: "Blocker", color: "text-red-400" },
  note: { icon: FileText, label: "Note", color: "text-blue-400" },
};

interface ContextPanelProps {
  readonly entries: readonly ContextEntry[];
  readonly onAdd: (entry: { type: ContextType; text: string; project: string; subproject?: string }) => void;
  readonly onToggleResolved: (id: string) => void;
  readonly onRemove: (id: string) => void;
  readonly onCompile: (filterProject: string) => string;
}

export function ContextPanel({ entries, onAdd, onToggleResolved, onRemove, onCompile }: ContextPanelProps) {
  const [newEntry, setNewEntry] = useState({ type: "note" as ContextType, text: "", project: PROJECTS[0].id, subproject: "" });
  const [filterProject, setFilterProject] = useState("all");
  const [copied, setCopied] = useState(false);

  const selectedSubs = PROJECTS.find((p) => p.id === newEntry.project)?.subprojects ?? [];
  const filtered = filterProject === "all" ? entries : entries.filter((e) => e.project === filterProject);
  const decisions = filtered.filter((e) => e.type === "decision");
  const blockers = filtered.filter((e) => e.type === "blocker");
  const notes = filtered.filter((e) => e.type === "note");

  const handleAdd = () => {
    if (!newEntry.text.trim()) return;
    onAdd({
      type: newEntry.type,
      text: newEntry.text.trim(),
      project: newEntry.project,
      subproject: newEntry.subproject || undefined,
    });
    setNewEntry({ ...newEntry, text: "" });
  };

  const handleCompile = () => {
    const output = onCompile(filterProject);
    void navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderSection = (title: string, items: readonly ContextEntry[], type: ContextType) => {
    const cfg = CONTEXT_CONFIG[type];
    const Icon = cfg.icon;
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-3 border-b border-zinc-800">
          <Icon size={14} className={cfg.color} />
          <h3 className="text-sm font-medium">{title}</h3>
          <span className="text-xs text-zinc-500 ml-auto">{items.length}</span>
        </div>
        {items.length === 0 ? (
          <p className="px-4 py-4 text-xs text-zinc-600 text-center">No {title.toLowerCase()} yet</p>
        ) : (
          <ul>
            {items.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 px-4 py-3 border-b border-zinc-800/50 last:border-b-0 group hover:bg-zinc-800/30">
                {type === "blocker" && (
                  <button
                    onClick={() => onToggleResolved(entry.id)}
                    className={entry.resolved ? "text-emerald-400" : "text-zinc-500"}
                  >
                    {entry.resolved ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${entry.resolved ? "line-through text-zinc-500" : ""}`}>{entry.text}</p>
                  <div className="flex gap-2 mt-1">
                    {entry.subproject && <span className="text-xs text-zinc-500">{entry.subproject}</span>}
                    <span className="text-xs text-zinc-600">{new Date(entry.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(entry.id)}
                  className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header + Compile */}
      <div className="flex items-center gap-3">
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-300 outline-none"
        >
          <option value="all">All Projects</option>
          {PROJECTS.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button
          onClick={handleCompile}
          className="ml-auto bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors border border-zinc-700"
        >
          <Copy size={14} /> {copied ? "Copied!" : "Compile Context"}
        </button>
      </div>

      {/* Add Entry */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex gap-2">
          {(["decision", "blocker", "note"] as const).map((t) => {
            const cfg = CONTEXT_CONFIG[t];
            const Icon = cfg.icon;
            return (
              <button
                key={t}
                onClick={() => setNewEntry({ ...newEntry, type: t })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  newEntry.type === t ? "bg-zinc-700 text-zinc-100" : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon size={12} /> {cfg.label}
              </button>
            );
          })}
        </div>
        <textarea
          value={newEntry.text}
          onChange={(e) => setNewEntry({ ...newEntry, text: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleAdd(); }}
          placeholder={`Add a ${CONTEXT_CONFIG[newEntry.type].label.toLowerCase()}...`}
          rows={2}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none resize-none"
        />
        <div className="flex gap-2">
          <select
            value={newEntry.project}
            onChange={(e) => setNewEntry({ ...newEntry, project: e.target.value, subproject: "" })}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none"
          >
            {PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {selectedSubs.length > 0 && (
            <select
              value={newEntry.subproject}
              onChange={(e) => setNewEntry({ ...newEntry, subproject: e.target.value })}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none"
            >
              <option value="">General</option>
              {selectedSubs.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={handleAdd}
            className="ml-auto bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Sections */}
      {renderSection("Decisions", decisions, "decision")}
      {renderSection("Blockers", blockers, "blocker")}
      {renderSection("Notes", notes, "note")}
    </div>
  );
}
