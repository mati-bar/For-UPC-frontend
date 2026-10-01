import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './Login';
import PanelAdmin from './PanelAdmin';
import FeedEstudiante from './FeedEstudiante';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<PanelAdmin />} />
          <Route path="/feed" element={<FeedEstudiante />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}