import { Outlet } from "react-router-dom";
import { PublicNav } from "./PublicNav";

export function PublicLayout() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <PublicNav />
      <Outlet />
    </div>
  );
}
