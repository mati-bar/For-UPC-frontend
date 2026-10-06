import React from 'react';
import { 
  Box, Container, Typography, Card, CardContent, 
  Button, Chip, Divider, Paper 
} from '@mui/material';
import { Logout, Notifications, School, FiberManualRecord } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function VistaForo() {
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    navigate('/');
  };

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', pb: 6 }}>
      
      {/* BARRA SUPERIOR: Fondo limpio, borde sutil y textos de alto contraste */}
      <Box sx={{ 
        bgcolor: '#ffffff', 
        borderBottom: '1px solid #e2e8f0', 
        py: 2, 
        px: { xs: 2, md: 4 }, 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Box>
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem' }}>
            Portal Informativo Académico
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 500 }}>
            <School sx={{ fontSize: 16, color: '#f59e0b' }} /> Tecnicatura en Programación • 2° Año
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<Logout />}
          onClick={handleCerrarSesion}
          sx={{ 
            color: '#475569', 
            borderColor: '#cbd5e1', 
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              borderColor: '#94a3b8',
              bgcolor: '#f1f5f9'
            }
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>

      <Container maxWidth="md">
        
        {/* ENCABEZADO DE LA SECCIÓN */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Novedades y Comunicados
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Información oficial filtrada exclusivamente para tu carrera y año de cursada.
            </Typography>
          </Box>
          <Chip 
            icon={<FiberManualRecord sx={{ fontSize: '10px !important', color: '#10b981 !important' }} />} 
            label="Feed Actualizado" 
            size="small"
            sx={{ 
              bgcolor: '#ecfdf5', 
              color: '#065f46', 
              fontWeight: 600, 
              border: '1px solid #a7f3d0' 
            }} 
          />
        </Box>

        {/* TARJETA DE COMUNICADO */}
        <Card sx={{ 
          borderRadius: 2.5, 
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)', 
          mb: 3,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)'
          }
        }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Chip 
                label="Tecnicatura en Programación - 2° Año" 
                size="small" 
                sx={{ 
                  bgcolor: '#f1f5f9', 
                  color: '#334155', 
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid #e2e8f0'
                }} 
              />
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                Hace 2 horas
              </Typography>
            </Box>
            
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '1.05rem', lineHeight: 1.4 }}>
              Suspensión de clases presenciales por capacitación docente
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ color: '#475569', mb: 2, lineHeight: 1.65, whiteSpace: 'pre-line' }}
            >
              Estimados estudiantes, les informamos que el día viernes próximo las actividades académicas se realizarán de manera virtual a través de la plataforma institucional. Por favor revisar los materiales compartidos por los profesores de cada cátedra.
            </Typography>

            <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

            <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
              Publicado por: Administrador Institucional
            </Typography>
          </CardContent>
        </Card>

        {/* MENSAJE DE FIN DE FEED */}
        <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center', bgcolor: 'transparent', boxShadow: 'none' }}>
          <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>
            No hay más publicaciones recientes en tu feed académico.
          </Typography>
        </Paper>

      </Container>
    </Box>
  );
}