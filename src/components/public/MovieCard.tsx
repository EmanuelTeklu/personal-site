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
        animationDelay: `${0.1 + index * 0.12}s`,
        display: "block",
        textDecoration: "none",
        position: "relative",
        borderRadius: "2px",
        overflow: "hidden",
        cursor: "pointer",
        transition:
          "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 60px rgba(0,0,0,0.4)"
          : "0 4px 20px rgba(0,0,0,0.2)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          aspectRatio: "2/3",
          background: movie.gradient,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "24px",
          overflow: "hidden",
        }}
      >
        {/* Large index number */}
        <span
          style={{
            position: "absolute",
            top: "16px",
            right: "20px",
            fontFamily: "var(--serif)",
            fontSize: "6rem",
            fontWeight: 300,
            color: "rgba(255,255,255,0.06)",
            lineHeight: 1,
            pointerEvents: "none",
          }}
        >
          {index + 1}
        </span>

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: movie.accent,
              display: "block",
              marginBottom: "6px",
            }}
          >
            {movie.director} · {movie.year}
          </span>
          <h3
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.35rem",
              fontWeight: 400,
              color: "#fff",
              lineHeight: 1.2,
              marginBottom: "8px",
            }}
          >
            {movie.title}
          </h3>
        </div>
      </div>
    </a>
  );
}
