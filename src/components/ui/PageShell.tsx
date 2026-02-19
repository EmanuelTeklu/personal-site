import type { ReactNode } from "react";

interface PageShellProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly maxWidth?: string;
}

export function PageShell({ title, children, maxWidth = "800px" }: PageShellProps) {
  return (
    <div
      className="page-content"
      style={{
        minHeight: "100vh",
        padding: "120px max(40px, 8vw) 80px",
        maxWidth,
      }}
    >
      <h2
        style={{
          fontFamily: "var(--serif)",
          fontSize: "2.4rem",
          fontWeight: 300,
          marginBottom: "12px",
          color: "var(--fg)",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          width: "40px",
          height: "1px",
          background: "var(--accent)",
          marginBottom: "48px",
        }}
      />
      {children}
    </div>
  );
}
