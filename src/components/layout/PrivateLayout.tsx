import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { PrivateSidebar } from "./PrivateSidebar";

export function PrivateLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="theme-hive flex h-screen overflow-hidden bg-[var(--hive-bg)] text-[var(--hive-fg)]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <PrivateSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 h-full w-[280px]">
            <PrivateSidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-[var(--hive-sidebar-border)] bg-[var(--hive-bg)] px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-[4px] p-1.5 text-[var(--hive-fg-dim)] transition-colors hover:bg-[var(--hive-bg-soft)]"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="text-[14px] text-[var(--hive-fg-strong)]" style={{ fontWeight: 500 }}>
            Command Console
          </span>
        </div>

        <div className="mx-auto w-full max-w-[1440px] p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
