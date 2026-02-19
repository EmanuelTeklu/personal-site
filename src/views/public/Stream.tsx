import { useState } from "react";
import { useStreamEntries } from "@/hooks/useStreamEntries";
import { useAuth } from "@/hooks/useAuth";
import { PageShell } from "@/components/ui/PageShell";
import { StreamCompose } from "@/components/private/stream/StreamCompose";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function Stream() {
  const { entries, loading, addEntry, deleteEntry } = useStreamEntries();
  const { user } = useAuth();
  const [composing, setComposing] = useState(false);

  return (
    <PageShell title="Stream">
      {/* Auth-only compose button */}
      {user && (
        <div style={{ marginBottom: "32px" }}>
          <button
            onClick={() => setComposing((v) => !v)}
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.68rem",
              letterSpacing: "0.1em",
              color: composing ? "var(--fg-muted)" : "var(--accent)",
              background: "none",
              border: `1px solid ${composing ? "var(--fg-muted)" : "var(--accent)"}`,
              padding: "8px 18px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {composing ? "cancel" : "+ new entry"}
          </button>
          {composing && (
            <StreamCompose
              onPublish={async (content, tags) => {
                const { error } = await addEntry(content, tags);
                if (!error) setComposing(false);
                return error;
              }}
            />
          )}
        </div>
      )}

      <div className="page-content space-y-8">
        {loading && (
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.72rem",
              color: "var(--fg-muted)",
            }}
          >
            loading...
          </p>
        )}
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="fade-up"
            style={{
              borderLeft: "2px solid var(--accent-dim)",
              paddingLeft: "20px",
              position: "relative",
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
              {formatDate(entry.created_at)}
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
            {entry.tags.length > 0 && (
              <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
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
            {/* Auth-only delete */}
            {user && (
              <button
                onClick={() => void deleteEntry(entry.id)}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  fontFamily: "var(--mono)",
                  fontSize: "0.65rem",
                  color: "var(--fg-muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0 4px",
                  opacity: 0.5,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </article>
        ))}
        {!loading && entries.length === 0 && (
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
