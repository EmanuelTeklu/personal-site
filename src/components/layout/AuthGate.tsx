"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AuthGateProps {
  readonly children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          color: "#71717a",
          fontFamily: "var(--mono)",
          fontSize: "0.8rem",
        }}
      >
        loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
