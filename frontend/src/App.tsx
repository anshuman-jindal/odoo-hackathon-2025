import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// @ts-ignore
import AuthContext from './context/AuthContext';
// @ts-ignore
import Login from './pages/Login';
// @ts-ignore
import Register from './pages/Register';
// @ts-ignore
import Profile from './pages/Profile';
// @ts-ignore
import Search from './pages/Search';
// @ts-ignore
import SwapRequests from './pages/SwapRequests';
// @ts-ignore
import AdminPanel from './pages/AdminPanel';
import { createContext, useState } from 'react';
import type { ReactNode } from 'react';

type PrivateRouteProps = {
  children: ReactNode;
};

function App() {
  const AuthContext = createContext({ user: null, setUser: () => {} });
  const { user } = useContext(AuthContext);

  // Protect routes: only logged-in users can access protected pages
  const PrivateRoute = ({ children }: PrivateRouteProps) =>
    user ? children : <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <Search />
          </PrivateRoute>
        }
      />
      <Route
        path="/swaps"
        element={
          <PrivateRoute>
            <SwapRequests />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminPanel />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? "/profile" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
