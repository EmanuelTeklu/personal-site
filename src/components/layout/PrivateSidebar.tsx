import type { ComponentType } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  ChevronRight,
  Inbox,
  LogOut,
  Rocket,
  Search,
  Settings,
  Sparkles,
  Telescope,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  readonly href: string;
  readonly view: string;
  readonly label: string;
  readonly icon: ComponentType<{ size?: number; className?: string }>;
  readonly badge?: number;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/cc", view: "dashboard", label: "Inbox", icon: Inbox, badge: 12 },
  { href: "/cc?view=campaigns", view: "campaigns", label: "Campaigns", icon: Zap, badge: 3 },
  { href: "/cc?view=agents", view: "agents", label: "Agents", icon: Bot, badge: 7 },
  { href: "/cc?view=research", view: "research", label: "Research", icon: Telescope },
  { href: "/cc?view=analytics", view: "analytics", label: "Analytics", icon: BarChart3 },
];

const SYSTEM_ITEMS: readonly NavItem[] = [
  { href: "/cc?view=settings", view: "settings", label: "Settings", icon: Settings },
  { href: "/cc?view=docs", view: "docs", label: "Documentation", icon: BookOpen },
];

function activeView(search: string): string {
  const params = new URLSearchParams(search);
  return params.get("view") ?? "dashboard";
}

function SidebarLink({
  item,
  isActive,
}: {
  readonly item: NavItem;
  readonly isActive: boolean;
}) {
  return (
    <Link
      to={item.href}
      className={`flex items-center gap-3 rounded-[4px] px-3 py-2 text-[14px] transition-colors ${
        isActive
          ? "border-l-[3px] border-[var(--hive-green-mid)] bg-[var(--hive-accent-dim)] pl-[9px] text-[var(--hive-fg-strong)]"
          : "text-[var(--hive-fg-dim)] hover:bg-[var(--hive-bg-soft)] hover:text-[var(--hive-fg)]"
      }`}
    >
      <item.icon size={16} />
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] ${
            isActive
              ? "bg-[var(--hive-green-mid)] text-white"
              : "bg-[var(--hive-bg-soft)] text-[var(--hive-fg-muted)]"
          }`}
          style={{ fontFamily: "var(--mono)" }}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function PrivateSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const currentView = activeView(location.search);

  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col border-r border-[var(--hive-sidebar-border)] bg-[var(--hive-sidebar-bg)]">
      {/* Logo / workspace */}
      <div className="border-b border-[var(--hive-sidebar-border)] px-5 py-5">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[var(--hive-green-deep)] text-white">
            <Sparkles size={14} />
          </span>
          <div>
            <p
              className="text-[14px] tracking-tight text-[var(--hive-fg-strong)]"
              style={{ fontWeight: 500 }}
            >
              Emanuel
            </p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">
              Command Console
            </p>
          </div>
        </Link>
      </div>

      {/* Workspaces */}
      <div className="border-b border-[var(--hive-sidebar-border)] px-5 py-3">
        <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
          Workspaces
        </p>
        <div className="space-y-1">
          <button className="flex w-full items-center gap-2.5 rounded-[4px] px-2 py-1.5 text-left text-[13px] text-[var(--hive-fg-strong)] transition-colors hover:bg-[var(--hive-bg-soft)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--hive-green-bright)]" />
            Emanuel
            <ChevronRight size={12} className="ml-auto text-[var(--hive-fg-muted)]" />
          </button>
          <button className="flex w-full items-center gap-2.5 rounded-[4px] px-2 py-1.5 text-left text-[13px] text-[var(--hive-fg-dim)] transition-colors hover:bg-[var(--hive-bg-soft)]">
            <span className="inline-block h-2 w-2 rounded-full border border-[var(--hive-fg-muted)]" />
            Chain
            <ChevronRight size={12} className="ml-auto text-[var(--hive-fg-muted)]" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
          Navigation
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.view}
              item={item}
              isActive={location.pathname === "/cc" && currentView === item.view}
            />
          ))}
        </div>

        <p className="mb-2 mt-6 px-3 text-[10px] uppercase tracking-[0.14em] text-[var(--hive-fg-muted)]">
          System
        </p>
        <div className="space-y-0.5">
          {SYSTEM_ITEMS.map((item) => (
            <SidebarLink
              key={item.view}
              item={item}
              isActive={location.pathname === "/cc" && currentView === item.view}
            />
          ))}
        </div>
      </nav>

      {/* Status */}
      <div className="space-y-3 border-t border-[var(--hive-sidebar-border)] px-4 py-4">
        <div className="rounded-[4px] border border-[var(--hive-card-border)] bg-[var(--hive-bg-soft)] px-3 py-2.5">
          <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-[var(--hive-fg-muted)]">
            Status
          </p>
          <div className="space-y-1.5 text-[11px] text-[var(--hive-fg-dim)]">
            <div className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--hive-green-bright)]" />
              7 agents active
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--hive-green-bright)]" />
              2 campaigns running
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
              Learning active
            </div>
          </div>
          <p
            className="mt-2 border-t border-[var(--hive-card-border)] pt-2 text-[11px] text-[var(--hive-fg-muted)]"
            style={{ fontFamily: "var(--mono)" }}
          >
            $24.50 spent today
          </p>
        </div>

        <button
          onClick={() => void signOut()}
          className="flex w-full items-center gap-2 rounded-[4px] px-3 py-2 text-[12px] text-[var(--hive-fg-muted)] transition-colors hover:bg-[var(--hive-bg-soft)] hover:text-[var(--hive-fg-dim)]"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
