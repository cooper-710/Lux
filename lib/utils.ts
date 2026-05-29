import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type StatusTone = "Optimal" | "Monitor" | "Pending" | "Needs Attention" | "Needs Review" | "Data Pending";

export function statusClasses(status: StatusTone) {
  const styles: Record<StatusTone, string> = {
    Optimal: "rounded-sm border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    Monitor: "rounded-sm border-amber-400/25 bg-amber-400/10 text-amber-300",
    Pending: "rounded-sm border-sky-400/25 bg-sky-400/10 text-sky-300",
    "Needs Attention": "rounded-sm border-sequence-orange/35 bg-sequence-orange/10 text-sequence-orange",
    "Needs Review": "rounded-sm border-amber-300/30 bg-amber-300/10 text-amber-200",
    "Data Pending": "rounded-sm border-zinc-400/25 bg-zinc-400/10 text-zinc-300",
  };

  return styles[status];
}

export function statusDotClasses(status: StatusTone) {
  const styles: Record<StatusTone, string> = {
    Optimal: "bg-emerald-400",
    Monitor: "bg-amber-400",
    Pending: "bg-sky-400",
    "Needs Attention": "bg-sequence-orange",
    "Needs Review": "bg-amber-300",
    "Data Pending": "bg-zinc-300",
  };

  return styles[status];
}
