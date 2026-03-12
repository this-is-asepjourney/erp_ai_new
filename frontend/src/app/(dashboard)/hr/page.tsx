"use client";

import Topbar from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/stat-card";
import { Users, UserCheck, DollarSign, TrendingUp, Award } from "lucide-react";
import { mockEmployees } from "@/lib/mock-data";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import {
  RadialBarChart, RadialBar, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const deptData = [
  { name: "Engineering", count: 22, color: "#6366f1" },
  { name: "Sales", count: 18, color: "#8b5cf6" },
  { name: "Finance", count: 12, color: "#10b981" },
  { name: "HR", count: 8, color: "#f59e0b" },
  { name: "Operations", count: 15, color: "#3b82f6" },
  { name: "Design", count: 7, color: "#ec4899" },
  { name: "Marketing", count: 5, color: "#14b8a6" },
];

const attendanceWeek = [
  { day: "Sen", hadir: 82, sakit: 3, izin: 2 },
  { day: "Sel", hadir: 80, sakit: 4, izin: 3 },
  { day: "Rab", hadir: 85, sakit: 2, izin: 0 },
  { day: "Kam", hadir: 81, sakit: 3, izin: 3 },
  { day: "Jum", hadir: 78, sakit: 5, izin: 4 },
];

const performanceData = [
  { name: "Excellent", value: 28, color: "#10b981" },
  { name: "Good", value: 42, color: "#6366f1" },
  { name: "Average", value: 13, color: "#f59e0b" },
  { name: "Below Avg", value: 4, color: "#ef4444" },
];

export default function HRPage() {
  return (
    <div className="min-h-screen">
      <Topbar title="Human Resources" subtitle="Kelola karyawan, kehadiran, penggajian, dan performa" />

      <div className="p-6 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Karyawan" value="87" change={2.3} icon={Users} iconBg="bg-indigo-500/15" iconColor="text-indigo-400" />
          <StatCard title="Hadir Hari Ini" value="82" change={1.2} icon={UserCheck} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" />
          <StatCard title="Total Payroll" value={formatCurrency(485_000_000)} change={4.1} icon={DollarSign} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
          <StatCard title="Avg Performa" value="87.4" suffix="/ 100" change={2.8} icon={TrendingUp} iconBg="bg-amber-500/15" iconColor="text-amber-400" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Attendance Chart */}
          <div className="xl:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white">Kehadiran Minggu Ini</h3>
              <p className="text-xs text-white/30 mt-0.5">Hadir, sakit, dan izin per hari</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceWeek} barGap={2} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f1729", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} />
                <Bar dataKey="hadir" name="Hadir" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sakit" name="Sakit" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="izin" name="Izin" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Distribution */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">Distribusi Performa</h3>
              <p className="text-xs text-white/30 mt-0.5">Penilaian Q4 2024</p>
            </div>
            <div className="space-y-3">
              {performanceData.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60">{item.name}</span>
                    <span className="text-xs font-semibold text-white/80">{item.value} orang</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(item.value / 87) * 100}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Dept distribution */}
            <div className="mt-5 pt-4 border-t border-white/[0.06]">
              <p className="text-xs font-semibold text-white/60 mb-3">Per Departemen</p>
              <div className="space-y-2">
                {deptData.slice(0, 4).map((dept) => (
                  <div key={dept.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dept.color }} />
                    <span className="text-[11px] text-white/50 flex-1">{dept.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(dept.count / 87) * 100}%`, background: dept.color }} />
                      </div>
                      <span className="text-[11px] text-white/40 w-5">{dept.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="p-5 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white">Daftar Karyawan</h3>
            <p className="text-xs text-white/30 mt-0.5">{mockEmployees.length} karyawan terdaftar</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["ID", "Nama", "Jabatan", "Departemen", "Gaji", "Tgl Masuk", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 text-xs font-mono text-indigo-400/80">{emp.employee_id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {emp.full_name.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-white/80">{emp.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white/50">{emp.position}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-white/40 border border-white/[0.06]">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-white/70">{formatCurrency(emp.salary)}</td>
                    <td className="px-5 py-3.5 text-xs text-white/40">{emp.hire_date}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${getStatusColor(emp.status)}`}>
                        {emp.status}
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
