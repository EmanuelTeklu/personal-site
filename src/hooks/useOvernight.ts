import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface OvernightTask {
  readonly description: string;
  readonly priority: string;
  readonly status: string;
}

export function useOvernight() {
  const queryClient = useQueryClient();

  const query = useQuery<readonly OvernightTask[]>({
    queryKey: ["overnight"],
    queryFn: () => apiFetch<OvernightTask[]>("/api/overnight"),
  });

  const addTask = useMutation({
    mutationFn: (task: { description: string; priority: string }) =>
      apiFetch("/api/overnight", {
        method: "POST",
        body: JSON.stringify(task),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["overnight"] });
    },
  });

  return { ...query, addTask };
}
