import { useState } from "react";
import { motion } from "framer-motion";

interface TasteTerminalProps {
  onStart: (prompt: string) => void;
  loading: boolean;
}

export function TasteTerminal({ onStart, loading }: TasteTerminalProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onStart(input);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 max-w-2xl px-4"
      >
        <h2 className="text-5xl md:text-7xl font-serif text-white tracking-tight leading-tight">
          Calibrate Your <br />
          <span className="text-amber-500 italic">Visual Intelligence</span>
        </h2>
        
        <p className="text-zinc-500 font-sans text-lg max-w-lg mx-auto leading-relaxed">
          Input a reference, a URL, or a vague feeling. Our agents will generate 4 archetypes. 
          Your choices will refine the algorithm.
        </p>

        <form onSubmit={handleSubmit} className="relative mt-12 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
             <span className="pl-6 text-amber-500 font-mono text-xl select-none">$</span>
             <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="rauno.me, minimalist sci-fi, swiss grid..."
                autoFocus
                disabled={loading}
                className="w-full bg-transparent px-4 py-6 text-xl font-mono text-white placeholder-zinc-700 focus:outline-none"
             />
             <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-8 py-6 h-full bg-amber-500 text-black font-mono font-bold hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {loading ? "PROCESSING..." : "ENGAGE"}
             </button>
          </div>
        </form>

        <div className="pt-12 flex gap-8 justify-center text-[0.65rem] font-mono text-zinc-600 tracking-[0.2em] uppercase">
           <div className="flex items-center gap-2">
             <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
             Fire Crawl Ready
           </div>
           <div className="flex items-center gap-2">
             <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
             Imagen V3 Engine
           </div>
           <div className="flex items-center gap-2">
             <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
             Custom Agent Loop
           </div>
        </div>
      </motion.div>
    </div>
  );
}
