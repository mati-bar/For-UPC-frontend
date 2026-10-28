import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, Button, 
  CircularProgress, Alert, Container, IconButton, InputAdornment 
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

export default function RestablecerPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  // Estados de visibilidad de contraseñas
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);

    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setMensaje('¡Tu contraseña fue actualizada con éxito! Redirigiendo al inicio de sesión...');
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError('El enlace es inválido o expiró. Volvé a solicitar la recuperación.');
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

          {/* Tarjeta de Restablecimiento */}
          <Card sx={{ borderRadius: 4, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000000', mb: 1 }}>
                Crear Nueva Contraseña
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Escribí y confirmá tu nueva clave para recuperar el acceso a tu cuenta.
              </Typography>

              {!token ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Alert severity="error">
                    Falta el token de seguridad o el enlace no es válido. Volvé a solicitar la recuperación.
                  </Alert>
                  <Button 
                    variant="text" 
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/olvide-password')} 
                    sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 'medium', alignSelf: 'center', mt: 1 }}
                  >
                    Ir a recuperar contraseña
                  </Button>
                </Box>
              ) : (
                <>
                  {mensaje && <Alert severity="success" sx={{ mb: 3 }}>{mensaje}</Alert>}
                  {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                  <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField 
                      label="Nueva contraseña" 
                      type={mostrarPassword ? 'text' : 'password'} 
                      fullWidth 
                      required 
                      size="small" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      disabled={cargando || !!mensaje} 
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setMostrarPassword(!mostrarPassword)} edge="end">
                                {mostrarPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }
                      }}
                    />

                    <TextField 
                      label="Repetir contraseña" 
                      type={mostrarConfirmar ? 'text' : 'password'} 
                      fullWidth 
                      required 
                      size="small" 
                      value={confirmarPassword} 
                      onChange={(e) => setConfirmarPassword(e.target.value)} 
                      disabled={cargando || !!mensaje} 
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setMostrarConfirmar(!mostrarConfirmar)} edge="end">
                                {mostrarConfirmar ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }
                      }}
                    />

                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="large"
                      disabled={cargando || !!mensaje || !password || !confirmarPassword}
                      sx={{ 
                        bgcolor: '#f7a600', 
                        '&:hover': { bgcolor: '#bc7e01' }, 
                        py: 1.5, 
                        fontWeight: 'bold', 
                        color: '#ffffff' 
                      }}
                    >
                      {cargando ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Guardar nueva contraseña'}
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
                </>
              )}
            </CardContent>
          </Card>

          {/* Pie de página institucional */}
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'text.secondary' }}>
            Universidad Provincial de Córdoba — Sede Laboulaye
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
}