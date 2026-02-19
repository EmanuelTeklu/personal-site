import type { ComponentType } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Clock,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Palette,
  Rocket,
  Settings,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { href: "/cc", view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cc?view=taste-engine", view: "taste-engine", label: "Taste Engine", icon: Palette },
  { href: "/cc?view=projects", view: "projects", label: "Projects", icon: FolderKanban },
  { href: "/cc?view=production", view: "production", label: "Production", icon: Rocket },
  { href: "/cc?view=history", view: "history", label: "History", icon: Clock },
] as const;

const FOOTER_ITEMS = [
  { href: "/cc?view=settings", view: "settings", label: "Settings", icon: Settings },
  { href: "/cc?view=tasks", view: "tasks", label: "Tasks", icon: ListChecks },
] as const;

function activeView(search: string): string {
  const params = new URLSearchParams(search);
  return params.get("view") ?? "dashboard";
}

interface SidebarItem {
  readonly href: string;
  readonly view: string;
  readonly label: string;
  readonly icon: ComponentType<{ size?: number; className?: string }>;
}

function SidebarLink({ item, isActive }: { readonly item: SidebarItem; readonly isActive: boolean }) {
  return (
    <Link
      to={item.href}
      className={`flex items-center gap-3 rounded-[var(--hive-radius-sm)] px-3 py-2.5 text-[14px] transition-colors ${
        isActive
          ? "bg-[var(--hive-accent-dim)] text-[var(--hive-green-deep)]"
          : "text-[var(--hive-fg-dim)] hover:bg-[var(--hive-bg-soft)] hover:text-[var(--hive-fg)]"
      }`}
    >
      <item.icon size={18} />
      <span>{item.label}</span>
    </Link>
  );
}

export function PrivateSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const currentView = activeView(location.search);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[var(--hive-sidebar-border)] bg-[var(--hive-sidebar-bg)]">
      <div className="border-b border-[var(--hive-sidebar-border)] px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--hive-green-deep)] text-white">
            <Sparkles size={14} />
          </span>
          <div>
            <p className="text-[15px] tracking-tight text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
              Emanuel Studio
            </p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--hive-fg-muted)]">Command System</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.href} item={item} isActive={location.pathname === "/cc" && currentView === item.view} />
          ))}
        </div>
      </nav>

      <div className="space-y-3 border-t border-[var(--hive-sidebar-border)] px-3 py-4">
        <div className="space-y-1">
          {FOOTER_ITEMS.map((item) => (
            <SidebarLink key={item.href} item={item} isActive={location.pathname === "/cc" && currentView === item.view} />
          ))}
        </div>

        <div className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-3 py-2 text-[11px] text-[var(--hive-fg-dim)]">
          <p className="font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">System</p>
          <p className="pt-1">Learning active, profile updating.</p>
        </div>

        <button
          onClick={() => void signOut()}
          className="flex w-full items-center gap-2 rounded-[var(--hive-radius-sm)] px-3 py-2 text-xs text-[var(--hive-fg-muted)] transition-colors hover:bg-[var(--hive-bg-soft)] hover:text-[var(--hive-fg-dim)]"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
