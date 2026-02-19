export type TaskStatus = "todo" | "in_progress" | "done";
export type ContextType = "decision" | "blocker" | "note";

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly status: TaskStatus;
  readonly project: string;
  readonly subproject?: string;
  readonly phase?: string;
  readonly spec?: string;
  readonly verify?: string;
  readonly createdAt: number;
}

export interface ContextEntry {
  readonly id: string;
  readonly type: ContextType;
  readonly text: string;
  readonly project: string;
  readonly subproject?: string;
  readonly createdAt: number;
  readonly resolved?: boolean;
}
