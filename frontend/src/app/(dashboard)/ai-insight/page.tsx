"use client";

import Topbar from "@/components/layout/Topbar";
import { Brain, Send, Sparkles, TrendingUp, Package, DollarSign, Users, RefreshCw, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  "Bagaimana kondisi keuangan bulan ini?",
  "Produk mana yang akan habis stoknya?",
  "Analisa performa sales 30 hari terakhir",
  "Rekomendasikan supplier terbaik untuk reorder",
  "Apakah perusahaan sehat secara finansial?",
  "Karyawan mana yang perlu perhatian khusus?",
];

const aiInsightCards = [
  {
    icon: Package,
    title: "Inventory Alert",
    color: "amber",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/20",
    items: [
      { label: "Laptop ASUS A14", value: "Stok kritis: 3 unit", sub: "Estimasi habis: 5 hari" },
      { label: "Kabel HDMI 2m", value: "Stok kritis: 6 unit", sub: "Reorder: 100 unit" },
    ],
    suggestion: "Segera lakukan reorder untuk 2 produk kritis sebelum kehabisan stok.",
  },
  {
    icon: TrendingUp,
    title: "Sales Insight",
    color: "indigo",
    iconBg: "bg-indigo-500/15",
    iconColor: "text-indigo-400",
    borderColor: "border-indigo-500/20",
    items: [
      { label: "Revenue Bulan Ini", value: formatCurrency(847_500_000), sub: "+12.4% dari bulan lalu" },
      { label: "Order Baru", value: "342 order", sub: "+8.1% growth rate" },
    ],
    suggestion: "Tren positif! Fokuskan pada segmen Elektronik yang tumbuh 18% bulan ini.",
  },
  {
    icon: DollarSign,
    title: "Finance Health",
    color: "emerald",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/20",
    items: [
      { label: "Profit Margin", value: "63.2%", sub: "+3.1% dari target" },
      { label: "Cash Position", value: formatCurrency(2_400_000_000), sub: "Likuiditas sangat sehat" },
    ],
    suggestion: "Kondisi keuangan sangat baik. Pertimbangkan ekspansi atau investasi aset baru.",
  },
  {
    icon: Users,
    title: "HR Analytics",
    color: "violet",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
    borderColor: "border-violet-500/20",
    items: [
      { label: "Tingkat Kehadiran", value: "94.2%", sub: "Di atas standar industri" },
      { label: "Performa Rata-rata", value: "87.4 / 100", sub: "Excellent: 32% karyawan" },
    ],
    suggestion: "4 karyawan perlu program coaching. Turnover risk terdeteksi di divisi Support.",
  },
];

const initialMessages: Message[] = [
  {
    id: 1,
    role: "ai",
    content: "Halo! Saya adalah **ERP AI Assistant** Anda. Saya dapat membantu menganalisis data bisnis, memberikan rekomendasi, dan menjawab pertanyaan seputar inventory, sales, finance, dan HR.\n\nSilakan tanyakan apa saja, atau pilih salah satu pertanyaan cepat di bawah! 🚀",
    timestamp: new Date(),
  },
];

function formatAIContent(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\n/g, "<br/>");
}

export default function AIInsightPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { id: Date.now(), role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Simulate AI response (replace with real API call)
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const mockResponses: Record<string, string> = {
      "kondisi keuangan": "**Analisis Keuangan Bulan Ini:**\n\nRevenue naik **12.4%** menjadi Rp 847.5 juta\nExpense naik **5.6%** menjadi Rp 312 juta\nProfit margin **63.2%** — di atas target 60%\n\n**Rekomendasi:**\n- Cashflow sangat sehat, cocok untuk ekspansi\n- Pertimbangkan investasi aset tetap\n- Monitor biaya operasional yang naik 8%",
      "habis stoknya": "**Produk yang Berpotensi Habis:**\n\n🔴 **Laptop ASUS A14** — 3 unit tersisa, estimasi habis 5 hari\n🔴 **Kabel HDMI 2m** — 6 unit tersisa, estimasi habis 6 hari\n🟡 **Mouse Wireless Pro** — 8 unit, estimasi habis 12 hari\n🟡 **Filter Oli Premium** — 12 unit, estimasi habis 15 hari\n\n**Rekomendasi Reorder:**\n- Laptop ASUS: order 50 unit dari Distributor A\n- Kabel HDMI: order 100 unit dari Supplier C",
      "performa sales": "**Analisis Sales 30 Hari Terakhir:**\n\nTotal Order: **342** (+8.1%)\nRevenue: **Rp 847.5 juta** (+12.4%)\nRata-rata nilai order: **Rp 2.47 juta**\n\n**Top Produk:**\n1. Laptop ASUS A14 — 48 unit\n2. Monitor 24\" — 35 unit\n3. Keyboard Mechanical — 29 unit\n\n**Prediksi bulan depan:** Revenue Rp 920-950 juta (+8-12%)",
      "perusahaan sehat": "**Health Check Perusahaan:**\n\n✅ **Keuangan:** SEHAT — Profit margin 63.2%\n✅ **Inventory:** WASPADA — 4 produk kritis\n✅ **Sales:** SEHAT — Growth +12.4%\n⚠️ **HR:** PERHATIAN — Turnover risk di divisi Support\n\n**Skor Keseluruhan: 82/100 — BAIK**\n\nPerusahaan dalam kondisi sehat. Fokus perbaikan pada manajemen stok dan retensi karyawan.",
    };

    let aiResponse = "Saya telah menganalisis data ERP Anda. Berdasarkan data terkini, semua indikator bisnis dalam kondisi normal. Apakah ada hal spesifik yang ingin Anda ketahui lebih detail?";
    for (const [key, val] of Object.entries(mockResponses)) {
      if (msg.toLowerCase().includes(key)) { aiResponse = val; break; }
    }

    const aiMsg: Message = { id: Date.now() + 1, role: "ai", content: aiResponse, timestamp: new Date() };
    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Topbar title="AI Insight" subtitle="Analisis cerdas berbasis AI untuk keputusan bisnis lebih baik" />

      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 h-[calc(100vh-140px)]">

          {/* Left: AI Insight Cards */}
          <div className="xl:col-span-2 space-y-4 overflow-y-auto pr-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-white">AI Insights Terkini</h3>
              <button className="ml-auto flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {aiInsightCards.map((card) => (
              <div key={card.title} className={`rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 hover:bg-white/[0.04] transition-colors`}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${card.iconBg}`}>
                    <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                  </div>
                  <h4 className="text-sm font-semibold text-white">{card.title}</h4>
                </div>
                <div className="space-y-2 mb-3">
                  {card.items.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-white/50 truncate">{item.label}</p>
                        <p className="text-[10px] text-white/25">{item.sub}</p>
                      </div>
                      <p className="text-xs font-semibold text-white/80 shrink-0 text-right">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <Zap className={`w-3 h-3 mt-0.5 shrink-0 ${card.iconColor}`} />
                  <p className="text-[11px] text-white/50 leading-relaxed">{card.suggestion}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Chat Interface */}
          <div className="xl:col-span-3 flex flex-col rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">ERP AI Assistant</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] text-white/40">Online · Powered by GPT-4o</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "ai" && (
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 mr-2.5 mt-0.5 shrink-0">
                      <Brain className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-500/20 text-white/90 rounded-tr-sm border border-indigo-500/20"
                      : "bg-white/[0.05] text-white/70 rounded-tl-sm border border-white/[0.06]"
                  }`}>
                    <div dangerouslySetInnerHTML={{ __html: formatAIContent(msg.content) }} />
                    <p className="text-[9px] text-white/20 mt-2">
                      {msg.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 mr-2.5 shrink-0">
                    <Brain className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white/[0.05] border border-white/[0.06] px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                          style={{ animation: `bounce 1s ${i * 0.15}s infinite` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 border-t border-white/[0.04]">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="shrink-0 text-[10px] px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.08] transition-all whitespace-nowrap"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-3 p-1 rounded-xl bg-white/[0.05] border border-white/[0.08] focus-within:border-indigo-500/40 transition-colors">
                <input
                  className="flex-1 px-3 py-2 bg-transparent text-sm text-white/80 placeholder-white/20 focus:outline-none"
                  placeholder="Tanyakan sesuatu tentang bisnis Anda..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/25 transition-all mr-1"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
