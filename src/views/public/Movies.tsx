import { PageShell } from "@/components/ui/PageShell";
import { MovieCard } from "@/components/public/MovieCard";
import { MOVIES, OTHER_MOVIES } from "@/data/movies";

export function Movies() {
  return (
    <PageShell title="Movies" maxWidth="1000px">
      <p
        style={{
          fontFamily: "var(--sans)",
          fontSize: "0.88rem",
          color: "var(--fg-dim)",
          fontWeight: 300,
          lineHeight: 1.7,
          marginBottom: "12px",
          maxWidth: "560px",
        }}
      >
        Letterboxd top four.
      </p>

      <div style={{ maxWidth: "600px" }}>
        {MOVIES.map((m, i) => (
          <MovieCard key={m.title} movie={m} index={i} />
        ))}
      </div>

      <div style={{ marginTop: "56px" }}>
        <h3
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            fontWeight: 300,
            letterSpacing: "0.1em",
            textTransform: "lowercase",
            color: "var(--fg-muted)",
            marginBottom: "24px",
          }}
        >
          also watching
        </h3>
        {OTHER_MOVIES.map((m, i) => (
          <div
            key={m.title}
            className="fade-up"
            style={{
              animationDelay: `${0.6 + i * 0.05}s`,
              padding: "16px 0",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
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
                  fontSize: "1.05rem",
                  fontWeight: 400,
                  color: "var(--fg)",
                }}
              >
                {m.title}
              </span>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.68rem",
                  color: "var(--fg-muted)",
                  marginLeft: "16px",
                  flexShrink: 0,
                }}
              >
                {m.year}
              </span>
            </div>
            {m.note && (
              <p
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "0.78rem",
                  color: "var(--fg-dim)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  lineHeight: 1.5,
                }}
              >
                {m.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
