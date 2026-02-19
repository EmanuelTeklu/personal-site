import { Routes, Route } from "react-router-dom";
import { AuthContext, useAuthState } from "@/hooks/useAuth";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PrivateLayout } from "@/components/layout/PrivateLayout";
import { AuthGate } from "@/components/layout/AuthGate";
import { Home } from "@/pages/public/Home";
import { Movies } from "@/pages/public/Movies";
import { Writing } from "@/pages/public/Writing";
import { Links } from "@/pages/public/Links";
import { About } from "@/pages/public/About";
import { Login } from "@/pages/Login";
import { CommandCenter } from "@/pages/private/CommandCenter";
import { MetaAnalysis } from "@/pages/private/MetaAnalysis";
import { Placeholder } from "@/pages/private/Placeholder";
import { NotFound } from "@/pages/NotFound";

export function App() {
  const auth = useAuthState();

  return (
    <AuthContext.Provider value={auth}>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/links" element={<Links />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Login (standalone — no layout) */}
        <Route path="/login" element={<Login />} />

        {/* Private routes */}
        <Route
          element={
            <AuthGate>
              <PrivateLayout />
            </AuthGate>
          }
        >
          <Route path="/cc" element={<CommandCenter />} />
          <Route path="/cc/meta" element={<MetaAnalysis />} />
          <Route
            path="/ai"
            element={
              <Placeholder
                title="AI Command"
                description="Chat interface for ClawdBot — send prompts, see streaming responses."
              />
            }
          />
          <Route
            path="/overnight"
            element={
              <Placeholder
                title="Overnight"
                description="Task queue and overnight run results from ClawdBot."
              />
            }
          />
          <Route
            path="/tokens"
            element={
              <Placeholder
                title="Tokens"
                description="API spend visualization — daily, weekly, per-source breakdown."
              />
            }
          />
          <Route
            path="/research"
            element={
              <Placeholder
                title="Research"
                description="Browse overnight research briefs and analysis."
              />
            }
          />
          <Route
            path="/settings"
            element={
              <Placeholder
                title="Settings"
                description="Preferences, theme, and configuration."
              />
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthContext.Provider>
  );
}
