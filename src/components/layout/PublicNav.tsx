import { useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PUBLIC_NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

export function PublicNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const clickTimestamps = useRef<readonly number[]>([]);
  const { user } = useAuth();

  const handleLogoClick = useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      const recent = [...clickTimestamps.current, now].filter(
        (t) => now - t < 800,
      );
      clickTimestamps.current = recent;

      if (recent.length >= 3) {
        e.preventDefault();
        clickTimestamps.current = [];
        navigate("/login");
      }
    },
    [navigate],
  );

  if (isHome) return null;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between pointer-events-none"
      style={{
        padding: "24px 40px",
        background: "linear-gradient(to bottom, var(--bg) 60%, transparent)",
      }}
    >
      <Link
        to="/"
        onClick={handleLogoClick}
        className="pointer-events-auto border-none cursor-pointer"
        style={{
          fontFamily: "var(--serif)",
          fontSize: "1.1rem",
          fontWeight: 400,
          fontStyle: "italic",
          color: location.pathname === "/" ? "var(--accent)" : "var(--fg-dim)",
          letterSpacing: "0.02em",
          textDecoration: "none",
          transition: "color 0.2s ease",
          userSelect: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
        onMouseLeave={(e) => {
          if (location.pathname !== "/")
            e.currentTarget.style.color = "var(--fg-dim)";
        }}
      >
        et
      </Link>
      <div className="flex items-center gap-8 pointer-events-auto">
        {PUBLIC_NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.72rem",
              fontWeight: 300,
              letterSpacing: "0.08em",
              textTransform: "lowercase",
              color:
                location.pathname === item.path
                  ? "var(--accent)"
                  : "var(--fg-dim)",
              transition: "color 0.2s ease",
              padding: "4px 0",
              textDecoration: "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent)")
            }
            onMouseLeave={(e) => {
              if (location.pathname !== item.path)
                e.currentTarget.style.color = "var(--fg-dim)";
            }}
          >
            {item.label}
          </Link>
        ))}
        <Link
          to={user ? "/cc" : "/login"}
          title="Command Center"
          aria-label="Command Center"
          style={{
            color: "var(--fg-muted)",
            transition: "color 0.2s ease",
            display: "flex",
            alignItems: "center",
            marginLeft: "8px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--fg-muted)")
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </Link>
      </div>
    </nav>
  );
}
