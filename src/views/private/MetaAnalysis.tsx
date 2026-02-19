import { useTasks } from "@/hooks/useTasks";
import { useContextEntries } from "@/hooks/useContextEntries";
import { PROJECTS } from "@/data/projects";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  BarChart3,
  AlertTriangle,
  Clock,
  Lock,
  Zap,
  FolderOpen,
  Brain,
  Briefcase,
} from "lucide-react";

function ProjectIcon({ icon, color }: { icon: string; color: string }) {
  const Icon = icon === "brain" ? Brain : Briefcase;
  return <Icon size={20} style={{ color }} />;
}

export function MetaAnalysis() {
  const { tasks } = useTasks();
  const { entries } = useContextEntries();

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const staleTasks = tasks.filter((t) => t.status === "todo" && Date.now() - t.createdAt > 3 * 86400000);
  const unresolvedBlockers = entries.filter((e) => e.type === "blocker" && !e.resolved);
  const tasksWithSpecs = tasks.filter((t) => t.spec);
  const tasksWithVerify = tasks.filter((t) => t.verify);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Meta Analysis</h1>

      {/* Overall Health */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <BarChart3 size={14} className="text-violet-400" /> Overall Health
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-zinc-500">Completion</p>
            <p className="text-xl font-bold">{totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0}%</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Spec Coverage</p>
            <p className="text-xl font-bold text-violet-400">{totalTasks ? Math.round((tasksWithSpecs.length / totalTasks) * 100) : 0}%</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Verify Coverage</p>
            <p className="text-xl font-bold text-emerald-400">{totalTasks ? Math.round((tasksWithVerify.length / totalTasks) * 100) : 0}%</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Context Entries</p>
            <p className="text-xl font-bold text-blue-400">{entries.length}</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(staleTasks.length > 0 || unresolvedBlockers.length > 0) && (
        <div className="bg-zinc-900 border border-amber-800/30 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-medium text-amber-400 flex items-center gap-2">
            <AlertTriangle size={14} /> Needs Attention
          </h3>
          {unresolvedBlockers.map((b) => (
            <div key={b.id} className="flex items-start gap-2 text-sm">
              <Lock size={14} className="text-red-400 mt-0.5 shrink-0" />
              <span className="text-zinc-300">{b.text}</span>
            </div>
          ))}
          {staleTasks.map((t) => (
            <div key={t.id} className="flex items-start gap-2 text-sm">
              <Clock size={14} className="text-amber-400 mt-0.5 shrink-0" />
              <span className="text-zinc-300">Stale: {t.title}</span>
              <span className="text-xs text-zinc-500 ml-1">{Math.round((Date.now() - t.createdAt) / 86400000)}d</span>
            </div>
          ))}
        </div>
      )}

      {/* Per-Project Breakdown */}
      {PROJECTS.map((project) => {
        const pTasks = tasks.filter((t) => t.project === project.id);
        const pDone = pTasks.filter((t) => t.status === "done").length;
        const pInProgress = pTasks.filter((t) => t.status === "in_progress").length;
        const pBlockers = entries.filter((e) => e.project === project.id && e.type === "blocker" && !e.resolved).length;
        const pContext = entries.filter((e) => e.project === project.id).length;

        return (
          <div key={project.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <ProjectIcon icon={project.icon} color={project.color} />
              <h3 className="font-medium">{project.name}</h3>
              <span className="text-xs text-zinc-500 ml-auto">{pDone}/{pTasks.length} tasks</span>
            </div>
            <ProgressBar value={pDone} max={pTasks.length} color={project.color} />
            <div className="grid grid-cols-4 gap-3 text-center">
              <div><p className="text-lg font-bold">{pTasks.length}</p><p className="text-xs text-zinc-500">Total</p></div>
              <div><p className="text-lg font-bold text-amber-400">{pInProgress}</p><p className="text-xs text-zinc-500">Active</p></div>
              <div><p className="text-lg font-bold text-red-400">{pBlockers}</p><p className="text-xs text-zinc-500">Blockers</p></div>
              <div><p className="text-lg font-bold text-blue-400">{pContext}</p><p className="text-xs text-zinc-500">Context</p></div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-zinc-500">Subprojects</h4>
              {project.subprojects.map((sub) => {
                const sTasks = pTasks.filter((t) => t.subproject === sub.name);
                const sDone = sTasks.filter((t) => t.status === "done").length;
                return (
                  <div key={sub.name} className="flex items-center gap-3">
                    <FolderOpen size={12} style={{ color: project.color }} />
                    <span className="text-sm text-zinc-300 flex-1">{sub.name}</span>
                    <span className="text-xs text-zinc-500">{sDone}/{sTasks.length}</span>
                    <div className="w-24"><ProgressBar value={sDone} max={sTasks.length} color={project.color} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* GSD Quality Score */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <Zap size={14} className="text-violet-400" /> GSD Quality Score
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Tasks with specs</span>
            <span className="text-zinc-300">{tasksWithSpecs.length}/{totalTasks}</span>
          </div>
          <ProgressBar value={tasksWithSpecs.length} max={totalTasks} color="#a78bfa" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Tasks with verification</span>
            <span className="text-zinc-300">{tasksWithVerify.length}/{totalTasks}</span>
          </div>
          <ProgressBar value={tasksWithVerify.length} max={totalTasks} color="#34d399" />
        </div>
      </div>
    </div>
  );
}
