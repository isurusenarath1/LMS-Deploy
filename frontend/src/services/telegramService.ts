import { authService } from './authService';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'https://lms-deploy-backend.vercel.app/api';

function getHeaders() {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  } as any;
}

export async function listPublicChannels() {
  const res = await fetch(`${API_BASE}/telegram`, { method: 'GET' });
  return res.json();
}

export async function listAdminChannels() {
  const res = await fetch(`${API_BASE}/admin/telegram`, { method: 'GET', headers: getHeaders() });
  return res.json();
}

export async function createChannel(payload: { name: string; description?: string; link: string; meta?: any }) {
  const res = await fetch(`${API_BASE}/admin/telegram`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
  return res.json();
}

export async function updateChannel(id: string, payload: { name?: string; description?: string; link?: string; meta?: any }) {
  const res = await fetch(`${API_BASE}/admin/telegram/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
  return res.json();
}

export async function deleteChannel(id: string) {
  const res = await fetch(`${API_BASE}/admin/telegram/${id}`, { method: 'DELETE', headers: getHeaders() });
  return res.json();
}

const defaultExport: any = {
  listPublicChannels,
  listAdminChannels,
  createChannel,
  updateChannel,
  deleteChannel
};

export default defaultExport;
