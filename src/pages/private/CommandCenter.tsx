import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useContextEntries } from "@/hooks/useContextEntries";
import { TaskFilter } from "@/components/private/tasks/TaskFilter";
import { TaskForm } from "@/components/private/tasks/TaskForm";
import { TaskList } from "@/components/private/tasks/TaskList";
import { ContextPanel } from "@/components/private/context/ContextPanel";
import { StreamTab } from "@/components/private/stream/StreamTab";
import type { TaskStatus } from "@/types/task";

type View = "tasks" | "context" | "stream";

export function CommandCenter() {
  const { tasks, addTask, cycleStatus, removeTask } = useTasks();
  const { entries, addEntry, toggleResolved, removeEntry, compileContext } =
    useContextEntries();
  const [view, setView] = useState<View>("tasks");
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in_progress",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Command Center</h1>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setView("tasks")}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              view === "tasks"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setView("context")}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              view === "context"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Context
          </button>
          <button
            onClick={() => setView("stream")}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              view === "stream"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Stream
          </button>
        </div>
      </div>

      {view === "tasks" && (
        <div className="space-y-6">
          <TaskFilter
            filter={filter}
            onChange={setFilter}
            totalTasks={totalTasks}
            inProgressTasks={inProgressTasks}
            doneTasks={doneTasks}
          />
          <TaskForm onAdd={addTask} />
          <TaskList
            tasks={tasks}
            filter={filter}
            onCycleStatus={cycleStatus}
            onRemove={removeTask}
          />
        </div>
      )}
      {view === "context" && (
        <ContextPanel
          entries={entries}
          onAdd={addEntry}
          onToggleResolved={toggleResolved}
          onRemove={removeEntry}
          onCompile={compileContext}
        />
      )}
      {view === "stream" && <StreamTab />}
    </div>
  );
}
