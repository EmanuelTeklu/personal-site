import { Outlet } from "react-router-dom";
import { PrivateSidebar } from "./PrivateSidebar";

export function PrivateLayout() {
  return (
    <div className="theme-hive flex h-screen overflow-hidden bg-[var(--hive-bg)] text-[var(--hive-fg)]">
      <PrivateSidebar />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1440px] p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
