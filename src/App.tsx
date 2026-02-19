import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import { Tokens } from "@/pages/private/Tokens";
import { Overnight } from "@/pages/private/Overnight";
import { Research } from "@/pages/private/Research";
import { Placeholder } from "@/pages/private/Placeholder";
import { NotFound } from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export function App() {
  const auth = useAuthState();

  return (
    <QueryClientProvider client={queryClient}>
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
            <Route path="/tokens" element={<Tokens />} />
            <Route path="/overnight" element={<Overnight />} />
            <Route path="/research" element={<Research />} />
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
    </QueryClientProvider>
  );
}
