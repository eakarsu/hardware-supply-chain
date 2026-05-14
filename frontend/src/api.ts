const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Parts
  getParts: () => apiFetch('/parts'),
  getPart: (id: number) => apiFetch(`/parts/${id}`),
  createPart: (data: unknown) => apiFetch('/parts', { method: 'POST', body: JSON.stringify(data) }),
  updatePart: (id: number, data: unknown) => apiFetch(`/parts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePart: (id: number) => apiFetch(`/parts/${id}`, { method: 'DELETE' }),

  // Suppliers
  getSuppliers: () => apiFetch('/suppliers'),
  getSupplier: (id: number) => apiFetch(`/suppliers/${id}`),
  createSupplier: (data: unknown) => apiFetch('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (id: number, data: unknown) => apiFetch(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSupplier: (id: number) => apiFetch(`/suppliers/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => apiFetch('/orders'),
  getOrder: (id: number) => apiFetch(`/orders/${id}`),
  createOrder: (data: unknown) => apiFetch('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrder: (id: number, data: unknown) => apiFetch(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOrder: (id: number) => apiFetch(`/orders/${id}`, { method: 'DELETE' }),

  // Iterations
  getIterations: () => apiFetch('/iterations'),
  getIteration: (id: number) => apiFetch(`/iterations/${id}`),
  createIteration: (data: unknown) => apiFetch('/iterations', { method: 'POST', body: JSON.stringify(data) }),
  updateIteration: (id: number, data: unknown) => apiFetch(`/iterations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteIteration: (id: number) => apiFetch(`/iterations/${id}`, { method: 'DELETE' }),

  // Quality
  getQuality: () => apiFetch('/quality'),
  getQualityCheck: (id: number) => apiFetch(`/quality/${id}`),
  createQualityCheck: (data: unknown) => apiFetch('/quality', { method: 'POST', body: JSON.stringify(data) }),
  updateQualityCheck: (id: number, data: unknown) => apiFetch(`/quality/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQualityCheck: (id: number) => apiFetch(`/quality/${id}`, { method: 'DELETE' }),

  // Manufacturers
  getManufacturers: () => apiFetch('/manufacturers'),
  getManufacturer: (id: number) => apiFetch(`/manufacturers/${id}`),
  createManufacturer: (data: unknown) => apiFetch('/manufacturers', { method: 'POST', body: JSON.stringify(data) }),
  updateManufacturer: (id: number, data: unknown) => apiFetch(`/manufacturers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteManufacturer: (id: number) => apiFetch(`/manufacturers/${id}`, { method: 'DELETE' }),

  // AI
  aiLeadTimePrediction: (data: unknown) => apiFetch('/ai/lead-time-prediction', { method: 'POST', body: JSON.stringify(data) }),
  aiSupplierRecommendation: (data: unknown) => apiFetch('/ai/supplier-recommendation', { method: 'POST', body: JSON.stringify(data) }),
  aiBottleneckAnalysis: (data: unknown) => apiFetch('/ai/bottleneck-analysis', { method: 'POST', body: JSON.stringify(data) }),
  aiCostOptimization: (data: unknown) => apiFetch('/ai/cost-optimization', { method: 'POST', body: JSON.stringify(data) }),

  // New AI features
  aiSupplierRisk: (data: unknown) => apiFetch('/ai/supplier-risk', { method: 'POST', body: JSON.stringify(data) }),
  aiBomOptimizer: (data: unknown) => apiFetch('/ai/bom-optimizer', { method: 'POST', body: JSON.stringify(data) }),
  aiDefectPredictor: (data: unknown) => apiFetch('/ai/defect-predictor', { method: 'POST', body: JSON.stringify(data) }),
  aiDemandForecast: (data: unknown) => apiFetch('/ai/demand-forecast', { method: 'POST', body: JSON.stringify(data) }),
  aiGeopolitical: (data: unknown) => apiFetch('/ai/geopolitical-analyzer', { method: 'POST', body: JSON.stringify(data) }),

  // Search
  search: (params: Record<string, string>) => apiFetch('/search?' + new URLSearchParams(params).toString()),

  // Dashboard
  getDashboardStats: () => apiFetch('/dashboard/stats'),

  // Audit log
  getAuditLog: (params: Record<string, string> = {}) => apiFetch('/audit?' + new URLSearchParams(params).toString()),
  logAudit: (data: unknown) => apiFetch('/audit', { method: 'POST', body: JSON.stringify(data) }),

  // CSV export (returns CSV text + triggers download via blob)
  exportCsv: async (entity: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/export/${entity}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${entity}-${Date.now()}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  },
};
