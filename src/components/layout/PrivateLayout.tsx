import { Outlet } from "react-router-dom";
import { PrivateSidebar } from "./PrivateSidebar";

export function PrivateLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <PrivateSidebar />
      <main className="ml-56 p-8 max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
}
