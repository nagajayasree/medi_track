import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/client';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: { name?: string; email?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    const token = await SecureStore.getItemAsync('token');
    const storedUser = await SecureStore.getItemAsync('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }

  async function persistSession(token: string, userData: User) {
    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    setUser(userData);
  }

  async function register(email: string, password: string, name: string) {
    const { data } = await api.post('/auth/register', {
      email,
      password,
      name,
    });
    await persistSession(data.token, data.user);
  }

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    await persistSession(data.token, data.user);
  }

  async function logout() {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  }

  async function updateUser(updates: { name?: string; email?: string }) {
    const { data } = await api.patch('/users/me', updates);
    await SecureStore.setItemAsync('user', JSON.stringify(data));
    setUser(data);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, register, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
