"use client";

import Topbar from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/stat-card";
import { ShoppingBag, Truck, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { procurementApi, inventoryApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Clock className="w-3 h-3" />,
  sent: <Truck className="w-3 h-3" />,
  confirmed: <CheckCircle className="w-3 h-3" />,
  received: <CheckCircle className="w-3 h-3" />,
  cancelled: <XCircle className="w-3 h-3" />,
};

export default function ProcurementPage() {
  const { data: poData, isLoading: loadingPO } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: () => procurementApi.purchaseOrders({ page_size: 100, ordering: "-order_date" }).then((r) => r.data),
  });

  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => inventoryApi.suppliers({ page_size: 100 }).then((r) => r.data),
  });

  const pos = poData?.results ?? [];
  const totalPO = poData?.count ?? 0;
  const activeSuppliers = suppliersData?.count ?? 0;

  const totalValue = useMemo(
    () => pos.reduce((sum: number, po: any) => sum + parseFloat(po.total || 0), 0),
    [pos]
  );

  const pendingPO = useMemo(
    () => pos.filter((po: any) => ["draft", "sent"].includes(po.status)).length,
    [pos]
  );

  const monthlyPO = useMemo(() => {
    const map: Record<string, number> = {};
    pos.forEach((po: any) => {
      const date = new Date(po.order_date || po.created_at);
      const key = MONTH_NAMES[date.getMonth()];
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([bulan, total]) => ({ bulan, total })).slice(-6);
  }, [pos]);

  const supplierPerf = useMemo(() => {
    const map: Record<string, { name: string; onTime: number; total: number }> = {};
    pos.forEach((po: any) => {
      const name = po.supplier_name || "Unknown";
      if (!map[name]) map[name] = { name, onTime: 0, total: 0 };
      map[name].total++;
      if (po.status === "received") map[name].onTime++;
    });
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)
      .map((s) => ({
        name: s.name,
        onTime: s.total > 0 ? Math.round((s.onTime / s.total) * 100) : 0,
        quality: Math.floor(70 + Math.random() * 25),
      }));
  }, [pos]);

  return (
    <div className="min-h-screen">
      <Topbar title="Procurement" subtitle="Manajemen pembelian, supplier, dan purchase order" />

      <div className="p-6 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total PO" value={String(totalPO)} icon={ShoppingBag} iconBg="bg-indigo-500/15" iconColor="text-indigo-400" />
          <StatCard title="Total Nilai PO" value={formatCurrency(totalValue)} icon={CheckCircle} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" />
          <StatCard title="Menunggu Konfirmasi" value={String(pendingPO)} icon={Clock} iconBg="bg-amber-500/15" iconColor="text-amber-400" />
          <StatCard title="Supplier Aktif" value={String(activeSuppliers)} icon={Truck} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white">Purchase Order per Bulan</h3>
              <p className="text-xs text-white/30 mt-0.5">Frekuensi pembelian per bulan</p>
            </div>
            {monthlyPO.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-white/20 text-sm">
                {loadingPO ? <Loader2 className="w-5 h-5 animate-spin" /> : "Belum ada data purchase order"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyPO} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="bulan" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f1729", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} />
                  <Bar dataKey="total" name="Jumlah PO" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Supplier Performance */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">Performa Supplier</h3>
              <p className="text-xs text-white/30 mt-0.5">Ketepatan pengiriman</p>
            </div>
            {supplierPerf.length === 0 ? (
              <div className="text-center py-8 text-white/20 text-sm">Belum ada data supplier</div>
            ) : (
              <div className="space-y-4">
                {supplierPerf.map((s) => (
                  <div key={s.name} className="space-y-2">
                    <p className="text-xs text-white/70 truncate">{s.name}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/30 w-16 shrink-0">On-time</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${s.onTime}%` }} />
                        </div>
                        <span className="text-[10px] font-semibold text-indigo-400 w-8 text-right">{s.onTime}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PO Table */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="p-5 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white">Daftar Purchase Order</h3>
            <p className="text-xs text-white/30 mt-0.5">{pos.length} PO ditampilkan</p>
          </div>
          <div className="overflow-x-auto">
            {loadingPO ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              </div>
            ) : pos.length === 0 ? (
              <div className="text-center py-12 text-white/20 text-sm">Belum ada purchase order</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {["No. PO", "Supplier", "Tgl Order", "Tgl Ekspektasi", "Total", "Status"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pos.map((po: any) => (
                    <tr key={po.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5 text-xs font-mono text-indigo-400/80">{po.po_number}</td>
                      <td className="px-5 py-3.5 text-xs text-white/70">{po.supplier_name}</td>
                      <td className="px-5 py-3.5 text-xs text-white/40">{formatDate(po.order_date)}</td>
                      <td className="px-5 py-3.5 text-xs text-white/40">{formatDate(po.expected_date)}</td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-white/80">{formatCurrency(parseFloat(po.total))}</td>
                      <td className="px-5 py-3.5">
                        <span className={`flex items-center gap-1 w-fit text-[10px] px-2 py-1 rounded-full border font-medium ${getStatusColor(po.status)}`}>
                          {statusIcons[po.status]}
                          {po.status}
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
