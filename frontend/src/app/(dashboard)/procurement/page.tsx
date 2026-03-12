"use client";

import Topbar from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/stat-card";
import { ShoppingBag, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { mockPurchaseOrders } from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const supplierPerf = [
  { name: "PT Distributor", onTime: 92, quality: 88 },
  { name: "CV Supplier Jaya", onTime: 78, quality: 82 },
  { name: "Toko Grosir", onTime: 85, quality: 91 },
  { name: "PT Importir", onTime: 95, quality: 94 },
];

const monthlyPO = [
  { bulan: "Jul", total: 12 }, { bulan: "Agu", total: 18 }, { bulan: "Sep", total: 14 },
  { bulan: "Okt", total: 22 }, { bulan: "Nov", total: 19 }, { bulan: "Des", total: 16 },
];

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Clock className="w-3 h-3" />,
  sent: <Truck className="w-3 h-3" />,
  confirmed: <CheckCircle className="w-3 h-3" />,
  received: <CheckCircle className="w-3 h-3" />,
  cancelled: <XCircle className="w-3 h-3" />,
};

export default function ProcurementPage() {
  return (
    <div className="min-h-screen">
      <Topbar title="Procurement" subtitle="Manajemen pembelian, supplier, dan purchase order" />

      <div className="p-6 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="PO Bulan Ini" value="16" change={-14.3} icon={ShoppingBag} iconBg="bg-indigo-500/15" iconColor="text-indigo-400" />
          <StatCard title="Total Nilai PO" value={formatCurrency(485_000_000)} change={8.2} icon={CheckCircle} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" />
          <StatCard title="Menunggu Konfirmasi" value="4" icon={Clock} iconBg="bg-amber-500/15" iconColor="text-amber-400" />
          <StatCard title="Supplier Aktif" value="12" change={1} icon={Truck} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* PO per Bulan */}
          <div className="xl:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white">Purchase Order per Bulan</h3>
              <p className="text-xs text-white/30 mt-0.5">Frekuensi pembelian 6 bulan terakhir</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyPO} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="bulan" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f1729", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} />
                <Bar dataKey="total" name="Jumlah PO" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Supplier Performance */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">Performa Supplier</h3>
              <p className="text-xs text-white/30 mt-0.5">Ketepatan & kualitas</p>
            </div>
            <div className="space-y-4">
              {supplierPerf.map((s) => (
                <div key={s.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/70 truncate flex-1">{s.name}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30 w-16 shrink-0">On-time</span>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${s.onTime}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-indigo-400 w-8 text-right">{s.onTime}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30 w-16 shrink-0">Kualitas</span>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.quality}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400 w-8 text-right">{s.quality}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PO Table */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="p-5 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white">Daftar Purchase Order</h3>
            <p className="text-xs text-white/30 mt-0.5">{mockPurchaseOrders.length} PO aktif</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["No. PO", "Supplier", "Tgl Order", "Tgl Ekspektasi", "Total", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockPurchaseOrders.map((po) => (
                  <tr key={po.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 text-xs font-mono text-indigo-400/80">{po.po_number}</td>
                    <td className="px-5 py-3.5 text-xs text-white/70">{po.supplier_name}</td>
                    <td className="px-5 py-3.5 text-xs text-white/40">{formatDate(po.order_date)}</td>
                    <td className="px-5 py-3.5 text-xs text-white/40">{formatDate(po.expected_date)}</td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-white/80">{formatCurrency(po.total)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border font-medium ${getStatusColor(po.status)}`}>
                          {statusIcons[po.status]}
                          {po.status}
                        </span>
                      </div>
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
