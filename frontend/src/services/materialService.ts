import { authService } from './authService';

import { API_BASE } from '../config';

function getHeaders(json = true) {
  const token = authService.getToken();
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function getMaterials() {
  const res = await fetch(`${API_BASE}/materials`, { method: 'GET', headers: getHeaders(false) });
  return res.json();
}

export async function getMaterial(id: string) {
  const res = await fetch(`${API_BASE}/materials/${id}`, { method: 'GET', headers: getHeaders(false) });
  return res.json();
}

export async function uploadMaterial(payload: FormData) {
  const token = authService.getToken();
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/materials`, { method: 'POST', headers, body: payload });
  return res.json();
}

export async function deleteMaterial(id: string) {
  // Use headers without forcing Content-Type for DELETE
  const res = await fetch(`${API_BASE}/materials/${id}`, { method: 'DELETE', headers: getHeaders(false) });
  return res.json();
}

export async function updateMaterial(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/materials/${id}`, { method: 'PUT', headers: getHeaders(true), body: JSON.stringify(payload) });
  return res.json();
}

export default { getMaterials, getMaterial, uploadMaterial, deleteMaterial, updateMaterial };
