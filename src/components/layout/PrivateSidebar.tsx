import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  Moon,
  Coins,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { to: "/cc", label: "Command Center", icon: LayoutDashboard },
  { to: "/cc/meta", label: "Meta Analysis", icon: BarChart3 },
  { to: "/ai", label: "AI Command", icon: MessageSquare },
  { to: "/overnight", label: "Overnight", icon: Moon },
  { to: "/tokens", label: "Tokens", icon: Coins },
  { to: "/research", label: "Research", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function PrivateSidebar() {
  const { signOut } = useAuth();

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-56 bg-[var(--hive-sidebar-bg)] border-r border-[var(--hive-sidebar-border)] flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-[var(--hive-sidebar-border)]">
        <NavLink
          to="/"
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.1rem",
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--accent)",
            textDecoration: "none",
          }}
        >
          et
        </NavLink>
        <p className="text-xs text-[var(--hive-fg-muted)] mt-1 font-mono">
          command center
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/cc"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive
                  ? "text-[var(--hive-green-mid)] bg-[var(--hive-accent-dim)] border-r-2 border-[var(--hive-green-bright)]"
                  : "text-[var(--hive-fg-dim)] hover:text-[var(--hive-fg)] hover:bg-gray-50"
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-[var(--hive-sidebar-border)]">
        <button
          onClick={() => void signOut()}
          className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--hive-fg-muted)] hover:text-[var(--hive-fg-dim)] transition-colors w-full"
        >
          <LogOut size={14} />
          sign out
        </button>
      </div>
    </aside>
  );
}
