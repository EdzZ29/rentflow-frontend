import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from the httpOnly cookie: ask the API who we are.
  useEffect(() => {
    (async () => {
      try {
        setUser(await api.me());
      } catch {
        setUser(null);
      }
      setLoading(false);
    })();
  }, []);

  const login = async (data) => {
    const res = await api.login(data);
    setUser(res.user);
    return res.user;
  };

  const register = async (data) => {
    const res = await api.register(data);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      /* clear local state regardless */
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

// Where each role lands after authenticating.
export function homePathForRole(role) {
  if (role === 'admin') return '/admin';
  if (role === 'owner') return '/owner';
  if (role === 'customer') return '/customer';
  return '/';
}
