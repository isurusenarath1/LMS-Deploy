import { authService } from './authService';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'https://lms-deploy-backend.vercel.app/api';

function getHeaders(hasJson = true) {
  const token = authService.getToken();
  return {
    ...(hasJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function sendMessage(payload: any) {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function listMessages() {
  const res = await fetch(`${API_BASE}/admin/contacts`, { method: 'GET', headers: getHeaders(true) });
  return res.json();
}

export async function deleteMessage(id: string) {
  const res = await fetch(`${API_BASE}/admin/contacts/${id}`, { method: 'DELETE', headers: getHeaders(true) });
  return res.json();
}

export async function markRead(id: string) {
  const res = await fetch(`${API_BASE}/admin/contacts/${id}/read`, { method: 'PUT', headers: getHeaders(true) });
  return res.json();
}

export default { sendMessage, listMessages, deleteMessage, markRead };
