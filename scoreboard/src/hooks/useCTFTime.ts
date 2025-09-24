"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useCTFTime({ startAt }: { startAt: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!startAt) {
      return;
    }

    const now = Date.now() / 1000;
    const timeUntilStart = startAt - now;
    if (timeUntilStart > 0) {
      const timeout = setTimeout(() => {
        router.refresh();
      }, timeUntilStart * 1000);
      return () => clearTimeout(timeout);
    }
  }, [router, startAt]);
}
