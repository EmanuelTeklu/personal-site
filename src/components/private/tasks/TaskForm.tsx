import { useState } from "react";
import { Plus, HelpCircle, RefreshCw } from "lucide-react";
import { PROJECTS, GSD_QUESTIONS } from "@/data/projects";

interface TaskFormProps {
  readonly onAdd: (task: {
    title: string;
    project: string;
    subproject?: string;
    phase?: string;
    spec?: string;
    verify?: string;
  }) => void;
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [gsdQuestion, setGsdQuestion] = useState("");
  const [form, setForm] = useState({
    title: "",
    project: PROJECTS[0].id,
    subproject: "",
    phase: "",
    spec: "",
    verify: "",
  });

  const selectedSubs = PROJECTS.find((p) => p.id === form.project)?.subprojects ?? [];

  const promptGsd = () => {
    setGsdQuestion(GSD_QUESTIONS[Math.floor(Math.random() * GSD_QUESTIONS.length)]);
  };

  const handleAdd = () => {
    if (!form.title.trim()) return;
    onAdd({
      title: form.title.trim(),
      project: form.project,
      subproject: form.subproject || undefined,
      phase: form.phase || undefined,
      spec: form.spec || undefined,
      verify: form.verify || undefined,
    });
    setForm({ title: "", project: PROJECTS[0].id, subproject: "", phase: "", spec: "", verify: "" });
    setShowForm(false);
    setGsdQuestion("");
  };

  if (!showForm) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <button
          onClick={() => { setShowForm(true); promptGsd(); }}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-zinc-400 hover:text-violet-400 transition-colors"
        >
          <Plus size={16} /> Add Task (GSD)
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      {gsdQuestion && (
        <div className="flex items-start gap-2 p-3 bg-violet-950/30 border border-violet-800/30 rounded-lg">
          <HelpCircle size={16} className="text-violet-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-violet-300 font-medium">GSD asks:</p>
            <p className="text-sm text-violet-200">{gsdQuestion}</p>
          </div>
          <button onClick={promptGsd} className="ml-auto text-violet-400 hover:text-violet-300">
            <RefreshCw size={12} />
          </button>
        </div>
      )}

      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Task title..."
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-violet-500"
      />

      <div className="flex gap-2">
        <select
          value={form.project}
          onChange={(e) => setForm({ ...form, project: e.target.value, subproject: "" })}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-300 outline-none"
        >
          {PROJECTS.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {selectedSubs.length > 0 && (
          <select
            value={form.subproject}
            onChange={(e) => setForm({ ...form, subproject: e.target.value })}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-300 outline-none"
          >
            <option value="">No subproject</option>
            {selectedSubs.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        )}
        <input
          value={form.phase}
          onChange={(e) => setForm({ ...form, phase: e.target.value })}
          placeholder="Phase (optional)"
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none"
        />
      </div>

      <textarea
        value={form.spec}
        onChange={(e) => setForm({ ...form, spec: e.target.value })}
        placeholder="Spec: What needs to be built? (requirements)"
        rows={2}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-violet-500 resize-none"
      />

      <textarea
        value={form.verify}
        onChange={(e) => setForm({ ...form, verify: e.target.value })}
        placeholder="Verify: How to confirm it's done?"
        rows={2}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-emerald-500 resize-none"
      />

      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
        >
          <Plus size={16} /> Add
        </button>
        <button
          onClick={() => setShowForm(false)}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
