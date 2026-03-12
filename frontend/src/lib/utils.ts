import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    inactive: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
    terminated: "bg-red-500/15 text-red-400 border-red-500/20",
    draft: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
    confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    processing: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    shipped: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
    sent: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
    received: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    unpaid: "bg-red-500/15 text-red-400 border-red-500/20",
    overdue: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    partial: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/15 text-red-400 border-red-500/20",
    income: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    expense: "bg-red-500/15 text-red-400 border-red-500/20",
    critical: "bg-red-500/15 text-red-400 border-red-500/20",
    low: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    present: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    absent: "bg-red-500/15 text-red-400 border-red-500/20",
    late: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  };
  return map[status] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
}
