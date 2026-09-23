import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    // Si no está logueado, redirige a la pantalla de login
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza los componentes hijos
  return <Outlet />;
}