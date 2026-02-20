import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/ui/PageShell";
import { TasteTerminal } from "@/components/ui/TasteTerminal";
import { DesignArena } from "@/components/ui/DesignArena";
import { apiFetch } from "@/lib/api";

type DesignOption = {
  id: string;
  image_url: string;
  style_category: string;
  confidence_score: number;
  metadata?: { style_description?: string };
};

export function TasteTuner() {
  const [session, setSession] = useState<{ id: string } | null>(null);
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState<DesignOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [mode, setMode] = useState<"terminal" | "arena" | "result">("terminal");
  const [initialPrompt, setInitialPrompt] = useState("");

  const startSession = async (prompt: string) => {
    setLoading(true);
    setInitialPrompt(prompt);
    try {
      const { session_id } = await apiFetch<{ session_id: string }>("/api/taste/start", {
        method: "POST",
        body: JSON.stringify({ initial_prompt: prompt }),
      });
      setSession({ id: session_id });
      
      const roundData = await apiFetch<{ options: DesignOption[] }>("/api/taste/round", {
        method: "POST",
        body: JSON.stringify({ session_id, prompt, round_number: 1 }),
      });
      
      setOptions(roundData.options);
      setRound(1);
      setMode("arena");
    } catch (e) {
      console.error("Session Start Failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const selectDesign = async (option: DesignOption) => {
    if (!session) return;
    setLoading(true);
    const newHistory = [...history, option.style_category];
    setHistory(newHistory);
    
    try {
      if (round < 12) {
        // Submit selection and get next round in one go (or separate calls)
        await apiFetch("/api/taste/select", {
          method: "POST",
          body: JSON.stringify({
            session_id: session.id,
            selected_option_id: option.id,
            round_number: round,
            history: newHistory
          }),
        });

        const nextRound = await apiFetch<{ options: DesignOption[] }>("/api/taste/round", {
          method: "POST",
          body: JSON.stringify({
            session_id: session.id,
            prompt: initialPrompt,
            round_number: round + 1,
          }),
        });
        
        setOptions(nextRound.options);
        setRound(prev => prev + 1);
      } else {
        setMode("result");
      }
    } catch (e) {
      console.error("Selection update failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Taste Tuner Prototype">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Advanced Progress Bar */}
        {mode !== "terminal" && (
          <div className="mb-12">
            <div className="flex justify-between items-end mb-4">
              <div className="space-y-1">
                <span className="text-[0.65rem] font-mono text-amber-500/80 uppercase tracking-widest block">
                  Iterative Refinement Loop
                </span>
                <h3 className="text-xl font-serif text-zinc-100">
                  {mode === "result" ? "Aesthetic Result Converged" : `Round ${round} of 12`}
                </h3>
              </div>
              <div className="text-right font-mono text-xs text-zinc-500">
                Confidence: {(0.6 + (round * 0.03)).toFixed(2)}
              </div>
            </div>
            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${(round / 12) * 100}%` }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === "terminal" && (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TasteTerminal onStart={startSession} loading={loading} />
            </motion.div>
          )}

          {mode === "arena" && (
            <motion.div
              key="arena"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="text-center max-w-2xl mx-auto mb-12">
                <p className="text-zinc-400 font-sans leading-relaxed">
                  Select the direction that resonates most. The agent is analyzing your preference 
                  for density, contrast, and typographic hierarchy.
                </p>
              </div>
              <DesignArena 
                options={options} 
                onSelect={selectDesign} 
                loading={loading} 
              />
            </motion.div>
          )}

          {mode === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 space-y-8"
            >
              <div className="inline-block p-4 rounded-full bg-amber-500/10 mb-4">
                <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center">
                  <span className="text-black text-2xl font-bold">✦</span>
                </div>
              </div>
              <h2 className="text-4xl font-serif text-white">Your Aesthetic DNA is Set</h2>
              <p className="text-zinc-400 max-w-xl mx-auto">
                Based on your selections, we've identified <strong>{history[history.length -1]}</strong> as your primary design world. 
                Generating your custom UI framework template now...
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-zinc-100 text-black font-mono text-sm hover:bg-white transition-colors"
              >
                RESTART TUNER
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
