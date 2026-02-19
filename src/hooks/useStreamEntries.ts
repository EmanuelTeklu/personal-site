import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface StreamEntry {
  readonly id: string;
  readonly content: string;
  readonly tags: readonly string[];
  readonly created_at: string;
}

export function useStreamEntries() {
  const [entries, setEntries] = useState<readonly StreamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!supabase) {
      // Fall back to static data when Supabase not configured
      const { STREAM_ENTRIES } = await import("@/data/stream");
      setEntries(
        STREAM_ENTRIES.map((e) => ({
          id: e.id,
          content: e.content,
          tags: e.tags ?? [],
          created_at: new Date(e.date).toISOString(),
        }))
      );
      setLoading(false);
      return;
    }
    const { data, error: err } = await supabase
      .from("stream_entries")
      .select("id, content, tags, created_at")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setEntries(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  const addEntry = useCallback(
    async (content: string, tags: string[]) => {
      if (!supabase) {
        setEntries((prev) => [
          { id: crypto.randomUUID(), content, tags, created_at: new Date().toISOString() },
          ...prev,
        ]);
        return { error: null };
      }
      const { error: err } = await supabase
        .from("stream_entries")
        .insert({ content, tags });
      if (!err) await fetchEntries();
      return { error: err?.message ?? null };
    },
    [fetchEntries],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (!supabase) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        return;
      }
      await supabase.from("stream_entries").delete().eq("id", id);
      await fetchEntries();
    },
    [fetchEntries],
  );

  return { entries, loading, error, addEntry, deleteEntry, refetch: fetchEntries };
}
