import React from 'react';
import { 
Box, Container, Typography, Card, CardContent, 
Button, Chip, Divider, Paper 
} from '@mui/material';
import { Logout, Notifications, School } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function VistaForo() {
const navigate = useNavigate();

const handleCerrarSesion = () => {
    navigate('/');
};

return (
    <Box sx={{ backgroundColor: '#f1f5f9', minHeight: '100vh', pb: 6 }}>
    
      {/* BARRA SUPERIOR DEL ESTUDIANTE */}
    <Box sx={{ bgcolor: '#0F2C59', color: 'white', py: 2, px: 4, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Portal Informativo Académico
        </Typography>
        <Typography variant="caption" sx={{ color: '#93c5fd', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <School fontSize="inherit" /> Tecnicatura en Programación • 2° Año
        </Typography>
        </Box>
        <Button 
        variant="outlined" 
        color="inherit" 
        size="small" 
        startIcon={<Logout />}
        onClick={handleCerrarSesion}
        sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
        >
        Cerrar Sesión
        </Button>
    </Box>

    <Container maxWidth="md">
        
        {/* ENCABEZADO DE LA SECCIÓN */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>
            Novedades y Comunicados
            </Typography>
            <Typography variant="body2" color="text.secondary">
            Información oficial filtrada exclusivamente para tu carrera y año de cursada.
            </Typography>
        </Box>
        <Chip 
            icon={<Notifications />} 
            label="Feed Actualizado" 
            color="primary" 
            variant="outlined" 
        />
        </Box>

        {/* TARJETA DE COMUNICADO EJEMPLO */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Chip label="Tecnicatura en Programación - 2° Año" size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 'bold' }} />
            <Typography variant="caption" color="text.secondary">
                Hace 2 horas
            </Typography>
            </Box>
            
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0B1E3B', mb: 1 }}>
            Suspensión de clases presenciales por capacitación docente
            </Typography>
            
            <Typography 
            variant="body2" 
            sx={{ color: '#334155', mb: 2, lineHeight: 1.6, whiteSpace: 'pre-line' }}
            >
            Estimados estudiantes, les informamos que el día viernes próximo las actividades académicas se realizarán de manera virtual a través de la plataforma institucional. Por favor revisar los materiales compartidos por los profesores de cada cátedra.
            </Typography>

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            Publicado por: Administrador Institucional
            </Typography>
        </CardContent>
        </Card>

        {/* MENSAJE DE FIN DE FEED */}
        <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: 'transparent', boxShadow: 'none' }}>
        <Typography variant="body2" color="text.secondary">
            No hay más publicaciones recientes en tu feed académico.
        </Typography>
        </Paper>

    </Container>
    </Box>
);
}