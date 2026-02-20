import type { ComponentType } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Clock,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Palette,
  Settings,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarItem {
  readonly href: string;
  readonly label: string;
  readonly icon: ComponentType<{ size?: number; className?: string }>;
  readonly isActive: (pathname: string, search: string) => boolean;
}

const NAV_ITEMS: readonly SidebarItem[] = [
  {
    href: "/cc",
    label: "Console",
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === "/cc" || pathname.startsWith("/cc/campaigns/"),
  },
  {
    href: "/cc/v2",
    label: "Legacy V2",
    icon: Palette,
    isActive: (pathname) => pathname === "/cc/v2",
  },
  {
    href: "/overnight",
    label: "Overnight",
    icon: Clock,
    isActive: (pathname) => pathname === "/overnight",
  },
  {
    href: "/research",
    label: "Research",
    icon: ListChecks,
    isActive: (pathname) => pathname === "/research",
  },
  {
    href: "/ai",
    label: "AI Command",
    icon: Sparkles,
    isActive: (pathname) => pathname === "/ai",
  },
];

const FOOTER_ITEMS: readonly SidebarItem[] = [
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    isActive: (pathname) => pathname === "/settings",
  },
  {
    href: "/tokens",
    label: "Tokens",
    icon: ListChecks,
    isActive: (pathname) => pathname === "/tokens",
  },
];

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

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[var(--hive-sidebar-border)] bg-[var(--hive-sidebar-bg)]">
      <div className="border-b border-[var(--hive-sidebar-border)] px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--hive-green-deep)] text-white">
            <Sparkles size={14} />
          </span>
          <div>
            <p className="text-[15px] tracking-tight text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
              Emanuel.com
            </p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--hive-fg-muted)]">Operator Console</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              isActive={item.isActive(location.pathname, location.search)}
            />
          ))}
        </div>
      </nav>

      <div className="space-y-3 border-t border-[var(--hive-sidebar-border)] px-3 py-4">
        <div className="space-y-1">
          {FOOTER_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              isActive={item.isActive(location.pathname, location.search)}
            />
          ))}
        </div>

        <div className="rounded-[var(--hive-radius-sm)] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-3 py-2 text-[11px] text-[var(--hive-fg-dim)]">
          <p className="font-[var(--mono)] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">System</p>
          <p className="pt-1">Live memory and review sync active.</p>
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
