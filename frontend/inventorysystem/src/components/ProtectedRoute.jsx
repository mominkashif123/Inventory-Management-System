import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Simple auth check: look for 'isLoggedIn' in localStorage
const isAuthenticated = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

export default function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
} 