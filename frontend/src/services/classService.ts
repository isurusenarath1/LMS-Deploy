import { authService } from './authService';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

function getHeaders(auth = true) {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(auth && token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function getClasses() {
  const res = await fetch(`${API_BASE}/classes`, {
    method: 'GET',
    headers: getHeaders(false)
  });
  return res.json();
}

export async function createClass(payload: any) {
  const res = await fetch(`${API_BASE}/classes`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function getClass(id: string) {
  const res = await fetch(`${API_BASE}/classes/${id}`, {
    method: 'GET',
    headers: getHeaders(true)
  });
  return res.json();
}

export async function getMyClasses() {
  const res = await fetch(`${API_BASE}/users/classes`, {
    method: 'GET',
    headers: getHeaders(true)
  });
  return res.json();
}

export async function updateClass(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/classes/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function deleteClass(id: string) {
  const res = await fetch(`${API_BASE}/classes/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return res.json();
}

export default { getClasses, createClass, getClass, updateClass, deleteClass, getMyClasses };

