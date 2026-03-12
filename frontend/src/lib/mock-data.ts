// Mock data for development / demo purposes when backend is not connected

export const mockKPIs = {
  revenue: { value: 847_500_000, change: 12.4, trend: "up" },
  orders: { value: 342, change: 8.1, trend: "up" },
  inventory: { value: 1248, change: -3.2, trend: "down" },
  employees: { value: 87, change: 2.3, trend: "up" },
  expenses: { value: 312_000_000, change: 5.6, trend: "up" },
  profit: { value: 535_500_000, change: 18.2, trend: "up" },
};

export const mockRevenueChart = [
  { month: "Jul", revenue: 620000000, expense: 280000000, profit: 340000000 },
  { month: "Agu", revenue: 710000000, expense: 295000000, profit: 415000000 },
  { month: "Sep", revenue: 680000000, expense: 310000000, profit: 370000000 },
  { month: "Okt", revenue: 750000000, expense: 305000000, profit: 445000000 },
  { month: "Nov", revenue: 820000000, expense: 298000000, profit: 522000000 },
  { month: "Des", revenue: 847500000, expense: 312000000, profit: 535500000 },
];

export const mockSalesChart = [
  { day: "Sen", orders: 42 }, { day: "Sel", orders: 58 }, { day: "Rab", orders: 51 },
  { day: "Kam", orders: 63 }, { day: "Jum", orders: 71 }, { day: "Sab", orders: 38 },
  { day: "Min", orders: 19 },
];

export const mockCategoryChart = [
  { name: "Elektronik", value: 35, color: "#6366f1" },
  { name: "Otomotif", value: 25, color: "#8b5cf6" },
  { name: "Rumah Tangga", value: 20, color: "#a78bfa" },
  { name: "Fashion", value: 12, color: "#c4b5fd" },
  { name: "Lainnya", value: 8, color: "#ddd6fe" },
];

export const mockStockAlerts = [
  { id: 1, sku: "ELC-001", name: "Laptop ASUS A14", stock: 3, minimum: 10, status: "critical" },
  { id: 2, sku: "OTM-042", name: "Filter Oli Premium", stock: 8, minimum: 15, status: "low" },
  { id: 3, sku: "ELC-078", name: "Mouse Wireless Pro", stock: 12, minimum: 20, status: "low" },
  { id: 4, sku: "ACC-019", name: "Kabel HDMI 2m", stock: 6, minimum: 25, status: "critical" },
];

export const mockRecentOrders = [
  { id: "SO-2024-001", customer: "PT Maju Jaya", total: 12500000, status: "delivered", date: "2024-12-10" },
  { id: "SO-2024-002", customer: "CV Berkah Abadi", total: 8750000, status: "processing", date: "2024-12-11" },
  { id: "SO-2024-003", customer: "Toko Sejahtera", total: 4200000, status: "confirmed", date: "2024-12-11" },
  { id: "SO-2024-004", customer: "PT Global Tech", total: 28900000, status: "shipped", date: "2024-12-12" },
  { id: "SO-2024-005", customer: "UD Makmur", total: 6300000, status: "draft", date: "2024-12-12" },
];

export const mockProducts = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  sku: `PRD-${String(i + 1).padStart(3, "0")}`,
  name: ["Laptop ASUS A14", "Mouse Wireless Pro", "Keyboard Mechanical", "Monitor 24\"", "SSD 1TB",
    "RAM DDR5 16GB", "GPU RTX 4060", "Motherboard B650", "Power Supply 650W", "CPU Cooler 360",
    "Webcam HD 1080p", "USB Hub 7-port", "Headset Gaming", "Chair Ergonomic", "Desk Mat XL",
    "Router WiFi 6", "Smart Switch 8-port", "NAS 4-bay", "UPS 1500VA", "KVM Switch"][i],
  category: ["Elektronik", "Aksesori", "Elektronik", "Elektronik", "Storage"][i % 5],
  stock: Math.floor(Math.random() * 100) + 2,
  minimum: 10,
  price: Math.floor(Math.random() * 5000000) + 500000,
  supplier: ["Distributor A", "Distributor B", "Supplier C"][i % 3],
  is_low_stock: Math.random() > 0.7,
}));

export const mockEmployees = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  employee_id: `EMP-${String(i + 1).padStart(3, "0")}`,
  full_name: ["Ahmad Fauzi", "Siti Rahma", "Budi Santoso", "Dewi Lestari", "Reza Pratama",
    "Fitriani Dewi", "Hendra Wijaya", "Indah Permata", "Joko Susilo", "Kartini Ayu",
    "Lukman Hakim", "Maya Sari"][i],
  position: ["Backend Dev", "Frontend Dev", "Manager", "HRD", "Accounting",
    "Sales", "Ops", "Designer", "DevOps", "Marketing", "Finance", "Support"][i],
  department: ["Engineering", "Engineering", "Management", "HR", "Finance",
    "Sales", "Operations", "Design", "Engineering", "Marketing", "Finance", "Support"][i],
  salary: (Math.floor(Math.random() * 10) + 5) * 1_000_000,
  status: i < 10 ? "active" : "inactive",
  hire_date: `202${Math.floor(i / 4)}-0${(i % 12) + 1}-15`,
}));

export const mockTransactions = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  reference: `TRX-${String(i + 1).padStart(4, "0")}`,
  transaction_type: i % 3 === 0 ? "expense" : "income",
  amount: Math.floor(Math.random() * 50000000) + 1000000,
  description: ["Penjualan produk", "Biaya operasional", "Pembayaran supplier",
    "Pendapatan jasa", "Gaji karyawan"][i % 5],
  transaction_date: `2024-12-${String(Math.min(i + 1, 28)).padStart(2, "0")}`,
  account_name: ["Kas Utama", "Bank BCA", "Bank Mandiri"][i % 3],
}));

export const mockPurchaseOrders = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  po_number: `PO-2024-${String(i + 1).padStart(3, "0")}`,
  supplier_name: ["PT Distributor Utama", "CV Supplier Jaya", "Toko Grosir Besar"][i % 3],
  status: ["draft", "sent", "confirmed", "received", "cancelled"][i % 5],
  total: Math.floor(Math.random() * 100000000) + 5000000,
  order_date: `2024-12-${String(Math.min(i + 1, 28)).padStart(2, "0")}`,
  expected_date: `2025-01-${String(Math.min(i + 5, 28)).padStart(2, "0")}`,
}));
