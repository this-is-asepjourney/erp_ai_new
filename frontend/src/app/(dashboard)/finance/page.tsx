"use client";

import Topbar from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/stat-card";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { mockTransactions, mockRevenueChart } from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";

const cashflowData = [
  { bulan: "Jul", masuk: 186, keluar: 124 }, { bulan: "Agu", masuk: 213, keluar: 141 },
  { bulan: "Sep", masuk: 204, keluar: 155 }, { bulan: "Okt", masuk: 225, keluar: 153 },
  { bulan: "Nov", masuk: 246, keluar: 149 }, { bulan: "Des", masuk: 254, keluar: 156 },
];

const expenseCategories = [
  { name: "Operasional", amount: 85_000_000, percent: 27 },
  { name: "Gaji", amount: 124_000_000, percent: 40 },
  { name: "Marketing", amount: 31_000_000, percent: 10 },
  { name: "Supplier", amount: 48_000_000, percent: 15 },
  { name: "Lainnya", amount: 24_000_000, percent: 8 },
];

const EXPENSE_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c084fc", "#6b7280"];

export default function FinancePage() {
  const income = mockTransactions.filter((t) => t.transaction_type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = mockTransactions.filter((t) => t.transaction_type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen">
      <Topbar title="Finance" subtitle="Analisis keuangan, cashflow, dan laporan transaksi" />

      <div className="p-6 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Pemasukan" value={formatCurrency(847_500_000)} change={12.4} icon={TrendingUp} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" />
          <StatCard title="Total Pengeluaran" value={formatCurrency(312_000_000)} change={5.6} icon={TrendingDown} iconBg="bg-red-500/15" iconColor="text-red-400" />
          <StatCard title="Net Profit" value={formatCurrency(535_500_000)} change={18.2} icon={ArrowUpRight} iconBg="bg-indigo-500/15" iconColor="text-indigo-400" />
          <StatCard title="Profit Margin" value="63.2%" change={3.1} icon={CreditCard} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Cashflow Chart */}
          <div className="xl:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white">Cashflow Bulanan</h3>
              <p className="text-xs text-white/30 mt-0.5">Perbandingan pemasukan vs pengeluaran (juta Rp)</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={cashflowData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="bulan" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} unit="M" />
                <Tooltip contentStyle={{ background: "#0f1729", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                  formatter={(v: any, name: any) => [`Rp ${v}M`, name === "masuk" ? "Pemasukan" : "Pengeluaran"]} />
                <Bar dataKey="masuk" name="masuk" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} fillOpacity={0.8} />
                <Bar dataKey="keluar" name="keluar" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={22} fillOpacity={0.8} />
                <Line type="monotone" dataKey="masuk" stroke="#10b981" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Breakdown */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">Breakdown Pengeluaran</h3>
              <p className="text-xs text-white/30 mt-0.5">Bulan ini</p>
            </div>

            {/* Donut visual */}
            <div className="relative flex justify-center mb-4">
              <div className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{ background: "conic-gradient(#6366f1 0% 27%, #8b5cf6 27% 67%, #a78bfa 67% 77%, #c084fc 77% 92%, #6b7280 92% 100%)" }}>
                <div className="w-20 h-20 rounded-full bg-[#0a0f1e] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{formatCurrency(312_000_000).replace("Rp", "").trim().replace(",00", "")}</p>
                    <p className="text-[9px] text-white/30">Total</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {expenseCategories.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: EXPENSE_COLORS[i] }} />
                  <span className="text-xs text-white/50 flex-1">{item.name}</span>
                  <span className="text-xs text-white/30">{item.percent}%</span>
                  <span className="text-xs font-semibold text-white/70">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="p-5 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white">Riwayat Transaksi</h3>
            <p className="text-xs text-white/30 mt-0.5">Semua transaksi bulan ini</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Referensi", "Tipe", "Deskripsi", "Akun", "Tanggal", "Jumlah"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((trx) => (
                  <tr key={trx.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 text-xs font-mono text-indigo-400/80">{trx.reference}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {trx.transaction_type === "income"
                          ? <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                          : <ArrowDownLeft className="w-3 h-3 text-red-400" />}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusColor(trx.transaction_type)}`}>
                          {trx.transaction_type === "income" ? "Masuk" : "Keluar"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white/60">{trx.description}</td>
                    <td className="px-5 py-3.5 text-xs text-white/40">{trx.account_name}</td>
                    <td className="px-5 py-3.5 text-xs text-white/40">{formatDate(trx.transaction_date)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold ${trx.transaction_type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                        {trx.transaction_type === "income" ? "+" : "-"}{formatCurrency(trx.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
