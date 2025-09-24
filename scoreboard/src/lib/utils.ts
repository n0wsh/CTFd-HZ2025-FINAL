import { formatDistanceToNowStrict } from "date-fns";
import { mn } from "date-fns/locale";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgoUlaanbaatar(date?: string | number | Date): string {
  if (!date) return "";

  const d = new Date(date);
  const utc8 = new Date(d.getTime() + 8 * 60 * 60 * 1000);

  return formatDistanceToNowStrict(utc8, { addSuffix: true, locale: mn });
}
