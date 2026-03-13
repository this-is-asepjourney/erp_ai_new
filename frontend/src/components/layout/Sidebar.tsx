"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getUser, logout } from "@/lib/auth";
import { authApi } from "@/lib/api";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  ShoppingBag,
  Users,
  Brain,
  Settings,
  LogOut,
  ChevronRight,
  Zap,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/finance", label: "Finance", icon: DollarSign },
  { href: "/procurement", label: "Procurement", icon: ShoppingBag },
  { href: "/hr", label: "Human Resources", icon: Users },
  { href: "/ai-insight", label: "AI Insight", icon: Brain, highlight: true },
];

interface UserInfo {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const cached = getUser();
    if (cached) {
      setUser(cached);
    } else {
      authApi.me().then(({ data }) => {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      }).catch(() => {});
    }
  }, []);

  const displayName = user
    ? (user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.username || "User")
    : "Loading...";
  const displayEmail = user?.email || "";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#0a0f1e] border-r border-white/5 transition-transform duration-200 ease-out",
        "lg:static lg:h-auto lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm tracking-wide">ERP AI</p>
          <p className="text-[10px] text-indigo-400/80 font-medium uppercase tracking-widest">Enterprise Suite</p>
        </div>
        <button
          type="button"
          className="lg:hidden inline-flex items-center justify-center rounded-lg p-1.5 text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
          onClick={onMobileClose}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-semibold text-white/20 uppercase tracking-widest">
          Menu Utama
        </p>
        {navItems.map(({ href, label, icon: Icon, highlight }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-indigo-500/20 text-indigo-300 shadow-sm"
                  : "text-white/50 hover:text-white/90 hover:bg-white/5",
                highlight && !active && "text-violet-400/70 hover:text-violet-300"
              )}
            >
              <Icon className={cn(
                "w-4 h-4 shrink-0",
                active ? "text-indigo-400" : highlight ? "text-violet-400" : "text-white/30 group-hover:text-white/60"
              )} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 text-indigo-400/60" />}
              {highlight && !active && (
                <span className="text-[9px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-semibold border border-violet-500/20">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-white/5 pt-4 space-y-0.5">
        <Link
          href="/settings"
          onClick={onMobileClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/80 hover:bg-white/5 transition-all"
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan</span>
        </Link>
        <button
          onClick={() => {
            logout();
            onMobileClose?.();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 pt-3 mt-2 border-t border-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/80 truncate">{displayName}</p>
            <p className="text-[10px] text-white/30 truncate">{displayEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
