const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

export interface AuthResponse {
  success: boolean;
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin' | 'teacher';
    phone?: string;
    nic?: string;
    badge?: string;
  };
  message?: string;
  needsOtp?: boolean;
  previewUrl?: string;
  sendError?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  nic: string;
  badge?: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('auth_token');
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (result.success && result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (result.success && result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async verifyOtp(email: string, code: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, code })
    });
    const result = await response.json();
    if (result.success && result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async resendOtp(email: string): Promise<{ success: boolean; previewUrl?: string; sendError?: string; message?: string }> {
    const response = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email })
    });
    return response.json();
  }

  async getMe(): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    const result = await response.json();
    if (result.success && result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async logout(): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    this.clearToken();
    return response.json();
  }

  async getDevUsers() {
    const response = await fetch(`${API_BASE}/dev/auth/dev-users`);
    return response.json();
  }

  async quickLogin(email: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/dev/auth/quick-login/${email}`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    const result = await response.json();
    if (result.success && result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async seedDevUsers(): Promise<any> {
    const response = await fetch(`${API_BASE}/dev/auth/seed-dev-users`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return response.json();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();

