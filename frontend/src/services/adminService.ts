import { authService } from './authService';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

export interface StudentPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  nic?: string;
  badge?: string;
  address?: string;
}

function getHeaders() {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function getStudents() {
  const res = await fetch(`${API_BASE}/admin/students`, {
    method: 'GET',
    headers: getHeaders()
  });
  return res.json();
}

export async function getAdmins() {
  const res = await fetch(`${API_BASE}/admin/admins`, {
    method: 'GET',
    headers: getHeaders()
  });
  return res.json();
}

export async function getAdmin(id: string) {
  const res = await fetch(`${API_BASE}/admin/admins/${id}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return res.json();
}

export async function createAdmin(data: StudentPayload) {
  const res = await fetch(`${API_BASE}/admin/admins`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateAdmin(id: string, data: Partial<StudentPayload>) {
  const res = await fetch(`${API_BASE}/admin/admins/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteAdmin(id: string) {
  const res = await fetch(`${API_BASE}/admin/admins/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
}

export async function getStudent(id: string) {
  const res = await fetch(`${API_BASE}/admin/students/${id}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return res.json();
}

export async function getStudentMonths(id: string) {
  const res = await fetch(`${API_BASE}/admin/students/${id}/months`, {
    method: 'GET',
    headers: getHeaders()
  });
  return res.json();
}

export async function createStudent(data: StudentPayload) {
  const res = await fetch(`${API_BASE}/admin/students`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateStudent(id: string, data: Partial<StudentPayload>) {
  const res = await fetch(`${API_BASE}/admin/students/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteStudent(id: string) {
  const res = await fetch(`${API_BASE}/admin/students/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
}

export async function verifyStudent(payload: { nic?: string; studentId?: string; id?: string }) {
  const url = `${API_BASE}/admin/students/verify`;
  console.debug('[adminService] verifyStudent ->', url, payload);
  // sanitize payload values to plain strings to avoid accidental objects
  const sanitized: any = {};
  if (payload.nic !== undefined) sanitized.nic = payload.nic == null ? payload.nic : String(payload.nic);
  if (payload.studentId !== undefined) sanitized.studentId = payload.studentId == null ? payload.studentId : String(payload.studentId);
  if (payload.id !== undefined) sanitized.id = payload.id == null ? payload.id : String(payload.id);

  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(sanitized)
  });
  let parsed: any = null;
  try {
    parsed = await res.json();
  } catch (e) {
    parsed = { success: false, message: `Non-JSON response (status ${res.status})` };
  }
  if (!res.ok) {
    // include status for easier debugging in UI
    return { success: false, message: parsed?.message || `Request failed with status ${res.status}`, status: res.status };
  }
  return parsed;
}

const defaultExport: any = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  verifyStudent
};

// include admin management functions on the default export for backwards compatibility
Object.assign(defaultExport, {
  getAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin
  ,
  getStudentMonths
});

export default defaultExport;

