import { useAuth } from "@/hooks/useAuth";
import { Settings as SettingsIcon, User, LogOut } from "lucide-react";

export function Settings() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold flex items-center gap-2">
        <SettingsIcon size={20} className="text-violet-400" /> Settings
      </h1>

      {/* Account */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <User size={14} /> Account
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Email</span>
            <span className="text-sm text-zinc-200 font-mono">
              {user?.email ?? "Not signed in"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">User ID</span>
            <span className="text-xs text-zinc-500 font-mono">
              {user?.id ?? "—"}
            </span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors mt-2"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      {/* API Configuration */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-medium text-zinc-400">API Configuration</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">API URL</span>
            <span className="text-zinc-300 font-mono text-xs">
              {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Supabase</span>
            <span className="text-zinc-300 font-mono text-xs">
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configured" : "Not configured"}
            </span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2">
        <h3 className="text-sm font-medium text-zinc-400">About</h3>
        <p className="text-xs text-zinc-500">
          Personal OS — emanuelteklu.com
        </p>
        <p className="text-xs text-zinc-600">
          React 19 + TypeScript + Next.js + Tailwind v4 + FastAPI
        </p>
      </div>
    </div>
  );
}
