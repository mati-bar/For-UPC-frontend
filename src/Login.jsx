import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, Button, 
  Tabs, Tab, Container, MenuItem, Alert, Link 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Ajustar ruta si está en src/context/

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [tabValue, setTabValue] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Estados Form Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Estados Form Registro
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [carrera, setCarrera] = useState('');
  const [anio, setAnio] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setErrorMsg('');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = login(loginEmail, loginPass);
    if (res.success) {
      navigate('/panel');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = register({
      nombre: regNombre,
      email: regEmail,
      password: regPass,
      carrera,
      anio
    });

    if (res.success) {
      navigate('/panel');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'inline-block', bgcolor: '#0F2C59', color: 'white', px: 2, py: 1, borderRadius: 2, fontWeight: 'bold', mb: 1 }}>
            UPC
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>
            Portal Informativo Académico
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comunidad Universitaria - Laboulaye
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 4, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth" 
            sx={{ borderBottom: '1px solid #e2e8f0', '& .MuiTab-root': { fontWeight: 'bold' } }}
          >
            <Tab label="Iniciar Sesión" />
            <Tab label="Registrarse" />
          </Tabs>

          <CardContent sx={{ p: 4 }}>
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Alert>
            )}

            {/* FORMULARIO LOGIN */}
            {tabValue === 0 && (
              <Box component="form" onSubmit={handleLoginSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Ingresá con tu correo institucional para acceder a las novedades de tu carrera.
                </Typography>
                
                <TextField 
                  label="Correo electrónico" 
                  type="email" 
                  fullWidth 
                  required 
                  size="small"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                
                <TextField 
                  label="Contraseña" 
                  type="password" 
                  fullWidth 
                  required 
                  size="small"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                />

                <Link 
                  component="button" 
                  type="button" 
                  variant="body2" 
                  onClick={() => alert("Próximamente: Recuperación de contraseña.")}
                  sx={{ alignSelf: 'flex-end', color: '#0F2C59', textDecoration: 'none', fontWeight: 'medium' }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>

                <Button type="submit" variant="contained" size="large" sx={{ bgcolor: '#0F2C59', '&:hover': { bgcolor: '#0b1e3b' }, py: 1.5, fontWeight: 'bold' }}>
                  Entrar a la Plataforma
                </Button>
              </Box>
            )}

            {/* FORMULARIO REGISTRO */}
            {tabValue === 1 && (
              <Box component="form" onSubmit={handleRegisterSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Completá tus datos académicos para recibir únicamente la información de tu interés.
                </Typography>

                <TextField 
                  label="Nombre y Apellido" 
                  fullWidth 
                  required 
                  size="small" 
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                />

                <TextField 
                  label="Correo electrónico institucional" 
                  type="email" 
                  fullWidth 
                  required 
                  size="small" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />

                <TextField 
                  label="Contraseña" 
                  type="password" 
                  fullWidth 
                  required 
                  size="small" 
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                />

                <TextField
                  select
                  label="Carrera"
                  value={carrera}
                  onChange={(e) => setCarrera(e.target.value)}
                  fullWidth
                  required
                  size="small"
                >
                  <MenuItem value="programacion">Tecnicatura en Programación</MenuItem>
                  <MenuItem value="geografia">Profesorado en Geografía</MenuItem>
                  <MenuItem value="enfermeria">Enfermería Profesional</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Año de Cursada"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  fullWidth
                  required
                  size="small"
                >
                  <MenuItem value="1">1° Año</MenuItem>
                  <MenuItem value="2">2° Año</MenuItem>
                  <MenuItem value="3">3° Año</MenuItem>
                </TextField>

                <Button type="submit" variant="contained" size="large" sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, py: 1.5, fontWeight: 'bold', mt: 1 }}>
                  Completar Registro
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}