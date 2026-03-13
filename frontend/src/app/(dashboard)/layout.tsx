'use client';

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="relative flex min-h-screen overflow-hidden bg-[#050a16]">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: "url('/nexus-dashboard-bg.png')" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050a16]/75 via-[#060b18]/85 to-[#060b18]" />

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar
          isMobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />

        <div className="relative z-10 flex-1 flex flex-col min-h-screen lg:ml-64">
          {/* Mobile top bar */}
          <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#060b18]/75 backdrop-blur-sm lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">ERP AI</span>
              <span className="text-[11px] text-white/40">Enterprise Dashboard</span>
            </div>
          </header>

          <main className="flex-1 min-h-screen px-2 sm:px-4 md:px-6 py-3 sm:py-4">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
