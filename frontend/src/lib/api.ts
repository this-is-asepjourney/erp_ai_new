import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh/`, { refresh });
          localStorage.setItem("access_token", data.access);
          error.config.headers.Authorization = `Bearer ${data.access}`;
          return api.request(error.config);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login/", { email, password }),
  me: () => api.get("/users/me/"),
};

// ── Dashboard (mock summary endpoints) ───────────────────
export const dashboardApi = {
  inventorySummary: () => api.get("/inventory/products/"),
  salesSummary: () => api.get("/sales/orders/"),
  financeSummary: () => api.get("/finance/transactions/"),
  hrSummary: () => api.get("/hr/employees/"),
};

// ── Inventory ─────────────────────────────────────────────
export const inventoryApi = {
  products: (params?: object) => api.get("/inventory/products/", { params }),
  product: (id: number) => api.get(`/inventory/products/${id}/`),
  createProduct: (data: object) => api.post("/inventory/products/", data),
  updateProduct: (id: number, data: object) => api.patch(`/inventory/products/${id}/`, data),
  deleteProduct: (id: number) => api.delete(`/inventory/products/${id}/`),
  categories: () => api.get("/inventory/categories/"),
  suppliers: (params?: object) => api.get("/inventory/suppliers/", { params }),
  warehouses: () => api.get("/inventory/warehouses/"),
  stockMovements: (params?: object) => api.get("/inventory/stock-movements/", { params }),
};

// ── Sales ─────────────────────────────────────────────────
export const salesApi = {
  orders: (params?: object) => api.get("/sales/orders/", { params }),
  order: (id: number) => api.get(`/sales/orders/${id}/`),
  customers: (params?: object) => api.get("/sales/customers/", { params }),
  invoices: (params?: object) => api.get("/sales/invoices/", { params }),
};

// ── Finance ───────────────────────────────────────────────
export const financeApi = {
  transactions: (params?: object) => api.get("/finance/transactions/", { params }),
  accounts: () => api.get("/finance/accounts/"),
  expenses: (params?: object) => api.get("/finance/expenses/", { params }),
};

// ── Procurement ───────────────────────────────────────────
export const procurementApi = {
  purchaseOrders: (params?: object) => api.get("/procurement/purchase-orders/", { params }),
  purchaseInvoices: (params?: object) => api.get("/procurement/purchase-invoices/", { params }),
};

// ── HR ────────────────────────────────────────────────────
export const hrApi = {
  employees: (params?: object) => api.get("/hr/employees/", { params }),
  departments: () => api.get("/hr/departments/"),
  attendances: (params?: object) => api.get("/hr/attendances/", { params }),
  payrolls: (params?: object) => api.get("/hr/payrolls/", { params }),
  performances: (params?: object) => api.get("/hr/performances/", { params }),
};

// ── AI Engine ─────────────────────────────────────────────
export const aiApi = {
  inventoryAnalysis: () => api.get("/ai/analyze/inventory/"),
  salesAnalysis: (days = 30) => api.get("/ai/analyze/sales/", { params: { days } }),
  financeAnalysis: (month?: number, year?: number) =>
    api.get("/ai/analyze/finance/", { params: { month, year } }),
  healthCheck: () => api.get("/ai/health-check/"),
  reorderRecommendation: (productId: number) =>
    api.get(`/ai/recommend/reorder/${productId}/`),
  supplierRecommendation: (productId: number) =>
    api.get(`/ai/recommend/supplier/${productId}/`),
  chat: (message: string) => api.post("/ai/assistant/", { message }),
};
