import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './Login';
import PanelAdmin from './PanelAdmin';
import VistaForo from './FeedEstudiante';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública */}
          <Route path="/" element={<Login />} />

          {/* Rutas protegidas anidadas (para que funcione el <Outlet />) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/feed" element={<VistaForo />} />
            <Route path="/admin" element={<PanelAdmin />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}