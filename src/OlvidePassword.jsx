import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from './api/axiosConfig';

export default function OlvidePassword() {
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setMensaje(null);

    try {
    await api.post('/auth/forgot-password', { email: email.trim() });
    setMensaje('Si el correo está registrado, te enviamos un enlace para recuperar tu contraseña.');
    setEmail('');
    } catch (err) {
    setError('Ocurrió un error al intentar enviar el correo. Intentá nuevamente.');
    } finally {
    setCargando(false);
    }
};

return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
    <Card sx={{ maxWidth: 400, width: '100%', p: 2, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B', mb: 2, textAlign: 'center' }}>
            Recuperar Contraseña
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center' }}>
            Ingresá tu correo electrónico y te enviaremos las instrucciones para restablecer tu acceso.
        </Typography>

        {mensaje && <Alert severity="success" sx={{ mb: 2 }}>{mensaje}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField 
            label="Correo electrónico" 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            disabled={cargando} 
            />
            <Button 
            type="submit" 
            variant="contained" 
            disabled={cargando || !email}
            sx={{ bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, color: '#fff', fontWeight: 'bold', py: 1.5 }}
            >
            {cargando ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Enviar enlace'}
            </Button>
            <Button 
            variant="text" 
            onClick={() => navigate('/')} 
            sx={{ color: '#0B1E3B', textTransform: 'none', fontWeight: 'bold' }}
            >
            Volver al inicio de sesión
            </Button>
        </Box>
        </CardContent>
    </Card>
    </Box>
);
}