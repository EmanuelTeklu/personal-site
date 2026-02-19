import { useLocalStorage } from "./useLocalStorage";
import { getDefaultContext } from "@/data/projects";
import type { ContextEntry, ContextType } from "@/types/task";

const STORAGE_KEY = "cc-context";

export function useContextEntries() {
  const [entries, setEntries] = useLocalStorage<ContextEntry[]>(STORAGE_KEY, getDefaultContext());

  const addEntry = (entry: { type: ContextType; text: string; project: string; subproject?: string }) => {
    const newEntry: ContextEntry = {
      id: crypto.randomUUID(),
      type: entry.type,
      text: entry.text.trim(),
      project: entry.project,
      subproject: entry.subproject,
      createdAt: Date.now(),
      resolved: false,
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const toggleResolved = (entryId: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, resolved: !e.resolved } : e,
      ),
    );
  };

  const removeEntry = (entryId: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  const compileContext = (filterProject: string): string => {
    const target = filterProject === "all" ? entries : entries.filter((e) => e.project === filterProject);
    const projectName = filterProject === "all" ? "All Projects" : filterProject;
    let output = `# Context: ${projectName}\n# Compiled ${new Date().toLocaleDateString()}\n\n`;

    const d = target.filter((e) => e.type === "decision");
    const b = target.filter((e) => e.type === "blocker" && !e.resolved);
    const n = target.filter((e) => e.type === "note");

    if (d.length) output += `## Decisions\n${d.map((e) => `- ${e.text}`).join("\n")}\n\n`;
    if (b.length) output += `## Open Blockers\n${b.map((e) => `- ${e.text}`).join("\n")}\n\n`;
    if (n.length) output += `## Notes\n${n.map((e) => `- ${e.text}`).join("\n")}\n\n`;

    return output;
  };

  return { entries, setEntries, addEntry, toggleResolved, removeEntry, compileContext } as const;
}
