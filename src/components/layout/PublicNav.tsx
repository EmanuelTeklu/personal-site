import { Link, useLocation } from "react-router-dom";
import { PUBLIC_NAV_ITEMS } from "@/lib/constants";

export function PublicNav() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  if (isHome) return null;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between pointer-events-none"
      style={{
        padding: "24px 40px",
        background:
          "linear-gradient(to bottom, var(--bg) 60%, transparent)",
      }}
    >
      <Link
        to="/"
        className="pointer-events-auto border-none cursor-pointer"
        style={{
          fontFamily: "var(--serif)",
          fontSize: "1.1rem",
          fontWeight: 400,
          fontStyle: "italic",
          color:
            location.pathname === "/"
              ? "var(--accent)"
              : "var(--fg-dim)",
          letterSpacing: "0.02em",
          textDecoration: "none",
          transition: "color 0.2s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--accent)")
        }
        onMouseLeave={(e) => {
          if (location.pathname !== "/")
            e.currentTarget.style.color = "var(--fg-dim)";
        }}
      >
        et
      </Link>
      <div className="flex gap-8 pointer-events-auto">
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
      </div>
    </nav>
  );
}
