import { API_BASE } from '../config';

class SettingsService {
  private token = localStorage.getItem('auth_token');

  private getAuthHeaders() {
    const t = this.token || localStorage.getItem('auth_token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  }

  async uploadImage(file: File, key: string, index?: number) {
    const fd = new FormData();
    fd.append('file', file);
    const q = new URLSearchParams();
    q.set('key', key);
    if (index !== undefined) q.set('index', String(index));

    const res = await fetch(`${API_BASE}/settings/upload?${q.toString()}`, {
      method: 'POST',
      headers: this.getAuthHeaders() as HeadersInit,
      body: fd
    });
    return res.json();
  }
}

export default new SettingsService();
