import { useState, useEffect } from "react";

const PAGES = ["movies", "writing", "links", "about"];

// ─── DATA ───────────────────────────────────────────────────────────────────

const MOVIES = [
  {
    title: "American Fiction",
    year: "2023",
    director: "Cord Jefferson",
    note: "Funniest movie I've seen in years.",
    gradient: "linear-gradient(145deg, #1a3a2a 0%, #2d1810 40%, #8b4513 100%)",
    accent: "#d4a574",
    letterboxd: "https://letterboxd.com/film/american-fiction/",
  },
  {
    title: "Fantastic Mr. Fox",
    year: "2009",
    director: "Wes Anderson",
    note: "The wild animal speech.",
    gradient: "linear-gradient(145deg, #c4751b 0%, #e8a833 40%, #f5d062 100%)",
    accent: "#3d2200",
    letterboxd: "https://letterboxd.com/film/fantastic-mr-fox/",
  },
  {
    title: "Barry Lyndon",
    year: "1975",
    director: "Stanley Kubrick",
    note: "Every frame, a painting.",
    gradient: "linear-gradient(145deg, #2a3040 0%, #4a5568 40%, #8b9bb5 100%)",
    accent: "#d4c5a0",
    letterboxd: "https://letterboxd.com/film/barry-lyndon/",
  },
  {
    title: "The Big Short",
    year: "2015",
    director: "Adam McKay",
    note: "Made me distrust everything and enjoy doing it.",
    gradient: "linear-gradient(145deg, #0d1117 0%, #1a1a2e 40%, #16213e 100%)",
    accent: "#e74c3c",
    letterboxd: "https://letterboxd.com/film/the-big-short-2015/",
  },
];

const OTHER_MOVIES = [
  { title: "The Social Network", year: "2010", note: "Sorkin at his best." },
  { title: "Parasite", year: "2019", note: "The basement scene." },
];

const WRITING = [];

const LINKS = [
  { title: "Marginal Revolution", url: "https://marginalrevolution.com", note: "Tyler Cowen & Alex Tabarrok. I read this every day." },
];

// ─── STYLES ─────────────────────────────────────────────────────────────────

const fonts = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=JetBrains+Mono:wght@300;400&family=DM+Sans:wght@300;400;500&display=swap');
`;

const css = `
  :root {
    --bg: #0a0a0a;
    --fg: #e8e4de;
    --fg-dim: #7a756d;
    --fg-muted: #4a4640;
    --accent: #c9a96e;
    --accent-dim: rgba(201, 169, 110, 0.15);
    --serif: 'Cormorant Garamond', Georgia, serif;
    --mono: 'JetBrains Mono', monospace;
    --sans: 'DM Sans', sans-serif;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    background: var(--bg);
    color: var(--fg);
    font-family: var(--sans);
    font-weight: 300;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  ::selection {
    background: var(--accent);
    color: var(--bg);
  }

  a {
    color: var(--fg);
    text-decoration: none;
    transition: color 0.2s ease;
  }
  a:hover { color: var(--accent); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes lineGrow {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }

  .fade-up {
    animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    opacity: 0;
  }

  .page-content {
    animation: fadeIn 0.4s ease forwards;
  }
`;

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function Nav({ current, onNav }) {
  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: "24px 40px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "linear-gradient(to bottom, var(--bg) 60%, transparent)",
      pointerEvents: "none",
    }}>
      <button
        onClick={() => onNav(null)}
        style={{
          pointerEvents: "all",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--serif)",
          fontSize: "1.1rem",
          fontWeight: 400,
          fontStyle: "italic",
          color: current === null ? "var(--accent)" : "var(--fg-dim)",
          letterSpacing: "0.02em",
          transition: "color 0.2s ease",
        }}
        onMouseEnter={e => e.target.style.color = "var(--accent)"}
        onMouseLeave={e => { if (current !== null) e.target.style.color = "var(--fg-dim)"; }}
      >
        et
      </button>
      <div style={{ display: "flex", gap: "32px", pointerEvents: "all" }}>
        {PAGES.map(p => (
          <button
            key={p}
            onClick={() => onNav(p)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--mono)",
              fontSize: "0.72rem",
              fontWeight: 300,
              letterSpacing: "0.08em",
              textTransform: "lowercase",
              color: current === p ? "var(--accent)" : "var(--fg-dim)",
              transition: "color 0.2s ease",
              padding: "4px 0",
              position: "relative",
            }}
            onMouseEnter={e => e.target.style.color = "var(--accent)"}
            onMouseLeave={e => { if (current !== p) e.target.style.color = "var(--fg-dim)"; }}
          >
            {p}
          </button>
        ))}
      </div>
    </nav>
  );
}

function Home({ onNav }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "0 max(40px, 8vw)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background image */}
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: "55%",
        backgroundImage: "url('/massawa.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        opacity: 0.28,
        maskImage: "linear-gradient(to left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, transparent 90%)",
        WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, transparent 90%)",
        pointerEvents: "none",
        filter: "grayscale(100%)",
      }} />

      {/* Subtle glow */}
      <div style={{
        position: "absolute",
        top: "20%",
        right: "10%",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%)",
        filter: "blur(60px)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "720px", position: "relative", zIndex: 1 }}>
        <h1
          className={mounted ? "fade-up" : ""}
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(3rem, 7vw, 5.5rem)",
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--fg)",
            marginBottom: "32px",
          }}
        >
          Emanuel<br />Teklu
        </h1>

        <div
          className={mounted ? "fade-up" : ""}
          style={{
            animationDelay: "0.15s",
            width: "60px",
            height: "1px",
            background: "var(--accent)",
            marginBottom: "28px",
            transformOrigin: "left",
            animation: mounted ? "lineGrow 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards" : "none",
            transform: "scaleX(0)",
          }}
        />

        <p
          className={mounted ? "fade-up" : ""}
          style={{
            animationDelay: "0.3s",
            fontFamily: "var(--sans)",
            fontSize: "1.05rem",
            fontWeight: 300,
            color: "var(--fg-dim)",
            lineHeight: 1.7,
            maxWidth: "480px",
            marginBottom: "48px",
          }}
        >
          Curious about AI. Building things. Washington, DC.
        </p>

        <div
          className={mounted ? "fade-up" : ""}
          style={{
            animationDelay: "0.45s",
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          {PAGES.map((p, i) => (
            <button
              key={p}
              onClick={() => onNav(p)}
              className={mounted ? "fade-up" : ""}
              style={{
                animationDelay: `${0.5 + i * 0.06}s`,
                background: "none",
                border: "1px solid var(--fg-muted)",
                borderRadius: "0",
                padding: "10px 20px",
                cursor: "pointer",
                fontFamily: "var(--mono)",
                fontSize: "0.72rem",
                fontWeight: 300,
                letterSpacing: "0.1em",
                textTransform: "lowercase",
                color: "var(--fg-dim)",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={e => {
                e.target.style.borderColor = "var(--accent)";
                e.target.style.color = "var(--accent)";
                e.target.style.background = "var(--accent-dim)";
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = "var(--fg-muted)";
                e.target.style.color = "var(--fg-dim)";
                e.target.style.background = "none";
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        position: "absolute",
        bottom: "32px",
        left: "max(40px, 8vw)",
        fontFamily: "var(--mono)",
        fontSize: "0.68rem",
        color: "var(--fg-muted)",
        letterSpacing: "0.05em",
      }}>
        <a href="mailto:tekluemanuel10@gmail.com" style={{ color: "var(--fg-muted)" }}>
          tekluemanuel10@gmail.com
        </a>
      </div>
    </div>
  );
}

function PageShell({ title, children, maxWidth = "800px" }) {
  return (
    <div className="page-content" style={{
      minHeight: "100vh",
      padding: "120px max(40px, 8vw) 80px",
      maxWidth,
    }}>
      <h2 style={{
        fontFamily: "var(--serif)",
        fontSize: "2.4rem",
        fontWeight: 300,
        marginBottom: "12px",
        color: "var(--fg)",
      }}>
        {title}
      </h2>
      <div style={{
        width: "40px",
        height: "1px",
        background: "var(--accent)",
        marginBottom: "48px",
      }} />
      {children}
    </div>
  );
}

function MovieCard({ movie, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={movie.letterboxd}
      target="_blank"
      rel="noopener"
      className="fade-up"
      style={{
        animationDelay: `${0.1 + index * 0.12}s`,
        display: "block",
        textDecoration: "none",
        position: "relative",
        borderRadius: "2px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 60px rgba(0,0,0,0.4)"
          : "0 4px 20px rgba(0,0,0,0.2)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        aspectRatio: "2/3",
        background: movie.gradient,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "24px",
        overflow: "hidden",
      }}>
        <span style={{
          position: "absolute",
          top: "16px",
          right: "20px",
          fontFamily: "var(--serif)",
          fontSize: "6rem",
          fontWeight: 300,
          color: "rgba(255,255,255,0.06)",
          lineHeight: 1,
          pointerEvents: "none",
        }}>
          {index + 1}
        </span>

        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: movie.accent,
            display: "block",
            marginBottom: "6px",
          }}>
            {movie.director} · {movie.year}
          </span>
          <h3 style={{
            fontFamily: "var(--serif)",
            fontSize: "1.35rem",
            fontWeight: 400,
            color: "#fff",
            lineHeight: 1.2,
            marginBottom: "8px",
          }}>
            {movie.title}
          </h3>
          <p style={{
            fontFamily: "var(--sans)",
            fontSize: "0.72rem",
            fontWeight: 300,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.55,
            opacity: hovered ? 1 : 0.7,
            transition: "opacity 0.3s ease",
          }}>
            {movie.note}
          </p>
        </div>
      </div>
    </a>
  );
}

function MoviesPage() {
  return (
    <PageShell title="Movies" maxWidth="1000px">
      <p style={{
        fontFamily: "var(--sans)",
        fontSize: "0.88rem",
        color: "var(--fg-dim)",
        fontWeight: 300,
        lineHeight: 1.7,
        marginBottom: "12px",
        maxWidth: "560px",
      }}>
        Top four, plus a couple I keep coming back to.
      </p>
      <a
        href="https://letterboxd.com"
        target="_blank"
        rel="noopener"
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.68rem",
          color: "var(--fg-muted)",
          letterSpacing: "0.06em",
          display: "inline-block",
          marginBottom: "40px",
          borderBottom: "1px solid transparent",
          paddingBottom: "1px",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={e => {
          e.target.style.color = "var(--accent)";
          e.target.style.borderBottomColor = "var(--accent)";
        }}
        onMouseLeave={e => {
          e.target.style.color = "var(--fg-muted)";
          e.target.style.borderBottomColor = "transparent";
        }}
      >
        letterboxd ↗
      </a>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        maxWidth: "920px",
      }}>
        {MOVIES.map((m, i) => <MovieCard key={i} movie={m} index={i} />)}
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>

      <div style={{ marginTop: "56px" }}>
        <h3 style={{
          fontFamily: "var(--mono)",
          fontSize: "0.72rem",
          fontWeight: 300,
          letterSpacing: "0.1em",
          textTransform: "lowercase",
          color: "var(--fg-muted)",
          marginBottom: "24px",
        }}>
          also watching
        </h3>
        {OTHER_MOVIES.map((m, i) => (
          <div
            key={i}
            className="fade-up"
            style={{
              animationDelay: `${0.6 + i * 0.05}s`,
              padding: "16px 0",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
              <span style={{
                fontFamily: "var(--serif)",
                fontSize: "1.05rem",
                fontWeight: 400,
                color: "var(--fg)",
              }}>
                {m.title}
              </span>
              <span style={{
                fontFamily: "var(--mono)",
                fontSize: "0.68rem",
                color: "var(--fg-muted)",
                marginLeft: "16px",
                flexShrink: 0,
              }}>
                {m.year}
              </span>
            </div>
            {m.note && (
              <p style={{
                fontFamily: "var(--sans)",
                fontSize: "0.78rem",
                color: "var(--fg-dim)",
                fontWeight: 300,
                fontStyle: "italic",
                lineHeight: 1.5,
              }}>
                {m.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function WritingPage() {
  return (
    <PageShell title="Writing">
      <p style={{
        fontFamily: "var(--sans)",
        fontSize: "0.88rem",
        color: "var(--fg-dim)",
        fontWeight: 300,
        lineHeight: 1.7,
        maxWidth: "560px",
        fontStyle: "italic",
      }}>
        Nothing here yet.
      </p>
    </PageShell>
  );
}

function LinksPage() {
  return (
    <PageShell title="Links">
      <p style={{
        fontFamily: "var(--sans)",
        fontSize: "0.88rem",
        color: "var(--fg-dim)",
        fontWeight: 300,
        lineHeight: 1.7,
        marginBottom: "36px",
        maxWidth: "560px",
      }}>
        Things I keep open.
      </p>
      {LINKS.map((l, i) => (
        <a
          key={i}
          href={l.url}
          target="_blank"
          rel="noopener"
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
          onMouseEnter={e => e.currentTarget.style.background = "rgba(201,169,110,0.03)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
            <span style={{
              fontFamily: "var(--serif)",
              fontSize: "1.15rem",
              fontWeight: 400,
              color: "var(--fg)",
            }}>
              {l.title} <span style={{ fontSize: "0.7rem", color: "var(--fg-muted)" }}>↗</span>
            </span>
          </div>
          {l.note && (
            <p style={{
              fontFamily: "var(--sans)",
              fontSize: "0.82rem",
              color: "var(--fg-dim)",
              fontWeight: 300,
              fontStyle: "italic",
              lineHeight: 1.5,
            }}>
              {l.note}
            </p>
          )}
        </a>
      ))}
    </PageShell>
  );
}

function AboutPage() {
  return (
    <PageShell title="About">
      <div style={{
        fontFamily: "var(--sans)",
        fontSize: "0.95rem",
        color: "var(--fg-dim)",
        fontWeight: 300,
        lineHeight: 1.85,
        maxWidth: "560px",
      }}>
        <p className="fade-up" style={{ marginBottom: "20px", animationDelay: "0.05s" }}>
          I'm Emanuel. I'm interested in AI — not the discourse around it, just what happens
          when machines get good at things we assumed only people could do.
        </p>
        <p className="fade-up" style={{ marginBottom: "20px", animationDelay: "0.1s" }}>
          I'm building something called{" "}
          <a href="https://janehive.com" target="_blank" rel="noopener" style={{ color: "var(--accent)" }}>JaneHive</a>.
          Still figuring it out.
        </p>
        <p className="fade-up" style={{ marginBottom: "32px", animationDelay: "0.15s" }}>
          Washington, DC.
        </p>

        <div className="fade-up" style={{
          animationDelay: "0.25s",
          padding: "24px 0",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
            {[
              { label: "x / twitter", url: "https://x.com/" },
              { label: "github", url: "https://github.com/EmanuelTeklu" },
              { label: "email", url: "mailto:tekluemanuel10@gmail.com" },
            ].map(l => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener"
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  color: "var(--fg-muted)",
                  letterSpacing: "0.06em",
                  borderBottom: "1px solid transparent",
                  paddingBottom: "2px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                  e.target.style.color = "var(--accent)";
                  e.target.style.borderBottomColor = "var(--accent)";
                }}
                onMouseLeave={e => {
                  e.target.style.color = "var(--fg-muted)";
                  e.target.style.borderBottomColor = "transparent";
                }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── APP ────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState(null);
  const [key, setKey] = useState(0);

  const navigate = (p) => {
    setPage(p);
    setKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (page) {
      case "movies": return <MoviesPage />;
      case "writing": return <WritingPage />;
      case "links": return <LinksPage />;
      case "about": return <AboutPage />;
      default: return <Home onNav={navigate} />;
    }
  };

  return (
    <>
      <style>{fonts}</style>
      <style>{css}</style>
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        {page !== null && <Nav current={page} onNav={navigate} />}
        <div key={key}>
          {renderPage()}
        </div>
      </div>
    </>
  );
}
