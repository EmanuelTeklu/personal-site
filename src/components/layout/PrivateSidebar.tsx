import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Rocket,
  Clock,
  Settings,
  BarChart3,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const PRIMARY_NAV = [
  { href: "/cc", view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cc?view=projects", view: "projects", label: "Projects", icon: FolderKanban },
  { href: "/cc?view=production", view: "production", label: "Production", icon: Rocket },
  { href: "/cc?view=history", view: "history", label: "History", icon: Clock },
  { href: "/cc?view=settings", view: "settings", label: "Settings", icon: Settings },
] as const;

const SECONDARY_NAV = [
  { href: "/cc/meta", label: "Meta Analysis", icon: BarChart3 },
] as const;

function activeViewFromSearch(search: string): string {
  const params = new URLSearchParams(search);
  return params.get("view") ?? "dashboard";
}

export function PrivateSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const activeView = activeViewFromSearch(location.search);

  return (
    <aside className="fixed top-0 left-0 bottom-0 z-40 flex w-64 flex-col border-r border-[var(--hive-sidebar-border)] bg-[var(--hive-sidebar-bg)]">
      <div className="border-b border-[var(--hive-sidebar-border)] px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[var(--hive-radius-sm)] bg-[var(--hive-green-deep)] text-[var(--hive-card-bg)]">
            <Sparkles size={16} />
          </span>
          <div>
            <p className="text-[15px] tracking-tight text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
              Emanuel Control
            </p>
            <p className="text-[11px] font-[var(--mono)] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
              personal operating studio
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-[var(--mono)] uppercase tracking-[0.16em] text-[var(--hive-fg-muted)]">
          Core Views
        </p>
        <div className="space-y-1">
          {PRIMARY_NAV.map((item) => {
            const isActive =
              location.pathname === "/cc" && activeView === item.view;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-[var(--hive-radius-sm)] px-3 py-2.5 text-[14px] transition-colors ${
                  isActive
                    ? "border border-[var(--hive-green-light)] bg-[var(--hive-accent-dim)] text-[var(--hive-green-deep)]"
                    : "border border-transparent text-[var(--hive-fg-dim)] hover:border-[var(--hive-card-border)] hover:bg-[var(--hive-bg-soft)] hover:text-[var(--hive-fg)]"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <p className="px-3 pb-2 pt-5 text-[10px] font-[var(--mono)] uppercase tracking-[0.16em] text-[var(--hive-fg-muted)]">
          Secondary
        </p>
        <div className="space-y-1">
          {SECONDARY_NAV.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-[var(--hive-radius-sm)] px-3 py-2.5 text-[14px] transition-colors ${
                  isActive
                    ? "border border-[var(--hive-green-light)] bg-[var(--hive-accent-dim)] text-[var(--hive-green-deep)]"
                    : "border border-transparent text-[var(--hive-fg-dim)] hover:border-[var(--hive-card-border)] hover:bg-[var(--hive-bg-soft)] hover:text-[var(--hive-fg)]"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-[var(--hive-sidebar-border)] p-3">
        <button
          onClick={() => void signOut()}
          className="flex w-full items-center gap-2 rounded-[var(--hive-radius-sm)] px-3 py-2 text-xs text-[var(--hive-fg-muted)] transition-colors hover:bg-[var(--hive-bg-soft)] hover:text-[var(--hive-fg-dim)]"
        >
          <LogOut size={14} />
          sign out
        </button>
      </div>
    </aside>
  );
}
