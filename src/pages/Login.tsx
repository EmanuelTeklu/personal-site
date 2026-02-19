import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function Login() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/cc" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError(
        "Auth not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      );
      return;
    }
    setError("");
    setSubmitting(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg)" }}
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-sm space-y-6"
        style={{ padding: "0 24px" }}
      >
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "2rem",
            fontWeight: 300,
            color: "var(--fg)",
          }}
        >
          Sign in
        </h1>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            required
            className="w-full bg-transparent border-b border-zinc-800 px-0 py-3 text-sm outline-none focus:border-zinc-500 transition-colors"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.82rem",
              color: "var(--fg)",
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            required
            className="w-full bg-transparent border-b border-zinc-800 px-0 py-3 text-sm outline-none focus:border-zinc-500 transition-colors"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.82rem",
              color: "var(--fg)",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            color: submitting ? "var(--fg-muted)" : "var(--accent)",
            background: "none",
            border: `1px solid ${submitting ? "var(--fg-muted)" : "var(--accent)"}`,
            padding: "10px 24px",
            cursor: submitting ? "wait" : "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {submitting ? "signing in..." : "enter"}
        </button>
      </form>
    </div>
  );
}
