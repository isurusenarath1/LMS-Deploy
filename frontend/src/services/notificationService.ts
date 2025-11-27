import { authService } from './authService';

import { API_BASE } from '../config';

function getHeaders() {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function getMyNotifications() {
  const res = await fetch(`${API_BASE}/notifications`, {
    method: 'GET',
    headers: getHeaders()
  });
  return res.json();
}

export async function markNotificationRead(id: string) {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PUT',
    headers: getHeaders()
  });
  return res.json();
}

// Admin-facing
export async function adminSendNotification(payload: { title: string; message: string; target: any }) {
  const res = await fetch(`${API_BASE}/admin/notifications`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function adminListNotifications() {
  const res = await fetch(`${API_BASE}/admin/notifications`, {
    method: 'GET',
    headers: getHeaders()
  });
  return res.json();
}

const defaultExport = {
  getMyNotifications,
  markNotificationRead,
  adminSendNotification,
  adminListNotifications
};

export default defaultExport;
