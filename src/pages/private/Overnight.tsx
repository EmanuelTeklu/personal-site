import { useState, type FormEvent } from "react";
import { useOvernight } from "@/hooks/useOvernight";
import { Moon, Plus, Clock, CheckCircle2, Loader2 } from "lucide-react";

const STATUS_ICONS: Record<string, React.ElementType> = {
  queued: Clock,
  running: Loader2,
  completed: CheckCircle2,
};

const STATUS_COLORS: Record<string, string> = {
  queued: "text-amber-400",
  running: "text-blue-400",
  completed: "text-emerald-400",
};

export function Overnight() {
  const { data: tasks, isLoading, error, addTask } = useOvernight();
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    addTask.mutate(
      { description: description.trim(), priority },
      {
        onSuccess: () => {
          setDescription("");
          setPriority("normal");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold flex items-center gap-2">
        <Moon size={20} className="text-violet-400" /> Overnight
      </h1>

      {/* Add Task Form */}
      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-zinc-400">Queue a Task</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what ClawdBot should do overnight..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-violet-500 transition-colors"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
          <button
            type="submit"
            disabled={addTask.isPending || !description.trim()}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={14} />
            Queue
          </button>
        </div>
      </form>

      {/* Task Queue */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-400">Task Queue</h3>
        </div>

        {isLoading ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">Loading queue...</p>
        ) : error ? (
          <div className="px-4 py-4">
            <p className="text-sm text-red-400">
              {error instanceof Error ? error.message : "Failed to load queue"}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Make sure the FastAPI server is running on localhost:8000
            </p>
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-600">
            No tasks in the queue. Add one above to run overnight.
          </p>
        ) : (
          <ul>
            {tasks.map((task, i) => {
              const StatusIcon = STATUS_ICONS[task.status] ?? Clock;
              const statusColor = STATUS_COLORS[task.status] ?? "text-zinc-500";
              return (
                <li key={`${task.description}-${i}`} className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50 last:border-b-0">
                  <StatusIcon size={16} className={statusColor} />
                  <span className="flex-1 text-sm text-zinc-200">{task.description}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{task.priority}</span>
                  <span className={`text-xs ${statusColor}`}>{task.status}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
