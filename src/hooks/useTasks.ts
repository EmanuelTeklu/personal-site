import { useLocalStorage } from "./useLocalStorage";
import { getDefaultTasks } from "@/data/projects";
import type { Task, TaskStatus } from "@/types/task";

const STORAGE_KEY = "cc-tasks";

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEY, getDefaultTasks());

  const addTask = (task: Omit<Task, "id" | "createdAt" | "status">) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      status: "todo",
      createdAt: Date.now(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const cycleStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: NEXT_STATUS[t.status] } : t,
      ),
    );
  };

  const removeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  return { tasks, setTasks, addTask, cycleStatus, removeTask } as const;
}
