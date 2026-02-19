import { useState, useRef, useEffect, type FormEvent } from "react";
import { useAIChat } from "@/hooks/useAIChat";
import { Bot, Send, Square, Trash2, Sparkles } from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Brief", prompt: "/brief" },
  { label: "Health Check", prompt: "/health" },
  { label: "Check Tokens", prompt: "How much have I spent on API tokens today?" },
  { label: "Research", prompt: "What research briefs are available?" },
] as const;

function ChatMessage({ role, content }: { readonly role: string; readonly content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-violet-600 text-white"
            : "bg-zinc-800 text-zinc-200 border border-zinc-700"
        }`}
      >
        <pre className="whitespace-pre-wrap font-sans">{content || "..."}</pre>
      </div>
    </div>
  );
}

export function AICommand() {
  const { messages, isStreaming, sendMessage, stopStreaming, clearMessages } = useAIChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    void sendMessage(input);
    setInput("");
  };

  const handleQuickAction = (prompt: string) => {
    if (isStreaming) return;
    void sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Bot size={20} className="text-violet-400" /> AI Command
        </h1>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center space-y-2">
              <Sparkles size={32} className="text-violet-400 mx-auto" />
              <p className="text-zinc-400 text-sm">Chat with ClawdBot</p>
              <p className="text-zinc-600 text-xs">Ask anything or use a quick action below</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 pt-4 border-t border-zinc-800"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask ClawdBot something..."
          disabled={isStreaming}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={stopStreaming}
            className="p-3 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
          >
            <Square size={16} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white transition-colors"
          >
            <Send size={16} />
          </button>
        )}
      </form>
    </div>
  );
}
