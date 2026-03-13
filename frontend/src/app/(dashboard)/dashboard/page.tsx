"use client";

import Topbar from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, ShoppingCart, Package, Users,
  TrendingDown, AlertTriangle, ArrowUpRight, Loader2, CalendarDays, Activity,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, inventoryApi, salesApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { useMemo } from "react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const CATEGORY_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6"];

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

function LoadingCard() {
  return <div className="h-24 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />;
}

export default function DashboardPage() {
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["products-summary"],
    queryFn: () => inventoryApi.products({ page_size: 100 }).then((r) => r.data),
  });

  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ["orders-summary"],
    queryFn: () => salesApi.orders({ page_size: 10, ordering: "-order_date" }).then((r) => r.data),
  });

  const { data: transactionsData, isLoading: loadingTrx } = useQuery({
    queryKey: ["transactions-summary"],
    queryFn: () => dashboardApi.financeSummary().then((r) => r.data),
  });

  const { data: employeesData, isLoading: loadingEmp } = useQuery({
    queryKey: ["employees-summary"],
    queryFn: () => dashboardApi.hrSummary().then((r) => r.data),
  });

  const products = productsData?.results ?? [];
  const orders = ordersData?.results ?? [];
  const transactions = transactionsData?.results ?? [];
  const totalProducts = productsData?.count ?? 0;
  const totalOrders = ordersData?.count ?? 0;
  const totalEmployees = employeesData?.count ?? 0;

  const lowStockProducts = useMemo(
    () => products.filter((p: any) => p.is_low_stock).slice(0, 5),
    [products]
  );

  const { revenue, expenses, netProfit, revenueChart, categoryChart } = useMemo(() => {
    let rev = 0;
    let exp = 0;
    const monthMap: Record<string, { revenue: number; expense: number; profit: number }> = {};

    transactions.forEach((t: any) => {
      const amt = parseFloat(t.amount) || 0;
      if (t.transaction_type === "income") rev += amt;
      else if (t.transaction_type === "expense") exp += amt;

      const date = new Date(t.transaction_date || t.created_at);
      const key = `${MONTH_NAMES[date.getMonth()]}`;
      if (!monthMap[key]) monthMap[key] = { revenue: 0, expense: 0, profit: 0 };
      if (t.transaction_type === "income") monthMap[key].revenue += amt;
      else if (t.transaction_type === "expense") monthMap[key].expense += amt;
    });

    Object.values(monthMap).forEach((m) => { m.profit = m.revenue - m.expense; });
    const chart = Object.entries(monthMap)
      .slice(-6)
      .map(([month, v]) => ({ month, ...v }));

    // Category chart from products
    const catCount: Record<string, number> = {};
    products.forEach((p: any) => {
      const cat = p.category_name || "Lainnya";
      catCount[cat] = (catCount[cat] || 0) + 1;
    });
    const total = Object.values(catCount).reduce((a, b) => a + b, 0) || 1;
    const catChart = Object.entries(catCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count], i) => ({
        name,
        value: Math.round((count / total) * 100),
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }));

    return { revenue: rev, expenses: exp, netProfit: rev - exp, revenueChart: chart, categoryChart: catChart };
  }, [transactions, products]);

  // Weekly orders chart from last 7 orders
  const salesChart = useMemo(() => {
    const days: Record<string, number> = { Sen: 0, Sel: 0, Rab: 0, Kam: 0, Jum: 0, Sab: 0, Min: 0 };
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    orders.forEach((o: any) => {
      const d = new Date(o.order_date || o.created_at);
      const key = dayNames[d.getDay()];
      days[key] = (days[key] || 0) + 1;
    });
    return Object.entries(days).map(([day, orders]) => ({ day, orders }));
  }, [orders]);

  const profitChange = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;
  const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;
  const lowStockCount = lowStockProducts.length;
  const activeAlerts = lowStockCount + (netProfit < 0 ? 1 : 0);
  const isLoading = loadingProducts || loadingOrders || loadingTrx || loadingEmp;

  return (
    <div className="min-h-screen">
      <Topbar title="Dashboard" subtitle="Ringkasan kondisi bisnis hari ini" />

      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
          <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-cyan-500/10 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-indigo-200/80">Business Pulse</p>
                <h2 className="text-lg sm:text-xl font-semibold text-white mt-1">Kondisi Operasional Hari Ini</h2>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  {isLoading
                    ? "Memuat ringkasan realtime..."
                    : `${totalOrders} order, ${totalProducts} produk aktif, ${totalEmployees} karyawan terdaftar.`}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] border-white/20 text-white/70 bg-white/5">
                Live data
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-xl bg-black/20 border border-white/10 p-2.5">
                <p className="text-[10px] text-white/45">Avg Order</p>
                <p className="text-sm font-semibold text-white mt-1">{formatCurrency(avgOrderValue)}</p>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/10 p-2.5">
                <p className="text-[10px] text-white/45">Margin</p>
                <p className="text-sm font-semibold text-white mt-1">{profitChange}%</p>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/10 p-2.5">
                <p className="text-[10px] text-white/45">Low Stock</p>
                <p className="text-sm font-semibold text-white mt-1">{lowStockCount} item</p>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/10 p-2.5">
                <p className="text-[10px] text-white/45">Alert Aktif</p>
                <p className="text-sm font-semibold text-white mt-1">{activeAlerts}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Quick Insight</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <CalendarDays className="w-3.5 h-3.5 text-white/40 mt-0.5" />
                <p className="text-white/60">Revenue saat ini {netProfit >= 0 ? "masih sehat" : "perlu perhatian"} dengan profit {formatCurrency(netProfit)}.</p>
              </div>
              <div className="flex items-start gap-2">
                <ShoppingCart className="w-3.5 h-3.5 text-white/40 mt-0.5" />
                <p className="text-white/60">{totalOrders} order tercatat, nilai rata-rata per order {formatCurrency(avgOrderValue)}.</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-white/40 mt-0.5" />
                <p className="text-white/60">{lowStockCount === 0 ? "Tidak ada stok kritis saat ini." : `${lowStockCount} produk perlu restock segera.`}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <LoadingCard key={i} />)
          ) : (
            <>
              <StatCard title="Total Revenue" value={formatCurrency(revenue)} icon={DollarSign} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" />
              <StatCard title="Total Orders" value={String(totalOrders)} icon={ShoppingCart} iconBg="bg-indigo-500/15" iconColor="text-indigo-400" />
              <StatCard title="Total Produk" value={String(totalProducts)} icon={Package} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
              <StatCard title="Karyawan" value={String(totalEmployees)} icon={Users} iconBg="bg-cyan-500/15" iconColor="text-cyan-400" />
              <StatCard title="Total Biaya" value={formatCurrency(expenses)} icon={TrendingDown} iconBg="bg-amber-500/15" iconColor="text-amber-400" />
              <StatCard title="Net Profit" value={formatCurrency(netProfit)} icon={ArrowUpRight} iconBg="bg-rose-500/15" iconColor="text-rose-400" />
            </>
          )}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
          <div className="xl:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Revenue vs Expense</h3>
                <p className="text-xs text-white/30 mt-0.5">6 bulan terakhir</p>
              </div>
              {profitChange > 0 && (
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  +{profitChange}% Margin
                </Badge>
              )}
            </div>
            {revenueChart.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-white/20 text-sm">
                Belum ada data transaksi
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueChart}>
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
            )}
          </div>

          {/* Category Pie */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white">Produk per Kategori</h3>
              <p className="text-xs text-white/30 mt-0.5">Distribusi inventori</p>
            </div>
            {categoryChart.length === 0 ? (
              <div className="h-[160px] flex items-center justify-center text-white/20 text-sm">
                Belum ada produk
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={categoryChart} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                      {categoryChart.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "#0f1729", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {categoryChart.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                        <span className="text-white/50">{item.name}</span>
                      </div>
                      <span className="text-white font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
          {/* Weekly Sales Bar */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white">Order Minggu Ini</h3>
              <p className="text-xs text-white/30 mt-0.5">Per hari</p>
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={salesChart} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f1729", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} />
                <Bar dataKey="orders" name="Orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stock Alerts */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Peringatan Stok</h3>
                <p className="text-xs text-white/30 mt-0.5">Stok mendekati batas minimum</p>
              </div>
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/15">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-6 text-white/20 text-sm">
                {loadingProducts ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Semua stok normal"}
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.stock_quantity <= 3 ? "bg-red-400" : "bg-amber-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/80 truncate">{item.name}</p>
                      <p className="text-[10px] text-white/30">{item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${item.stock_quantity <= 3 ? "text-red-400" : "text-amber-400"}`}>
                        {item.stock_quantity} unit
                      </p>
                      <p className="text-[10px] text-white/20">min. {item.minimum_stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Order Terbaru</h3>
                <p className="text-xs text-white/30 mt-0.5">{orders.length} order terakhir</p>
              </div>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-6 text-white/20 text-sm">
                {loadingOrders ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Belum ada order"}
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order: any) => (
                  <div key={order.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/80 truncate">{order.customer_name}</p>
                      <p className="text-[10px] text-white/30">{order.order_number} • {formatDate(order.order_date || order.created_at)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs font-semibold text-white">{formatCurrency(parseFloat(order.total))}</p>
                      <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
