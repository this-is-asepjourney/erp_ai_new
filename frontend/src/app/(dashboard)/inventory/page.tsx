"use client";

import Topbar from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/stat-card";
import { Package, AlertTriangle, TrendingDown, Warehouse, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { inventoryApi } from "@/lib/api";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c084fc", "#d8b4fe", "#10b981", "#f59e0b"];

export default function InventoryPage() {
  const [search, setSearch] = useState("");

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => inventoryApi.products({ page_size: 100, search }).then((r) => r.data),
    staleTime: 10_000,
  });

  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => inventoryApi.warehouses().then((r) => r.data),
  });

  const products = productsData?.results ?? [];
  const totalProducts = productsData?.count ?? 0;
  const warehouseCount = warehousesData?.count ?? warehousesData?.length ?? 0;

  const lowStockProducts = useMemo(() => products.filter((p: any) => p.is_low_stock), [products]);
  const outOfStock = useMemo(() => products.filter((p: any) => p.stock_quantity === 0), [products]);

  const stockData = useMemo(() => {
    const catMap: Record<string, number> = {};
    products.forEach((p: any) => {
      const cat = p.category_name || "Lainnya";
      catMap[cat] = (catMap[cat] || 0) + (p.stock_quantity || 0);
    });
    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, stock]) => ({ category, stock }));
  }, [products]);

  return (
    <div className="min-h-screen">
      <Topbar title="Inventory" subtitle="Kelola produk, stok, dan pergerakan barang" />

      <div className="p-6 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Produk" value={String(totalProducts)} icon={Package} iconBg="bg-indigo-500/15" iconColor="text-indigo-400" />
          <StatCard title="Stok Rendah" value={String(lowStockProducts.length)} icon={AlertTriangle} iconBg="bg-amber-500/15" iconColor="text-amber-400" />
          <StatCard title="Produk Habis" value={String(outOfStock.length)} icon={TrendingDown} iconBg="bg-red-500/15" iconColor="text-red-400" />
          <StatCard title="Gudang Aktif" value={String(warehouseCount)} icon={Warehouse} iconBg="bg-cyan-500/15" iconColor="text-cyan-400" />
        </div>

        {/* Charts + Alerts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white">Stok per Kategori</h3>
              <p className="text-xs text-white/30 mt-0.5">Distribusi stok saat ini</p>
            </div>
            {stockData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-white/20 text-sm">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Belum ada data produk"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stockData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="category" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f1729", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} />
                  <Bar dataKey="stock" name="Stok" radius={[6, 6, 0, 0]}>
                    {stockData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Stock Alerts */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Peringatan Stok</h3>
            </div>
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-white/20 text-sm">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Semua stok normal ✓"}
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-semibold text-white/90">{item.name}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{item.sku}</p>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${item.stock_quantity === 0 ? getStatusColor("critical") : getStatusColor("low")}`}>
                        {item.stock_quantity === 0 ? "Habis" : "Rendah"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.stock_quantity === 0 ? "bg-red-500" : "bg-amber-500"}`}
                          style={{ width: `${Math.min((item.stock_quantity / (item.minimum_stock || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white/40 shrink-0">{item.stock_quantity}/{item.minimum_stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-semibold text-white">Daftar Produk</h3>
              <p className="text-xs text-white/30 mt-0.5">{products.length} produk ditampilkan</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input
                  className="w-48 h-8 pl-8 pr-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  placeholder="Cari produk atau SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white/80 transition-all">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-white/20 text-sm">Tidak ada produk ditemukan</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {["SKU", "Nama Produk", "Kategori", "Supplier", "Stok", "Harga Jual", "Status"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono text-indigo-400/80">{product.sku}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-medium text-white/80">{product.name}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-white/40">{product.category_name || "-"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-white/40">{product.supplier_name || "-"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${product.stock_quantity <= 3 ? "text-red-400" : product.stock_quantity <= (product.minimum_stock || 10) ? "text-amber-400" : "text-emerald-400"}`}>
                            {product.stock_quantity}
                          </span>
                          <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${product.stock_quantity <= 3 ? "bg-red-500" : product.stock_quantity <= (product.minimum_stock || 10) ? "bg-amber-500" : "bg-emerald-500"}`}
                              style={{ width: `${Math.min((product.stock_quantity / Math.max(product.minimum_stock * 3, 30)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold text-white/70">{formatCurrency(parseFloat(product.selling_price || 0))}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${product.is_low_stock ? getStatusColor("low") : getStatusColor("active")}`}>
                          {product.stock_quantity === 0 ? "Habis" : product.is_low_stock ? "Stok Rendah" : "Normal"}
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
