"use client";

import { Bell, Search, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-white/5">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden md:flex items-center">
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
