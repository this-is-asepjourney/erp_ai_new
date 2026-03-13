"use client";

import Topbar from "@/components/layout/Topbar";
import { StatCard } from "@/components/ui/stat-card";
import { Users, UserCheck, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { hrApi } from "@/lib/api";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const DEPT_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6"];

export default function HRPage() {
  const { data: employeesData, isLoading: loadingEmp } = useQuery({
    queryKey: ["employees"],
    queryFn: () => hrApi.employees({ page_size: 200 }).then((r) => r.data),
  });

  const { data: departmentsData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => hrApi.departments().then((r) => r.data),
  });

  const { data: attendancesData } = useQuery({
    queryKey: ["attendances-recent"],
    queryFn: () => hrApi.attendances({ page_size: 200 }).then((r) => r.data),
  });

  const { data: payrollsData } = useQuery({
    queryKey: ["payrolls"],
    queryFn: () => hrApi.payrolls({ page_size: 100 }).then((r) => r.data),
  });

  const employees = employeesData?.results ?? [];
  const totalEmployees = employeesData?.count ?? 0;
  const departments = departmentsData?.results ?? departmentsData ?? [];
  const attendances = attendancesData?.results ?? [];
  const payrolls = payrollsData?.results ?? [];

  const activeEmployees = useMemo(
    () => employees.filter((e: any) => e.status === "active").length,
    [employees]
  );

  const totalPayroll = useMemo(
    () => payrolls.reduce((sum: number, p: any) => sum + parseFloat(p.net_salary || p.gross_salary || 0), 0),
    [payrolls]
  );

  // Attendance chart: group by date/day (status mengikuti enum backend)
  const attendanceWeek = useMemo(() => {
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const map: Record<string, { day: string; hadir: number; tidak_hadir: number; izin: number }> = {};
    attendances.forEach((a: any) => {
      const date = new Date(a.date || a.created_at);
      const key = dayNames[date.getDay()];
      if (!map[key]) map[key] = { day: key, hadir: 0, tidak_hadir: 0, izin: 0 };
      if (a.status === "present") map[key].hadir++;
      else if (a.status === "absent" || a.status === "late" || a.status === "half_day") map[key].tidak_hadir++;
      else if (a.status === "leave") map[key].izin++;
    });
    if (Object.keys(map).length === 0) {
      return ["Sen", "Sel", "Rab", "Kam", "Jum"].map((day) => ({ day, hadir: 0, tidak_hadir: 0, izin: 0 }));
    }
    return Object.values(map).slice(-5);
  }, [attendances]);

  const deptData = useMemo(() => {
    const map: Record<string, number> = {};
    employees.forEach((e: any) => {
      const dept = e.department_name || "Lainnya";
      map[dept] = (map[dept] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, count], i) => ({ name, count, color: DEPT_COLORS[i % DEPT_COLORS.length] }));
  }, [employees]);

  const presentToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return attendances.filter((a: any) => a.date === today && a.status === "present").length;
  }, [attendances]);

  return (
    <div className="min-h-screen">
      <Topbar title="Human Resources" subtitle="Kelola karyawan, kehadiran, penggajian, dan performa" />

      <div className="p-6 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Karyawan" value={String(totalEmployees)} icon={Users} iconBg="bg-indigo-500/15" iconColor="text-indigo-400" />
          <StatCard title="Karyawan Aktif" value={String(activeEmployees)} icon={UserCheck} iconBg="bg-emerald-500/15" iconColor="text-emerald-400" />
          <StatCard title="Total Payroll" value={formatCurrency(totalPayroll)} icon={DollarSign} iconBg="bg-violet-500/15" iconColor="text-violet-400" />
          <StatCard title="Departemen" value={String(departments.length || deptData.length)} icon={TrendingUp} iconBg="bg-amber-500/15" iconColor="text-amber-400" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Attendance Chart */}
          <div className="xl:col-span-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white">Kehadiran Minggu Ini</h3>
              <p className="text-xs text-white/30 mt-0.5">Hadir, tidak hadir, dan izin per hari</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceWeek} barGap={2} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f1729", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} />
                <Bar dataKey="hadir" name="Hadir" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tidak_hadir" name="Tidak Hadir" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="izin" name="Izin" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dept Distribution */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white">Distribusi Departemen</h3>
              <p className="text-xs text-white/30 mt-0.5">Jumlah karyawan per divisi</p>
            </div>
            {deptData.length === 0 ? (
              <div className="text-center py-8 text-white/20 text-sm">
                {loadingEmp ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Belum ada data"}
              </div>
            ) : (
              <div className="space-y-3">
                {deptData.map((dept) => (
                  <div key={dept.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dept.color }} />
                        <span className="text-[11px] text-white/50">{dept.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-white/70">{dept.count} orang</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(dept.count / Math.max(totalEmployees, 1)) * 100}%`, background: dept.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Employee Table */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="p-5 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white">Daftar Karyawan</h3>
            <p className="text-xs text-white/30 mt-0.5">{totalEmployees} karyawan terdaftar</p>
          </div>
          <div className="overflow-x-auto">
            {loadingEmp ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-12 text-white/20 text-sm">Belum ada karyawan terdaftar</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {["ID", "Nama", "Jabatan", "Departemen", "Gaji", "Tgl Masuk", "Status"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp: any) => (
                    <tr key={emp.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5 text-xs font-mono text-indigo-400/80">{emp.employee_id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {(emp.full_name || emp.first_name || "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-white/80">{emp.full_name || `${emp.first_name} ${emp.last_name}`}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-white/50">{emp.position}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-white/40 border border-white/[0.06]">
                          {emp.department_name || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-white/70">{formatCurrency(parseFloat(emp.salary || 0))}</td>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
