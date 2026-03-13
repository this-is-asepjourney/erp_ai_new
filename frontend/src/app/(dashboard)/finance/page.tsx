"use client";

import Topbar from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/stat-card";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { financeApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const EXPENSE_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c084fc", "#6b7280"];

export default function FinancePage() {
  const { data: transactionsData, isLoading: loadingTrx } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => financeApi.transactions({ page_size: 200, ordering: "-transaction_date" }).then((r) => r.data),
  });

  const { data: expensesData } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => financeApi.expenses({ page_size: 100 }).then((r) => r.data),
  });

  const transactions = transactionsData?.results ?? [];
  const expenses = expensesData?.results ?? [];

  const { income, expense, netProfit, profitMargin } = useMemo(() => {
    let inc = 0, exp = 0;
    transactions.forEach((t: any) => {
      const amt = parseFloat(t.amount) || 0;
      if (t.transaction_type === "income") inc += amt;
      else if (t.transaction_type === "expense") exp += amt;
    });
    const profit = inc - exp;
    const margin = inc > 0 ? (profit / inc) * 100 : 0;
    return { income: inc, expense: exp, netProfit: profit, profitMargin: margin.toFixed(1) };
  }, [transactions]);

  const cashflowData = useMemo(() => {
    const monthMap: Record<string, { bulan: string; masuk: number; keluar: number }> = {};
    transactions.forEach((t: any) => {
      const date = new Date(t.transaction_date || t.created_at);
      const key = MONTH_NAMES[date.getMonth()];
      if (!monthMap[key]) monthMap[key] = { bulan: key, masuk: 0, keluar: 0 };
      const amt = Math.round((parseFloat(t.amount) || 0) / 1_000_000);
      if (t.transaction_type === "income") monthMap[key].masuk += amt;
      else if (t.transaction_type === "expense") monthMap[key].keluar += amt;
    });
    return Object.values(monthMap).slice(-6);
  }, [transactions]);

  const expenseBreakdown = useMemo(() => {
    const catMap: Record<string, number> = {};
    expenses.forEach((e: any) => {
      const cat = e.category || "Lainnya";
      catMap[cat] = (catMap[cat] || 0) + parseFloat(e.amount || 0);
    });
    const total = Object.values(catMap).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: Math.round((amount / total) * 100),
      }));
  }, [expenses]);

  return (
    <div className="min-h-screen">
      <Topbar title="Finance" subtitle="Analisis keuangan, cashflow, dan laporan transaksi" />

      <div className="p-6 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Pemasukan" value={formatCurrency(income)} icon={TrendingUp} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" />
          <StatCard title="Total Pengeluaran" value={formatCurrency(expense)} icon={TrendingDown} iconBg="bg-red-500/15" iconColor="text-red-400" />
          <StatCard title="Net Profit" value={formatCurrency(netProfit)} icon={ArrowUpRight} iconBg="bg-indigo-500/15" iconColor="text-indigo-400" />
          <StatCard title="Profit Margin" value={`${profitMargin}%`} icon={CreditCard} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white">Cashflow Bulanan</h3>
              <p className="text-xs text-white/30 mt-0.5">Perbandingan pemasukan vs pengeluaran (juta Rp)</p>
            </div>
            {cashflowData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-white/20 text-sm">
                {loadingTrx ? <Loader2 className="w-5 h-5 animate-spin" /> : "Belum ada data transaksi"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={cashflowData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="bulan" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} unit="M" />
                  <Tooltip
                    contentStyle={{ background: "#0f1729", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }}
                    formatter={(v: any, name: any) => [`Rp ${v}M`, name === "masuk" ? "Pemasukan" : "Pengeluaran"]}
                  />
                  <Bar dataKey="masuk" name="masuk" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} fillOpacity={0.8} />
                  <Bar dataKey="keluar" name="keluar" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={22} fillOpacity={0.8} />
                  <Line type="monotone" dataKey="masuk" stroke="#10b981" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Expense Breakdown */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">Breakdown Pengeluaran</h3>
              <p className="text-xs text-white/30 mt-0.5">Semua kategori</p>
            </div>

            {expenseBreakdown.length === 0 ? (
              <div className="text-center py-8 text-white/20 text-sm">Belum ada data pengeluaran</div>
            ) : (
              <>
                <div className="relative flex justify-center mb-4">
                  <div
                    className="w-28 h-28 rounded-full flex items-center justify-center"
                    style={{
                      background: expenseBreakdown.length > 0
                        ? `conic-gradient(${expenseBreakdown.reduce((acc, item, i) => {
                            const prev = expenseBreakdown.slice(0, i).reduce((s, x) => s + x.percent, 0);
                            return acc + `${EXPENSE_COLORS[i % EXPENSE_COLORS.length]} ${prev}% ${prev + item.percent}%,`;
                          }, "").slice(0, -1)})`
                        : "#1a1f35"
                    }}
                  >
                    <div className="w-20 h-20 rounded-full bg-[#0a0f1e] flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">{formatCurrency(expense).replace("Rp", "").trim()}</p>
                        <p className="text-[9px] text-white/30">Total</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {expenseBreakdown.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }} />
                      <span className="text-xs text-white/50 flex-1">{item.name}</span>
                      <span className="text-xs text-white/30">{item.percent}%</span>
                      <span className="text-xs font-semibold text-white/70">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="p-5 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white">Riwayat Transaksi</h3>
            <p className="text-xs text-white/30 mt-0.5">{transactions.length} transaksi terakhir</p>
          </div>
          <div className="overflow-x-auto">
            {loadingTrx ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-white/20 text-sm">Belum ada transaksi</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {["Referensi", "Tipe", "Deskripsi", "Akun", "Tanggal", "Jumlah"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((trx: any) => (
                    <tr key={trx.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5 text-xs font-mono text-indigo-400/80">{trx.reference}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {trx.transaction_type === "income" && <ArrowUpRight className="w-3 h-3 text-emerald-400" />}
                          {trx.transaction_type === "expense" && <ArrowDownLeft className="w-3 h-3 text-red-400" />}
                          {trx.transaction_type === "transfer" && <ArrowDownLeft className="w-3 h-3 text-amber-400" />}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusColor(trx.transaction_type)}`}>
                            {trx.transaction_type === "income"
                              ? "Masuk"
                              : trx.transaction_type === "expense"
                                ? "Keluar"
                                : "Transfer"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-white/60 max-w-[200px] truncate">{trx.description}</td>
                      <td className="px-5 py-3.5 text-xs text-white/40">{trx.account_name}</td>
                      <td className="px-5 py-3.5 text-xs text-white/40">{formatDate(trx.transaction_date)}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-bold ${
                            trx.transaction_type === "income"
                              ? "text-emerald-400"
                              : trx.transaction_type === "expense"
                                ? "text-red-400"
                                : "text-amber-400"
                          }`}
                        >
                          {trx.transaction_type === "income"
                            ? `+${formatCurrency(parseFloat(trx.amount))}`
                            : trx.transaction_type === "expense"
                              ? `-${formatCurrency(parseFloat(trx.amount))}`
                              : formatCurrency(parseFloat(trx.amount))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
