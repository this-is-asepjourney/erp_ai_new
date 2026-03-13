"use client";

import Topbar from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/stat-card";
import { ShoppingCart, Users, FileText, DollarSign, Loader2 } from "lucide-react";
import { salesApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const ORDER_STATUS_COLORS: Record<string, string> = {
  draft: "#6b7280",
  confirmed: "#3b82f6",
  processing: "#f59e0b",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export default function SalesPage() {
  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ["sales-orders"],
    queryFn: () => salesApi.orders({ page_size: 100, ordering: "-order_date" }).then((r) => r.data),
  });

  const { data: customersData, isLoading: loadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => salesApi.customers({ page_size: 1 }).then((r) => r.data),
  });

  const { data: invoicesData } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => salesApi.invoices({ page_size: 100 }).then((r) => r.data),
  });

  const orders = ordersData?.results ?? [];
  const totalOrders = ordersData?.count ?? 0;
  const totalCustomers = customersData?.count ?? 0;

  const totalRevenue = useMemo(
    () => orders.reduce((sum: number, o: any) => sum + parseFloat(o.total || 0), 0),
    [orders]
  );

  const statusDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o: any) => {
      map[o.status] = (map[o.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      rawStatus: status,
      count,
      color: ORDER_STATUS_COLORS[status] || "#6b7280",
    }));
  }, [orders]);

  const revenueChart = useMemo(() => {
    const monthMap: Record<string, number> = {};
    orders.forEach((o: any) => {
      const date = new Date(o.order_date || o.created_at);
      const key = MONTH_NAMES[date.getMonth()];
      monthMap[key] = (monthMap[key] || 0) + parseFloat(o.total || 0);
    });
    return Object.entries(monthMap).map(([month, revenue]) => ({ month, revenue }));
  }, [orders]);

  const topCustomers = useMemo(() => {
    const map: Record<string, { name: string; orders: number; revenue: number }> = {};
    orders.forEach((o: any) => {
      const name = o.customer_name || "Unknown";
      if (!map[name]) map[name] = { name, orders: 0, revenue: 0 };
      map[name].orders += 1;
      map[name].revenue += parseFloat(o.total || 0);
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  const invoiceStatusDist = useMemo(() => {
    const invoices = invoicesData?.results ?? [];
    const total = invoices.length || 1;
    const paid = invoices.filter((i: any) => i.status === "paid").length;
    const unpaid = invoices.filter((i: any) => i.status === "unpaid").length;
    const partial = invoices.filter((i: any) => i.status === "partial").length;
    const overdue = invoices.filter((i: any) => i.status === "overdue").length;
    return [
      { name: "Paid", value: Math.round((paid / total) * 100), color: "#10b981" },
      { name: "Unpaid", value: Math.round((unpaid / total) * 100), color: "#ef4444" },
      { name: "Partial", value: Math.round((partial / total) * 100), color: "#3b82f6" },
      { name: "Overdue", value: Math.round((overdue / total) * 100), color: "#f59e0b" },
    ];
  }, [invoicesData]);

  const unpaidInvoices = useMemo(
    () => (invoicesData?.results ?? []).filter((i: any) => i.status !== "paid").length,
    [invoicesData]
  );

  return (
    <div className="min-h-screen">
      <Topbar title="Sales" subtitle="Kelola order, pelanggan, dan invoice penjualan" />

      <div className="p-6 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Order" value={String(totalOrders)} icon={ShoppingCart} iconBg="bg-indigo-500/15" iconColor="text-indigo-400" />
          <StatCard title="Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" />
          <StatCard title="Total Pelanggan" value={String(totalCustomers)} icon={Users} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
          <StatCard title="Invoice Belum Bayar" value={String(unpaidInvoices)} icon={FileText} iconBg="bg-amber-500/15" iconColor="text-amber-400" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white">Tren Revenue Bulanan</h3>
              <p className="text-xs text-white/30 mt-0.5">Dari semua order</p>
            </div>
            {revenueChart.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-white/20 text-sm">
                {loadingOrders ? <Loader2 className="w-5 h-5 animate-spin" /> : "Belum ada data order"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f1729", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} formatter={(v: any) => formatCurrency(v)} />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Order by Status */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">Status Order</h3>
              <p className="text-xs text-white/30 mt-0.5">Distribusi semua order</p>
            </div>
            {statusDistribution.length === 0 ? (
              <div className="text-center py-6 text-white/20 text-sm">Belum ada order</div>
            ) : (
              <div className="space-y-3">
                {statusDistribution.map((item) => (
                  <div key={item.status} className="flex items-center gap-3">
                    <span className="text-[10px] text-white/40 w-24 shrink-0">{item.status}</span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(item.count / Math.max(totalOrders, 1)) * 100}%`, background: item.color }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-white/70 w-8 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-white/[0.06]">
              <p className="text-xs font-semibold text-white/60 mb-3">Status Invoice</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {invoiceStatusDist.map((item) => (
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
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="p-5 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white">Order Terbaru</h3>
              <p className="text-xs text-white/30 mt-0.5">Semua order masuk</p>
            </div>
            <div className="overflow-x-auto">
              {loadingOrders ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10 text-white/20 text-sm">Belum ada order</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      {["No. Order", "Pelanggan", "Total", "Status", "Tanggal"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map((order: any) => (
                      <tr key={order.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="px-5 py-3.5 text-xs font-mono text-indigo-400/80">{order.order_number}</td>
                        <td className="px-5 py-3.5 text-xs text-white/70">{order.customer_name}</td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-white/80">{formatCurrency(parseFloat(order.total))}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[9px] px-2 py-1 rounded-full border font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-white/40">{formatDate(order.order_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Top Customers */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="p-5 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white">Top Pelanggan</h3>
              <p className="text-xs text-white/30 mt-0.5">Berdasarkan revenue</p>
            </div>
            <div className="p-5 space-y-4">
              {topCustomers.length === 0 ? (
                <div className="text-center py-6 text-white/20 text-sm">Belum ada data pelanggan</div>
              ) : topCustomers.map((customer, i) => (
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
                          style={{ width: `${(customer.revenue / (topCustomers[0]?.revenue || 1)) * 100}%` }}
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
