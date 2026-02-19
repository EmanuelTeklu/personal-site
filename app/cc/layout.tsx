"use client";

import { Suspense } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGate } from "@/components/layout/AuthGate";
import { PrivateLayout } from "@/components/layout/PrivateLayout";

export default function CCLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--hive-bg)" }} />}>
      <AuthProvider>
        <AuthGate>
          <PrivateLayout>{children}</PrivateLayout>
        </AuthGate>
      </AuthProvider>
    </Suspense>
  );
}
