import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './Login';
import PanelAdmin from './PanelAdmin';
import FeedEstudiante from './FeedEstudiante';
import PerfilEstudiante from './PerfilEstudiante';
import OlvidePassword from './OlvidePassword'; 
import RestablecerPassword from './RestablecerPassword'; 

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/olvide-password" element={<OlvidePassword />} />
        <Route path="/reset-password" element={<RestablecerPassword />} />
        <Route path="/admin" element={<PanelAdmin />} />
        <Route path="/feed" element={<FeedEstudiante />} />
        <Route path="/perfil" element={<PerfilEstudiante />} />
      </Routes>
    </AuthProvider>
  );
}