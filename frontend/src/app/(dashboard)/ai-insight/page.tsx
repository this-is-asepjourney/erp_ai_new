"use client";

import Topbar from "@/components/layout/Topbar";
import { Brain, Send, Sparkles, TrendingUp, Package, DollarSign, Users, RefreshCw, Zap, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { aiApi } from "@/lib/api";
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
  const [refreshKey, setRefreshKey] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { data: inventoryAnalysis, isLoading: loadingInv } = useQuery({
    queryKey: ["ai-inventory", refreshKey],
    queryFn: () => aiApi.inventoryAnalysis().then((r) => r.data),
    retry: 1,
  });

  const { data: salesAnalysis, isLoading: loadingSales } = useQuery({
    queryKey: ["ai-sales", refreshKey],
    queryFn: () => aiApi.salesAnalysis(30).then((r) => r.data),
    retry: 1,
  });

  const { data: financeAnalysis, isLoading: loadingFin } = useQuery({
    queryKey: ["ai-finance", refreshKey],
    queryFn: () => aiApi.financeAnalysis().then((r) => r.data),
    retry: 1,
  });

  const { data: healthCheck, isLoading: loadingHealth } = useQuery({
    queryKey: ["ai-health", refreshKey],
    queryFn: () => aiApi.healthCheck().then((r) => r.data),
    retry: 1,
  });

  const inventoryLowStockCount = inventoryAnalysis?.low_stock_count ?? 0;
  const inventoryLowStockProducts = Array.isArray(inventoryAnalysis?.products)
    ? inventoryAnalysis.products
    : [];
  const inventoryOutOfStockCount = inventoryLowStockProducts.filter(
    (p: any) => Number(p.stock_quantity) <= 0
  ).length;

  const salesTotalOrders = Number(salesAnalysis?.total_orders ?? 0);
  const salesTotalRevenue = Number(salesAnalysis?.total_revenue ?? 0);
  const salesAvgOrderValue = salesTotalOrders > 0 ? salesTotalRevenue / salesTotalOrders : 0;

  const financeIncome = Number(financeAnalysis?.income ?? 0);
  const financeExpense = Number(financeAnalysis?.expense ?? 0);
  const financeProfit = Number(financeAnalysis?.profit ?? 0);
  const financeProfitMargin = financeIncome > 0 ? (financeProfit / financeIncome) * 100 : 0;

  const sendMessage = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { id: Date.now(), role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await aiApi.chat(msg);
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: data.response || data.message || "Maaf, saya tidak dapat memproses permintaan Anda saat ini.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg =
        err?.response?.status === 503
          ? "Layanan AI sedang tidak tersedia. Pastikan API key OpenAI sudah dikonfigurasi."
          : "Terjadi kesalahan saat menghubungi AI. Silakan coba lagi.";
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: errorMsg,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const insightCards = [
    {
      icon: Package,
      title: "Inventory Alert",
      color: "amber",
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
      isLoading: loadingInv,
      items: inventoryAnalysis
        ? [
            {
              label: "Status Stok",
              value: `${inventoryLowStockCount} produk stok rendah`,
              sub: `${inventoryOutOfStockCount} produk habis`,
            },
            {
              label: "Produk Terpantau",
              value: `${inventoryLowStockProducts.length} produk`,
              sub: inventoryAnalysis.status === "warning" ? "Perlu tindakan reorder" : "Kondisi inventori normal",
            },
          ]
        : [
            { label: "Memuat data...", value: "—", sub: "" },
          ],
      suggestion: inventoryAnalysis?.ai_insight || inventoryAnalysis?.message || "Memuat analisis inventori...",
    },
    {
      icon: TrendingUp,
      title: "Sales Insight",
      color: "indigo",
      iconBg: "bg-indigo-500/15",
      iconColor: "text-indigo-400",
      isLoading: loadingSales,
      items: salesAnalysis
        ? [
            {
              label: "Revenue Periode Ini",
              value: formatCurrency(salesTotalRevenue),
              sub: `${salesTotalOrders} total order`,
            },
            {
              label: "Avg Nilai Order",
              value: formatCurrency(salesAvgOrderValue),
              sub: `Periode ${salesAnalysis.period_days ?? 30} hari`,
            },
          ]
        : [{ label: "Memuat data...", value: "—", sub: "" }],
      suggestion: salesAnalysis?.ai_insight || "Memuat analisis penjualan...",
    },
    {
      icon: DollarSign,
      title: "Finance Health",
      color: "emerald",
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      isLoading: loadingFin,
      items: financeAnalysis
        ? [
            {
              label: "Profit Margin",
              value: `${financeProfitMargin.toFixed(1)}%`,
              sub: `Income: ${formatCurrency(financeIncome)}`,
            },
            {
              label: "Net Profit",
              value: formatCurrency(financeProfit),
              sub: `Expense: ${formatCurrency(financeExpense)}`,
            },
          ]
        : [{ label: "Memuat data...", value: "—", sub: "" }],
      suggestion: financeAnalysis?.ai_insight || "Memuat analisis keuangan...",
    },
    {
      icon: Users,
      title: "HR Analytics",
      color: "violet",
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-400",
      isLoading: loadingHealth,
      items: healthCheck
        ? [
            {
              label: "Ringkasan Kondisi",
              value: `${healthCheck.sales?.total_orders ?? 0} order / 30 hari`,
              sub: `${healthCheck.inventory?.low_stock_count ?? 0} produk stok rendah`,
            },
            {
              label: "Profit Bulan Ini",
              value: formatCurrency(Number(healthCheck.finance?.profit ?? 0)),
              sub: `Income ${formatCurrency(Number(healthCheck.finance?.income ?? 0))} - Expense ${formatCurrency(Number(healthCheck.finance?.expense ?? 0))}`,
            },
          ]
        : [{ label: "Memuat data...", value: "—", sub: "" }],
      suggestion: healthCheck?.overall_insight || "Memuat analisis kesehatan perusahaan...",
    },
  ];

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
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="ml-auto flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {insightCards.map((card) => (
              <div key={card.title} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${card.iconBg}`}>
                    {card.isLoading
                      ? <Loader2 className={`w-4 h-4 ${card.iconColor} animate-spin`} />
                      : <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                    }
                  </div>
                  <h4 className="text-sm font-semibold text-white">{card.title}</h4>
                </div>
                <div className="space-y-2 mb-3">
                  {card.items.map((item, i) => (
                    <div key={i} className="flex items-start justify-between gap-2">
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
                    disabled={loading}
                    className="shrink-0 text-[10px] px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.08] transition-all whitespace-nowrap disabled:opacity-40"
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
