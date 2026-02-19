import type { TaskStatus } from "@/types/task";

const FILTERS = [
  { key: "all" as const, label: "All" },
  { key: "todo" as const, label: "To Do" },
  { key: "in_progress" as const, label: "In Progress" },
  { key: "done" as const, label: "Done" },
] as const;

interface TaskFilterProps {
  readonly filter: "all" | TaskStatus;
  readonly onChange: (filter: "all" | TaskStatus) => void;
  readonly totalTasks: number;
  readonly inProgressTasks: number;
  readonly doneTasks: number;
}

export function TaskFilter({ filter, onChange, totalTasks, inProgressTasks, doneTasks }: TaskFilterProps) {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-500">Total Tasks</p>
          <p className="text-2xl font-bold">{totalTasks}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-amber-400/70">In Progress</p>
          <p className="text-2xl font-bold text-amber-400">{inProgressTasks}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-emerald-400/70">Completed</p>
          <p className="text-2xl font-bold text-emerald-400">{doneTasks}</p>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-violet-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
