import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import PanelAdmin from './PanelAdmin';
import VistaForo from './FeedEstudiante'; // Este será el Feed del Estudiante adaptado

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal: Login / Registro */}
        <Route path="/" element={<Login />} />
        
        {/* Ruta del Panel de Administración */}
        <Route path="/admin" element={<PanelAdmin />} />
        
        {/* Ruta del Feed del Estudiante */}
        <Route path="/feed" element={<VistaForo />} />
      </Routes>
    </Router>
  );
}