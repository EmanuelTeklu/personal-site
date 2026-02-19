import { PageShell } from "@/components/ui/PageShell";
import { LINKS } from "@/data/links";

export function Links() {
  return (
    <PageShell title="Links">
      <p
        style={{
          fontFamily: "var(--sans)",
          fontSize: "0.88rem",
          color: "var(--fg-dim)",
          fontWeight: 300,
          lineHeight: 1.7,
          marginBottom: "36px",
          maxWidth: "560px",
        }}
      >
        Things I keep open.
      </p>
      {LINKS.map((l, i) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="fade-up"
          style={{
            animationDelay: `${i * 0.05}s`,
            display: "block",
            padding: "20px 12px",
            marginLeft: "-12px",
            marginRight: "-12px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            textDecoration: "none",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(201,169,110,0.03)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.15rem",
                fontWeight: 400,
                color: "var(--fg)",
              }}
            >
              {l.title}{" "}
              <span style={{ fontSize: "0.7rem", color: "var(--fg-muted)" }}>
                ↗
              </span>
            </span>
          </div>
          {l.note && (
            <p
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.82rem",
                color: "var(--fg-dim)",
                fontWeight: 300,
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              {l.note}
            </p>
          )}
        </a>
      ))}
    </PageShell>
  );
}
