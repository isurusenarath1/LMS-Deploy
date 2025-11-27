import { authService } from './authService';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'https://lms-deploy-backend.vercel.app/api';

function getHeaders(auth = true) {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(auth && token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function getCourses(year?: string, month?: string) {
  const params: string[] = []
  if (year) params.push(`year=${encodeURIComponent(year)}`)
  if (month) params.push(`month=${encodeURIComponent(month)}`)
  const url = params.length ? `${API_BASE}/courses?${params.join('&')}` : `${API_BASE}/courses`
  const res = await fetch(url, { method: 'GET', headers: getHeaders(true) })
  return res.json()
}

export async function getCourse(id: string) {
  const res = await fetch(`${API_BASE}/courses/${id}`, {
    method: 'GET',
    headers: getHeaders(true)
  });
  return res.json();
}

export async function createCourse(payload: any) {
  const res = await fetch(`${API_BASE}/courses`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function updateCourse(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/courses/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function deleteCourse(id: string) {
  const res = await fetch(`${API_BASE}/courses/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return res.json();
}

export default { getCourses, getCourse, createCourse, updateCourse, deleteCourse };

