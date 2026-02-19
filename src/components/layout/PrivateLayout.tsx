import { Outlet } from "react-router-dom";
import { PrivateSidebar } from "./PrivateSidebar";

export function PrivateLayout() {
  return (
    <div className="theme-hive min-h-screen bg-[var(--hive-bg)] text-[var(--hive-fg)]">
      <PrivateSidebar />
      <main className="ml-64 p-8 pr-10 max-w-[1400px]">
        <Outlet />
      </main>
    </div>
  );
}
