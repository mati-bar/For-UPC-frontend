import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, Button, 
  Tabs, Tab, Container, MenuItem, FormControl, InputLabel, Select,
  Checkbox, ListItemText, OutlinedInput, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; 
import logoUPC from './assets/logo-sede-laboulaye.png';

export default function Login() {
  const [tabValue, setTabValue] = useState(0); // 0: Login, 1: Registro
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register } = useAuth(); 

  // Estados del Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados del Registro
  const [nombreApellido, setNombreApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [carreras, setCarreras] = useState([]);
  const [anios, setAnios] = useState({});

  const opcionesCarreras = [
    "Tecnicatura Universitaria en Programación Full Stack",
    "Profesorado Universitario de Biología",
    "Profesorado Universitario de Geografía",
    "Profesorado de Educación Secundaria en Historia",
    "Profesorado de Educación Secundaria en Matemática",
    "Prof. Educación Física",
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
  };

  const handleCarrerasChange = (event) => {
    const { target: { value } } = event;
    setCarreras(typeof value === 'string' ? value.split(',') : value);
  };

  const handleAnioChange = (carrera, event) => {
    const { target: { value } } = event;
    setAnios({ 
      ...anios, 
      [carrera]: typeof value === 'string' ? value.split(',') : value 
    });
  };

  // Manejo del Login con redirección según rol
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let loggedUser = null;
      if (login) {
        loggedUser = await login(loginEmail, loginPassword);
      }

      // Verificamos si el usuario es administrador
      const isAdmin = 
        loggedUser?.rol === 'admin' || 
        loggedUser?.role === 'admin' || 
        loginEmail.trim().toLowerCase().includes('admin');

      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/feed');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Revisa tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  // Manejo del Registro
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const nuevoUsuario = {
      nombreApellido,
      email: correo,
      password,
      carreras,
      anios
    };

    try {
      if (register) {
        await register(nuevoUsuario);
      }
      navigate('/feed');
    } catch (err) {
      setError(err.message || 'Error al registrar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      backgroundColor: '#f1f5f9', minHeight: '100vh', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', py: 4
    }}>
      <Container maxWidth="sm">
        
        {/* ENCABEZADO INSTITUCIONAL */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box 
            component="img"
            src={logoUPC}
            alt="Logo UPC"
            sx={{ 
              height: 70,
              width: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
              mb: 1.5,
              display: 'inline-block'
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>
            Portal Informativo Académico
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comunidad Universitaria - Laboulaye
          </Typography>
        </Box>

        {/* TARJETA PRINCIPAL */}
        <Card sx={{ borderRadius: 4, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
        
          <Tabs
  value={tabValue}
  onChange={handleTabChange}
  variant="fullWidth"
  sx={{
    borderBottom: '1px solid #e2e8f0',
    // 1. Color de la barra inferior (indicador)
    '& .MuiTabs-indicator': {
      backgroundColor: '#f7a600 !important',
      height: 3, // Opcional: grosor de la línea
    },
    // 2. Estilos de las pestañas
    '& .MuiTab-root': {
      color: 'gray',
      fontWeight: 'bold',
      // Color del texto al estar seleccionada
      '&.Mui-selected': {
        color: '#f7a600 !important',
      },
      // 3. Efecto de onda (click/touch) en naranja
      '& .MuiTouchRipple-root': {
        color: '#f7a600',
      },
    },
  }}
>
  <Tab label="Iniciar Sesión" />
  <Tab label="Registrarse" />
</Tabs>

          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {/* VISTA 1: INICIAR SESIÓN */}
            {tabValue === 0 && (
              <Box component="form" onSubmit={handleLoginSubmit} sx={{color: '#000000', display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />

                <Typography 
                  variant="body2" component="a" href="#recuperar" 
                  onClick={(e) => { e.preventDefault(); alert("Próximamente: Sistema de recuperación de contraseña."); }}
                  sx={{ 
                    textAlign: 'right', color: '#000000', textDecoration: 'none', 
                    fontWeight: 'medium', '&:hover': { textDecoration: 'underline' }, mt: -1
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Typography>

                <Button 
                  type="submit"
                  disabled={loading}
                  variant="contained" 
                  size="large" 
                  sx={{ bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, py: 1.5, fontWeight: 'bold' }}
                >
                  {loading ? 'Ingresando...' : 'Entrar a la Plataforma'}
                </Button>
              </Box>
            )}

            {/* VISTA 2: REGISTRO DE ESTUDIANTE */}
            {tabValue === 1 && (
              <Box component="form" onSubmit={handleRegisterSubmit} sx={{ display: 'flex', flexDirection: 'column' }}>
                <TextField 
                  label="Nombre y Apellido" fullWidth required size="small" sx={{ mb: 2 }} 
                  value={nombreApellido} onChange={(e) => setNombreApellido(e.target.value)} 
                />
                <TextField 
                  label="Correo Electrónico" type="email" fullWidth required size="small" sx={{ mb: 2 }} 
                  value={correo} onChange={(e) => setCorreo(e.target.value)} 
                />
                <TextField 
                  label="Contraseña" type="password" fullWidth required size="small" sx={{ mb: 3 }} 
                  value={password} onChange={(e) => setPassword(e.target.value)} 
                />

                {/* SELECT MÚLTIPLE DE CARRERAS */}
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Carreras</InputLabel>
                  <Select
                    multiple
                    value={carreras}
                    onChange={handleCarrerasChange}
                    input={<OutlinedInput label="Carreras" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {opcionesCarreras.map((carrera) => (
                      <MenuItem key={carrera} value={carrera}>
                        <Checkbox checked={carreras.indexOf(carrera) > -1} />
                        <ListItemText primary={carrera} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* CAJAS DE AÑOS DINÁMICAS */}
                {carreras.map((carrera) => (
                  <FormControl fullWidth size="small" sx={{ mb: 2 }} key={carrera}>
                    <InputLabel>Año/s que cursás - {carrera}</InputLabel>
                    <Select
                      multiple
                      value={anios[carrera] || []}
                      onChange={(e) => handleAnioChange(carrera, e)}
                      input={<OutlinedInput label={`Año/s que cursás - ${carrera}`} />}
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {['1er Año', '2do Año', '3er Año', '4to Año'].map((anio) => (
                        <MenuItem key={anio} value={anio}>
                          <Checkbox checked={(anios[carrera] || []).indexOf(anio) > -1} />
                          <ListItemText primary={anio} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}

                <Button 
                  type="submit"
                  disabled={loading}
                  variant="contained" 
                  size="large" 
                  sx={{ bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, py: 1.5, fontWeight: 'bold', mt: 1 }}
                >
                  {loading ? 'Registrando...' : 'Completar Registro'}
                </Button>
              </Box>
            )}

          </CardContent>
        </Card>
        
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          Universidad Provincial de Córdoba — Sede Laboulaye
        </Typography>

      </Container>
    </Box>
  );
}