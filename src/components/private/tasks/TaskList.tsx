import { useState } from "react";
import {
  Circle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Trash2,
  FolderOpen,
  Brain,
  Briefcase,
} from "lucide-react";
import { PROJECTS } from "@/data/projects";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Task, TaskStatus } from "@/types/task";

const STATUS_CONFIG = {
  todo: { icon: Circle, label: "To Do", color: "text-zinc-500" },
  in_progress: { icon: Clock, label: "In Progress", color: "text-amber-400" },
  done: { icon: CheckCircle2, label: "Done", color: "text-emerald-400" },
} as const;

interface TaskListProps {
  readonly tasks: readonly Task[];
  readonly filter: "all" | TaskStatus;
  readonly onCycleStatus: (id: string) => void;
  readonly onRemove: (id: string) => void;
}

function ProjectIcon({ icon, color }: { icon: string; color: string }) {
  const Icon = icon === "brain" ? Brain : Briefcase;
  return <Icon size={20} style={{ color }} />;
}

export function TaskList({ tasks, filter, onCycleStatus, onRemove }: TaskListProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(PROJECTS.map((p) => p.id)),
  );
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const filteredTasks = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const toggleProject = (id: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTask = (id: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {PROJECTS.map((project) => {
        const projectTasks = filteredTasks.filter((t) => t.project === project.id);
        const allProjectTasks = tasks.filter((t) => t.project === project.id);
        const projectDone = allProjectTasks.filter((t) => t.status === "done").length;
        const isExpanded = expandedProjects.has(project.id);

        return (
          <div key={project.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleProject(project.id)}
              className="w-full flex items-center gap-3 p-4 hover:bg-zinc-800/50 transition-colors text-left"
            >
              {isExpanded ? <ChevronDown size={16} className="text-zinc-500" /> : <ChevronRight size={16} className="text-zinc-500" />}
              <ProjectIcon icon={project.icon} color={project.color} />
              <div className="flex-1">
                <h2 className="font-semibold">{project.name}</h2>
                <p className="text-sm text-zinc-500">{project.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-500">{projectDone}/{allProjectTasks.length}</span>
                <div className="w-20 hidden sm:block">
                  <ProgressBar value={projectDone} max={allProjectTasks.length} color={project.color} />
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-zinc-800">
                <div className="px-4 py-3 flex gap-2 flex-wrap border-b border-zinc-800/50">
                  {project.subprojects.map((sub) => (
                    <span
                      key={sub.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-zinc-700 text-zinc-300"
                      title={sub.description}
                    >
                      <FolderOpen size={12} style={{ color: project.color }} />
                      {sub.name}
                    </span>
                  ))}
                </div>

                {projectTasks.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-zinc-600">
                    No tasks {filter !== "all" ? `with status "${STATUS_CONFIG[filter as TaskStatus].label}"` : "yet"}
                  </p>
                ) : (
                  <ul>
                    {projectTasks.map((task) => {
                      const StatusIcon = STATUS_CONFIG[task.status].icon;
                      const isTaskExpanded = expandedTasks.has(task.id);
                      const hasDetails = task.spec || task.verify;
                      return (
                        <li key={task.id} className="border-b border-zinc-800/50 last:border-b-0">
                          <div className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/30 transition-colors group">
                            <button
                              onClick={() => onCycleStatus(task.id)}
                              className={`${STATUS_CONFIG[task.status].color} hover:scale-110 transition-transform`}
                            >
                              <StatusIcon size={18} />
                            </button>
                            <button
                              onClick={() => hasDetails && toggleTask(task.id)}
                              className={`flex-1 text-left text-sm ${task.status === "done" ? "line-through text-zinc-500" : ""} ${hasDetails ? "cursor-pointer" : ""}`}
                            >
                              {task.title}
                            </button>
                            {task.phase && (
                              <span className="text-xs px-2 py-0.5 rounded bg-violet-900/30 text-violet-300 hidden sm:inline">
                                {task.phase}
                              </span>
                            )}
                            {task.subproject && (
                              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                {task.subproject}
                              </span>
                            )}
                            {hasDetails && (
                              <button onClick={() => toggleTask(task.id)} className="text-zinc-600 hover:text-zinc-300">
                                {isTaskExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                            )}
                            <button
                              onClick={() => onRemove(task.id)}
                              className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {isTaskExpanded && hasDetails && (
                            <div className="px-12 pb-3 space-y-2">
                              {task.spec && (
                                <div className="flex items-start gap-2 text-xs">
                                  <span className="text-violet-400 font-medium shrink-0">SPEC:</span>
                                  <span className="text-zinc-400">{task.spec}</span>
                                </div>
                              )}
                              {task.verify && (
                                <div className="flex items-start gap-2 text-xs">
                                  <span className="text-emerald-400 font-medium shrink-0">VERIFY:</span>
                                  <span className="text-zinc-400">{task.verify}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
