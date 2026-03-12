"use client";

import Topbar from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/stat-card";
import { ShoppingCart, Users, FileText, DollarSign, TrendingUp } from "lucide-react";
import { mockRecentOrders, mockSalesChart, mockRevenueChart } from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const statusOrders = [
  { status: "Draft", count: 12, color: "#6b7280" },
  { status: "Confirmed", count: 48, color: "#3b82f6" },
  { status: "Processing", count: 27, color: "#f59e0b" },
  { status: "Shipped", count: 31, color: "#8b5cf6" },
  { status: "Delivered", count: 198, color: "#10b981" },
  { status: "Cancelled", count: 26, color: "#ef4444" },
];

const topCustomers = [
  { name: "PT Global Tech", orders: 42, revenue: 125_000_000 },
  { name: "CV Berkah Abadi", orders: 35, revenue: 98_500_000 },
  { name: "Toko Sejahtera", orders: 28, revenue: 67_200_000 },
  { name: "PT Maju Jaya", orders: 22, revenue: 54_800_000 },
  { name: "UD Makmur", orders: 18, revenue: 41_300_000 },
];

const invoiceStatus = [
  { name: "Paid", value: 68, color: "#10b981" },
  { name: "Unpaid", value: 22, color: "#ef4444" },
  { name: "Overdue", value: 10, color: "#f59e0b" },
];

export default function SalesPage() {
  return (
    <div className="min-h-screen">
      <Topbar title="Sales" subtitle="Kelola order, pelanggan, dan invoice penjualan" />

      <div className="p-6 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Order (Bln)" value="342" change={8.1} icon={ShoppingCart} iconBg="bg-indigo-500/15" iconColor="text-indigo-400" />
          <StatCard title="Revenue (Bln)" value={formatCurrency(847_500_000)} change={12.4} icon={DollarSign} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" />
          <StatCard title="Total Pelanggan" value="186" change={4.2} icon={Users} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
          <StatCard title="Invoice Belum Bayar" value="22" icon={FileText} iconBg="bg-amber-500/15" iconColor="text-amber-400" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Trend Revenue */}
          <div className="xl:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white">Tren Revenue Bulanan</h3>
              <p className="text-xs text-white/30 mt-0.5">6 bulan terakhir</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockRevenueChart}>
                <defs>
                  <linearGradient id="revLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f1729", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} formatter={(v: any) => formatCurrency(v)} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order by Status */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">Status Order</h3>
              <p className="text-xs text-white/30 mt-0.5">Distribusi bulan ini</p>
            </div>
            <div className="space-y-3">
              {statusOrders.map((item) => (
                <div key={item.status} className="flex items-center gap-3">
                  <span className="text-[10px] text-white/40 w-20 shrink-0">{item.status}</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(item.count / 342) * 100}%`, background: item.color }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-white/70 w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>

            {/* Invoice Status */}
            <div className="mt-5 pt-4 border-t border-white/[0.06]">
              <p className="text-xs font-semibold text-white/60 mb-3">Status Invoice</p>
              <div className="grid grid-cols-3 gap-2">
                {invoiceStatus.map((item) => (
                  <div key={item.name} className="text-center p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                    <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}%</p>
                    <p className="text-[9px] text-white/30 mt-0.5">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Recent Orders */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="p-5 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white">Order Terbaru</h3>
              <p className="text-xs text-white/30 mt-0.5">Semua order masuk</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {["No. Order", "Pelanggan", "Total", "Status", "Tanggal"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockRecentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5 text-xs font-mono text-indigo-400/80">{order.id}</td>
                      <td className="px-5 py-3.5 text-xs text-white/70">{order.customer}</td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-white/80">{formatCurrency(order.total)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[9px] px-2 py-1 rounded-full border font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-white/40">{formatDate(order.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Customers */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="p-5 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white">Top Pelanggan</h3>
              <p className="text-xs text-white/30 mt-0.5">Berdasarkan revenue bulan ini</p>
            </div>
            <div className="p-5 space-y-4">
              {topCustomers.map((customer, i) => (
                <div key={customer.name} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.05] text-xs font-bold text-white/50">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/80 truncate">{customer.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                          style={{ width: `${(customer.revenue / topCustomers[0].revenue) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-white/80">{formatCurrency(customer.revenue)}</p>
                    <p className="text-[10px] text-white/30">{customer.orders} order</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
