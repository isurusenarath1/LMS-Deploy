import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { authService } from '../services/authService';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'teacher';
  phone?: string;
  nic?: string;
  badge?: string;
  studentId?: string;
  profilePicture?: string;
  address?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  quickLogin: (email: string) => Promise<boolean>;
  getDevUsers: () => Promise<any>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  nic: string;
  badge?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  // Start in loading state so the initial render won't redirect before we check existing token
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.user) {
        setUser(response.user);
        toast.success('Login successful!');
        return true;
      } else {
        toast.error(response.message || 'Login failed');
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || 'Login error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await authService.register(data);
      if (response.success && response.user) {
        setUser(response.user);
        toast.success('Registration successful!');
        return true;
      } else {
        toast.error(response.message || 'Registration failed');
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      toast.info('Logged out successfully');
    } catch (err: any) {
      toast.error(err.message || 'Logout error');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await authService.quickLogin(email);
      if (response.success && response.user) {
        setUser(response.user);
        toast.success(`Quick login as ${response.user.name}!`);
        return true;
      } else {
        toast.error(response.message || 'Quick login failed');
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || 'Quick login error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getDevUsers = async () => {
    try {
      return await authService.getDevUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch dev users');
      return null;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getMe();
      if (response && response.success && response.user) {
        setUser(response.user);
      } else {
        // invalid token or failed to fetch user -> clear local token and user
        authService.clearToken();
        setUser(null);
      }
    } catch (err: any) {
      // On error, clear token and user to avoid stuck auth state
      authService.clearToken();
      setUser(null);
    }
  };

  // On mount, if a token exists try to refresh the user so reloads keep the session
  // This ensures refreshing the page doesn't immediately log the user out when a valid token exists.
  // If the token is invalid/expired the refreshUser call will clear it.
  useEffect(() => {
    (async () => {
      setLoading(true);
      const token = authService.getToken();
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AuthContext.Provider value={{
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    quickLogin,
    getDevUsers,
    refreshUser
  }}>
      {children}
    </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}