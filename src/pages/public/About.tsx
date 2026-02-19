import { Link } from "react-router-dom";
import { PageShell } from "@/components/ui/PageShell";
import { SOCIAL_LINKS } from "@/lib/constants";

export function About() {
  return (
    <PageShell title="About">
      <div
        style={{
          fontFamily: "var(--sans)",
          fontSize: "0.95rem",
          color: "var(--fg-dim)",
          fontWeight: 300,
          lineHeight: 1.85,
          maxWidth: "560px",
        }}
      >
        <p
          className="fade-up"
          style={{ marginBottom: "20px", animationDelay: "0.05s" }}
        >
          Curious about A.I. economics in Africa.
        </p>
        <p
          className="fade-up"
          style={{ marginBottom: "20px", animationDelay: "0.1s" }}
        >
          I'm building something called{" "}
          <a
            href="https://janehive.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent)" }}
          >
            JaneHive
          </a>
          , vibe coding for the equilibria.
        </p>
        <p
          className="fade-up"
          style={{ marginBottom: "32px", animationDelay: "0.15s" }}
        >
          Washington, DC.
        </p>

        <div
          className="fade-up"
          style={{
            animationDelay: "0.25s",
            padding: "24px 0",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
            {SOCIAL_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  color: "var(--fg-muted)",
                  letterSpacing: "0.06em",
                  borderBottom: "1px solid transparent",
                  paddingBottom: "2px",
                  transition: "all 0.2s ease",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent)";
                  e.currentTarget.style.borderBottomColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--fg-muted)";
                  e.currentTarget.style.borderBottomColor = "transparent";
                }}
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/login"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.72rem",
                color: "var(--fg-muted)",
                letterSpacing: "0.06em",
                borderBottom: "1px solid transparent",
                paddingBottom: "2px",
                transition: "all 0.2s ease",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent)";
                e.currentTarget.style.borderBottomColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--fg-muted)";
                e.currentTarget.style.borderBottomColor = "transparent";
              }}
            >
              command center
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
