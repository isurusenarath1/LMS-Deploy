import { authService } from './authService';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'https://lms-deploy-backend.vercel.app/api';

function getHeaders() {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function listOrders(params?: Record<string,string>) {
  const qs = params ? '?' + Object.entries(params).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : '';
  const res = await fetch(`${API_BASE}/admin/orders${qs}`, { method: 'GET', headers: getHeaders() });
  return res.json();
}

export async function getOrder(id: string) {
  const res = await fetch(`${API_BASE}/admin/orders/${id}`, { method: 'GET', headers: getHeaders() });
  return res.json();
}

export async function updateOrder(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/admin/orders/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
  return res.json();
}

export async function deleteOrder(id: string) {
  const res = await fetch(`${API_BASE}/admin/orders/${id}`, { method: 'DELETE', headers: getHeaders() });
  return res.json();
}
export async function listPayments(params?: Record<string,string>) {
  const qs = params ? '?' + Object.entries(params).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : '';
  const res = await fetch(`${API_BASE}/admin/payments${qs}`, { method: 'GET', headers: getHeaders() });
  return res.json();
}

export async function confirmPayment(id: string, payload?: any) {
  const res = await fetch(`${API_BASE}/admin/payments/${id}/confirm`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload || {}) });
  return res.json();
}

export default { listOrders, getOrder, updateOrder, deleteOrder, listPayments, confirmPayment };
