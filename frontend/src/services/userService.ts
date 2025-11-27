import { authService } from './authService';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'https://lms-deploy-backend.vercel.app/api';

function getHeaders() {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function getProfile() {
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: 'GET',
    headers: getHeaders()
  });
  return res.json();
}

export async function updateProfile(data: { name?: string; phone?: string; nic?: string; address?: string; badge?: string }) {
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function changePassword(payload: { currentPassword: string; newPassword: string; confirmPassword: string }) {
  const res = await fetch(`${API_BASE}/users/change-password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function uploadProfilePicture(file: File) {
  const token = (authService as any).getToken();
  const form = new FormData();
  form.append('avatar', file);

  const res = await fetch(`${API_BASE}/users/profile/photo`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: form
  });
  return res.json();
}

export default {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture
};



