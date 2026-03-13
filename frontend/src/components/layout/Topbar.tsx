"use client";

import { Bell, Search, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-3 sm:px-5 lg:px-6 py-3 sm:py-4 bg-[#0a0f1e]/60 backdrop-blur-xl border-b border-white/5">
      <div className="min-w-0">
        <h1 className="text-base sm:text-lg font-semibold text-white truncate">{title}</h1>
        <div className="flex items-center gap-2 mt-0.5">
          {subtitle && <p className="hidden sm:block text-xs text-white/40 truncate">{subtitle}</p>}
          <span className="text-[10px] text-white/30">{currentDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="relative hidden lg:flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-white/30" />
          <input
            className="w-52 h-8 pl-8 pr-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors"
            placeholder="Cari..."
          />
        </div>
        <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/10 transition-all">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/10 transition-all">
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>
        <Badge variant="outline" className="hidden md:flex text-[10px] border-indigo-500/30 text-indigo-400 bg-indigo-500/10 px-2 py-0.5">
          Live
        </Badge>
      </div>
    </header>
  );
}
