"use client";

import Topbar from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, ShoppingCart, Package, Users,
  TrendingDown, AlertTriangle, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  mockKPIs, mockRevenueChart, mockSalesChart,
  mockCategoryChart, mockStockAlerts, mockRecentOrders,
} from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f1729] border border-white/10 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-white/60 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/50">{p.name}:</span>
          <span className="text-white font-semibold">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Topbar title="Dashboard" subtitle="Ringkasan kondisi bisnis hari ini" />

      <div className="p-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Total Revenue" value={formatCurrency(mockKPIs.revenue.value)} change={mockKPIs.revenue.change} icon={DollarSign} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" />
          <StatCard title="Total Orders" value={String(mockKPIs.orders.value)} change={mockKPIs.orders.change} icon={ShoppingCart} iconBg="bg-indigo-500/15" iconColor="text-indigo-400" />
          <StatCard title="Total Produk" value={String(mockKPIs.inventory.value)} change={mockKPIs.inventory.change} icon={Package} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
          <StatCard title="Karyawan" value={String(mockKPIs.employees.value)} change={mockKPIs.employees.change} icon={Users} iconBg="bg-cyan-500/15" iconColor="text-cyan-400" />
          <StatCard title="Total Biaya" value={formatCurrency(mockKPIs.expenses.value)} change={mockKPIs.expenses.change} icon={TrendingDown} iconBg="bg-amber-500/15" iconColor="text-amber-400" />
          <StatCard title="Net Profit" value={formatCurrency(mockKPIs.profit.value)} change={mockKPIs.profit.change} icon={ArrowUpRight} iconBg="bg-rose-500/15" iconColor="text-rose-400" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Revenue vs Expense Area Chart */}
          <div className="xl:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Revenue vs Expense</h3>
                <p className="text-xs text-white/30 mt-0.5">6 bulan terakhir</p>
              </div>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                +{mockKPIs.profit.change}% Profit
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={mockRevenueChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2} fill="url(#colorExpense)" />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Pie */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white">Penjualan per Kategori</h3>
              <p className="text-xs text-white/30 mt-0.5">Distribusi bulan ini</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={mockCategoryChart} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                  {mockCategoryChart.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "#0f1729", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {mockCategoryChart.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-white/50">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Weekly Sales Bar */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white">Order Minggu Ini</h3>
              <p className="text-xs text-white/30 mt-0.5">Per hari</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={mockSalesChart} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f1729", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} />
                <Bar dataKey="orders" name="Orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stock Alerts */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Peringatan Stok</h3>
                <p className="text-xs text-white/30 mt-0.5">Stok mendekati batas minimum</p>
              </div>
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/15">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>
            <div className="space-y-3">
              {mockStockAlerts.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.status === "critical" ? "bg-red-400" : "bg-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/80 truncate">{item.name}</p>
                    <p className="text-[10px] text-white/30">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${item.status === "critical" ? "text-red-400" : "text-amber-400"}`}>
                      {item.stock} unit
                    </p>
                    <p className="text-[10px] text-white/20">min. {item.minimum}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Order Terbaru</h3>
                <p className="text-xs text-white/30 mt-0.5">5 order terakhir</p>
              </div>
            </div>
            <div className="space-y-3">
              {mockRecentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/80 truncate">{order.customer}</p>
                    <p className="text-[10px] text-white/30">{order.id}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs font-semibold text-white">{formatCurrency(order.total)}</p>
                    <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
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
