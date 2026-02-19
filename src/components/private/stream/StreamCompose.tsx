import { useState, type FormEvent } from "react";

interface StreamComposeProps {
  readonly onPublish: (content: string, tags: string[]) => Promise<string | null>;
  readonly initialContent?: string;
}

export function StreamCompose({ onPublish, initialContent = "" }: StreamComposeProps) {
  const [content, setContent] = useState(initialContent);
  const [tagsRaw, setTagsRaw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setErr(null);
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    const error = await onPublish(content.trim(), tags);
    if (error) {
      setErr(error);
    } else {
      setContent("");
      setTagsRaw("");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} style={{ marginTop: "20px", maxWidth: "640px" }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="what's on your mind..."
        rows={5}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid var(--fg-muted)",
          color: "var(--fg)",
          fontFamily: "var(--sans)",
          fontSize: "0.95rem",
          lineHeight: "1.7",
          fontWeight: 300,
          resize: "none",
          outline: "none",
          padding: "8px 0",
          marginBottom: "12px",
          boxSizing: "border-box",
        }}
      />
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <input
          type="text"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder="tags (comma separated)"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            borderBottom: "1px solid var(--fg-muted)",
            color: "var(--fg-dim)",
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            outline: "none",
            padding: "6px 0",
          }}
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.68rem",
            letterSpacing: "0.08em",
            color: submitting ? "var(--fg-muted)" : "var(--accent)",
            background: "none",
            border: `1px solid ${submitting ? "var(--fg-muted)" : "var(--accent)"}`,
            padding: "8px 20px",
            cursor: submitting || !content.trim() ? "default" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {submitting ? "publishing..." : "publish"}
        </button>
      </div>
      {err && (
        <p style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", color: "#f87171", marginTop: "8px" }}>
          {err}
        </p>
      )}
    </form>
  );
}
