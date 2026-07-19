"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootIndex() {
  const router = useRouter();

  useEffect(() => {
    // Always show the landing page first — user can choose to login from there
    router.replace("/landing");
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#040a18" }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div
          className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#00D9FF", borderTopColor: "transparent" }}
        />
        <span
          className="text-xs font-mono tracking-widest uppercase"
          style={{ color: "#00D9FF80" }}
        >
          Initializing Stadium OS AI...
        </span>
      </div>
    </div>
  );
}
