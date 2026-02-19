import { Link } from "react-router-dom";
import { PageShell } from "@/components/ui/PageShell";

export function NotFound() {
  return (
    <PageShell title="404">
      <p
        style={{
          fontFamily: "var(--sans)",
          fontSize: "0.95rem",
          color: "var(--fg-dim)",
          fontWeight: 300,
          lineHeight: 1.7,
          maxWidth: "560px",
          marginBottom: "32px",
        }}
      >
        This page doesn't exist.
      </p>
      <Link
        to="/"
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.72rem",
          color: "var(--accent)",
          letterSpacing: "0.08em",
          textDecoration: "none",
          borderBottom: "1px solid var(--accent)",
          paddingBottom: "2px",
        }}
      >
        go home
      </Link>
    </PageShell>
  );
}
