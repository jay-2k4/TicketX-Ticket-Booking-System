import { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, registerUser } from '../api/authApi';
import { wakeUserService } from '../api/wakeservice';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('ticketx_user');
    const storedToken = localStorage.getItem('ticketx_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const persistSession = ({ token, user: nextUser }) => {
    localStorage.setItem('ticketx_token', token);
    localStorage.setItem('ticketx_user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const login = async (credentials) => {
    await wakeUserService();

    const data = await loginUser(credentials);

    persistSession(data);

    return data;
  };

  const register = async (details) => {
    await wakeUserService();

    const data = await registerUser(details);

    persistSession(data);

    return data;
  };

  const logout = () => {
    localStorage.removeItem('ticketx_token');
    localStorage.removeItem('ticketx_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return ctx;
}