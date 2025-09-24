// widgets/CTFTimeClient.tsx
"use client";
import { useCTFTime } from "@/hooks/useCTFTime";

export function CTFTimeClient({ startAt }: { startAt: number }) {
  useCTFTime({ startAt });
  return null;
}
