"use client";

import { Suspense } from "react";
import { CommandCenterV2 } from "@/pages/private/CommandCenterV2";

function DashboardContent() {
  return <CommandCenterV2 />;
}

export default function CCPage() {
  return (
    <Suspense fallback={<div className="text-[var(--hive-fg-muted)]">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
