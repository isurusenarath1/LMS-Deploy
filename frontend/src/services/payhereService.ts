import { authService } from './authService';
import { API_BASE } from '../config';

function getHeaders() {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function createCheckout(orderId: string, opts?: { return_url?: string, cancel_url?: string }) {
  const res = await fetch(`${API_BASE}/payhere/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ orderId, ...opts })
  });
  return res.json();
}

export default { createCheckout };
