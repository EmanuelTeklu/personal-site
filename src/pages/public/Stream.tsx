import { STREAM_ENTRIES } from "@/data/stream";
import { PageShell } from "@/components/ui/PageShell";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function Stream() {
  return (
    <PageShell title="Stream">
      <div className="page-content space-y-8">
        {STREAM_ENTRIES.map((entry) => (
          <article
            key={entry.id}
            className="fade-up"
            style={{
              borderLeft: "2px solid var(--accent-dim)",
              paddingLeft: "20px",
            }}
          >
            <time
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.7rem",
                color: "var(--fg-muted)",
                letterSpacing: "0.05em",
              }}
            >
              {formatDate(entry.date)}
            </time>
            <p
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.95rem",
                lineHeight: "1.7",
                color: "var(--fg-dim)",
                marginTop: "8px",
              }}
            >
              {entry.content}
            </p>
            {entry.tags && entry.tags.length > 0 && (
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.65rem",
                      color: "var(--fg-muted)",
                      border: "1px solid var(--fg-muted)",
                      padding: "2px 8px",
                      borderRadius: "2px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}

        {STREAM_ENTRIES.length === 0 && (
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.9rem",
              color: "var(--fg-muted)",
              textAlign: "center",
              paddingTop: "40px",
            }}
          >
            Nothing here yet.
          </p>
        )}
      </div>
    </PageShell>
  );
}
