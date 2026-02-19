import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PUBLIC_NAV_ITEMS, EMAIL } from "@/lib/constants";

export function Home() {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const clickTimestamps = useRef<readonly number[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNameClick = useCallback(() => {
    const now = Date.now();
    const recent = [...clickTimestamps.current, now].filter(
      (t) => now - t < 800,
    );
    clickTimestamps.current = recent;

    if (recent.length >= 3) {
      clickTimestamps.current = [];
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "0 max(40px, 8vw)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "55%",
          backgroundImage: "url('/massawa.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          opacity: 0.38,
          maskImage:
            "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.15) 80%, transparent 95%)",
          WebkitMaskImage:
            "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.15) 80%, transparent 95%)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "10%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "720px", position: "relative", zIndex: 1 }}>
        <h1
          className={mounted ? "fade-up" : ""}
          onClick={handleNameClick}
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(3rem, 7vw, 5.5rem)",
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--fg)",
            marginBottom: "32px",
            cursor: "default",
            userSelect: "none",
          }}
        >
          Emanuel
          <br />
          Teklu
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
            animation: mounted
              ? "lineGrow 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards"
              : "none",
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
          {PUBLIC_NAV_ITEMS.map((item, i) => (
            <Link
              key={item.path}
              to={item.path}
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
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
                e.currentTarget.style.background = "var(--accent-dim)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--fg-muted)";
                e.currentTarget.style.color = "var(--fg-dim)";
                e.currentTarget.style.background = "none";
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "max(40px, 8vw)",
          fontFamily: "var(--mono)",
          fontSize: "0.68rem",
          color: "var(--fg-muted)",
          letterSpacing: "0.05em",
        }}
      >
        <a href={`mailto:${EMAIL}`} style={{ color: "var(--fg-muted)" }}>
          {EMAIL}
        </a>
      </div>
    </div>
  );
}
