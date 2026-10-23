import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Avatar, Divider, Chip } from '@mui/material';
import api from './api/axiosConfig';

export default function Perfil() {
const [perfil, setPerfil] = useState(null);
const [cargando, setCargando] = useState(true);
const [errorMsg, setErrorMsg] = useState(null);

useEffect(() => {
    const cargarPerfil = async () => {
    try {
        const res = await api.get('/usuarios/me');
        setPerfil(res.data);
    } catch (error) {
        console.error('Error al cargar el perfil:', error);
        setErrorMsg('No se pudo cargar la información de tu perfil. Verificá tu conexión.');
    } finally {
        setCargando(false);
    }
    };
    cargarPerfil();
}, []);

if (cargando) {
    return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress sx={{ color: '#f7a600' }} />
    </Box>
    );
}

if (errorMsg) return <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>;
if (!perfil) return null;

return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B', mb: 3 }}>
        Mi Perfil
    </Typography>

    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderTop: '4px solid #f7a600' }}>
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: '#0B1E3B', fontSize: '2rem', mb: 2 }}>
            {perfil.nombre ? perfil.nombre.charAt(0).toUpperCase() : 'U'}
        </Avatar>

        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>
            {perfil.nombre} {perfil.apellido}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            {perfil.email}
        </Typography>

        <Chip 
            label={perfil.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Estudiante'} 
            sx={{ bgcolor: perfil.rol === 'ADMINISTRADOR' ? '#f7a600' : '#e2e8f0', color: perfil.rol === 'ADMINISTRADOR' ? '#fff' : '#0f172a', fontWeight: 'bold', mb: 3 }} 
        />

        <Divider sx={{ width: '100%', mb: 3 }} />

        <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0B1E3B', mb: 1 }}>
            Mis Inscripciones
            </Typography>
            
            {perfil.inscripciones && perfil.inscripciones.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {perfil.inscripciones.map((inscripcion, index) => (
                <Card key={index} variant="outlined" sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 'bold' }}>
                    ID de Inscripción de Carrera / Año: {inscripcion.anioCarreraId || inscripcion.id}
                    </Typography>
                </Card>
                ))}
            </Box>
            ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No tenés inscripciones registradas en el sistema.
            </Typography>
            )}
        </Box>
        </CardContent>
    </Card>
    </Box>
);
}