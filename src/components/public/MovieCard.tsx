import { useState } from "react";
import type { Movie } from "@/data/movies";

interface MovieCardProps {
  readonly movie: Movie;
  readonly index: number;
}

export function MovieCard({ movie, index }: MovieCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={movie.letterboxd}
      target="_blank"
      rel="noopener noreferrer"
      className="fade-up"
      style={{
        animationDelay: `${0.1 + index * 0.08}s`,
        display: "flex",
        alignItems: "center",
        gap: "18px",
        padding: "16px 0",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        textDecoration: "none",
        transition: "opacity 0.2s ease",
        opacity: hovered ? 1 : 0.85,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: "4px",
          height: "48px",
          borderRadius: "2px",
          background: movie.gradient,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.65rem",
          color: "var(--fg-muted)",
          width: "16px",
          flexShrink: 0,
        }}
      >
        {index + 1}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.05rem",
            fontWeight: 400,
            color: "var(--fg)",
            marginBottom: "3px",
            lineHeight: 1.2,
          }}
        >
          {movie.title}
        </h3>
        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.78rem",
            color: "var(--fg-dim)",
            fontWeight: 300,
            fontStyle: "italic",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {hovered ? movie.note : `${movie.director} · ${movie.year}`}
        </p>
      </div>
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.65rem",
          color: hovered ? movie.accent : "var(--fg-muted)",
          transition: "color 0.2s ease",
          flexShrink: 0,
        }}
      >
        ↗
      </span>
    </a>
  );
}
