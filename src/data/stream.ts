export interface StreamEntry {
  readonly id: string;
  readonly date: string;
  readonly content: string;
  readonly tags?: readonly string[];
}

export const STREAM_ENTRIES: readonly StreamEntry[] = [
  {
    id: "1",
    date: "2026-02-18",
    content:
      "Built a unified personal OS — merged my personal site, dashboard, and AI assistant into one app. Public pages for identity, private pages for command and control. The dream is one URL that does everything.",
    tags: ["building", "meta"],
  },
  {
    id: "2",
    date: "2026-02-18",
    content:
      "Thinking a lot about what it means to have an AI assistant that gets better over time. The system should be designed in anticipation of dramatically better models. Build the rails now, let the trains get faster.",
    tags: ["ai", "philosophy"],
  },
  {
    id: "3",
    date: "2026-02-17",
    content:
      "Set up ClawdBot on Slack with 9 tools and an overnight runner. It can read files, run commands, write notes, commit code. The agentic loop is simple but scales naturally with model capability.",
    tags: ["clawdbot", "building"],
  },
];
