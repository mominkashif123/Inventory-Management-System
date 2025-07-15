import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!token && !!user;
};

export default function ProtectedRoute({ roles = [] }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (roles.length && (!user || !roles.includes(user.role))) return <Navigate to="/login" replace />;
  return <Outlet />;
} 