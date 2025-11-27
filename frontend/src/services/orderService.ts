import { authService } from './authService';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'https://lms-deploy-backend.vercel.app/api';

function getHeaders(hasJson = true) {
  const token = authService.getToken();
  return {
    ...(hasJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function createOrder(payload: any) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function getMyOrders() {
  const res = await fetch(`${API_BASE}/orders/my`, {
    method: 'GET',
    headers: getHeaders(true)
  });
  return res.json();
}

export default { createOrder, getMyOrders };
