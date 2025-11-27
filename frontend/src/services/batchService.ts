import { authService } from './authService';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

function getHeaders(auth = true) {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(auth && token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function getBatches() {
  const res = await fetch(`${API_BASE}/batches`, {
    method: 'GET',
    headers: getHeaders(false)
  });
  return res.json();
}

export async function createBatch(payload: { year: string; title?: string; description?: string }) {
  const res = await fetch(`${API_BASE}/batches`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function updateBatch(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/batches/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function deleteBatch(id: string) {
  const res = await fetch(`${API_BASE}/batches/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return res.json();
}

export default { getBatches, createBatch, updateBatch, deleteBatch };

