// @ts-nocheck
import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/axiosConfig';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Optionally fetch user profile:
      axios.get('/users/me')
        .then(res => setUser(res.data.user))
        .catch(() => logout());
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
  };

  const register = async (name, email, password, location) => {
    const res = await axios.post('/auth/register', { name, email, password, location });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setToken('');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
