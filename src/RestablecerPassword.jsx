import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from './api/axiosConfig';

export default function RestablecerPassword() {
const [searchParams] = useSearchParams();
const token = searchParams.get('token'); // Atrapa el token de la URL
const navigate = useNavigate();

const [password, setPassword] = useState('');
const [confirmarPassword, setConfirmarPassword] = useState('');
const [cargando, setCargando] = useState(false);
const [mensaje, setMensaje] = useState(null);
const [error, setError] = useState(null);

const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmarPassword) {
    setError('Las contraseñas no coinciden.');
    return;
    }

    setCargando(true);
    setError(null);
    setMensaje(null);

    try {
      // Confirmá con Matías si el backend espera { token, password } o { token, nuevaPassword }
    await api.post('/auth/reset-password', { token, password });
    setMensaje('¡Tu contraseña fue actualizada con éxito!');
      setTimeout(() => navigate('/'), 3000); // Redirige al login después de 3 segundos
    } catch (err) {
    setError('El enlace es inválido o expiró. Volvé a solicitar la recuperación.');
    } finally {
    setCargando(false);
    }
};

if (!token) {
    return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <Alert severity="error">Falta el token de seguridad. Usá el enlace que te enviamos por correo.</Alert>
    </Box>
    );
}

return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
    <Card sx={{ maxWidth: 400, width: '100%', p: 2, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B', mb: 3, textAlign: 'center' }}>
            Crear Nueva Contraseña
        </Typography>

        {mensaje && <Alert severity="success" sx={{ mb: 2 }}>{mensaje}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField 
            label="Nueva contraseña" 
            type="password" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            disabled={cargando || !!mensaje} 
            />
            <TextField 
            label="Repetir contraseña" 
            type="password" 
            required 
            value={confirmarPassword} 
            onChange={(e) => setConfirmarPassword(e.target.value)} 
            disabled={cargando || !!mensaje} 
            />
            <Button 
            type="submit" 
            variant="contained" 
            disabled={cargando || !!mensaje || !password || !confirmarPassword}
            sx={{ bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, color: '#fff', fontWeight: 'bold', py: 1.5 }}
            >
            {cargando ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Guardar contraseña'}
            </Button>
        </Box>
        </CardContent>
    </Card>
    </Box>
);
}