import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Button, CircularProgress, Alert, Container 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import logoUPC from './assets/logo-sede-laboulaye.png';
import api from './api/axiosConfig';

const orangeTheme = createTheme({
  palette: {
    primary: {
      main: '#f7a600',
      dark: '#bc7e01',
    },
  },
});

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
    <ThemeProvider theme={orangeTheme}>
      <Box sx={{ backgroundColor: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Container maxWidth="sm">
          {/* Encabezado con Logo Institucional */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box 
              component="img" 
              src={logoUPC} 
              alt="Logo UPC" 
              sx={{ height: 70, width: 'auto', maxWidth: '100%', objectFit: 'contain', mb: 1.5, display: 'inline-block' }} 
            />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#000000' }}>
              Portal Informativo Académico
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comunidad Universitaria - Laboulaye
            </Typography>
          </Box>

          {/* Tarjeta de Recuperación */}
          <Card sx={{ borderRadius: 4, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000000', mb: 1 }}>
                Recuperar Contraseña
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ingresá tu correo electrónico institucional y te enviaremos las instrucciones para restablecer tu acceso.
              </Typography>

              {mensaje && <Alert severity="success" sx={{ mb: 3 }}>{mensaje}</Alert>}
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField 
                  label="Correo electrónico" 
                  type="email" 
                  fullWidth 
                  required 
                  size="small" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  disabled={cargando} 
                />

                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  disabled={cargando || !email}
                  sx={{ 
                    bgcolor: '#f7a600', 
                    '&:hover': { bgcolor: '#bc7e01' }, 
                    py: 1.5, 
                    fontWeight: 'bold', 
                    color: '#ffffff' 
                  }}
                >
                  {cargando ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Enviar enlace de recuperación'}
                </Button>

                <Button 
                  variant="text" 
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/')} 
                  sx={{ 
                    color: 'text.secondary', 
                    textTransform: 'none', 
                    fontWeight: 'medium',
                    '&:hover': { color: '#000000', bgcolor: 'transparent', textDecoration: 'underline' } 
                  }}
                >
                  Volver al inicio de sesión
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Pie de página */}
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'text.secondary' }}>
            Universidad Provincial de Córdoba — Sede Laboulaye
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
}