import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Emanuel Teklu - Command Console",
  description: "JaneHive Command Console - AI agent orchestration dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
