import { Outlet } from "react-router-dom";
import { PrivateSidebar } from "./PrivateSidebar";

export function PrivateLayout() {
  return (
    <div className="theme-hive min-h-screen bg-[var(--hive-bg)] text-[var(--hive-fg)]">
      <PrivateSidebar />
      <main className="ml-56 p-8 max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
}
