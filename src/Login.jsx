import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, Button, 
  Tabs, Tab, Container, MenuItem, FormControl, InputLabel, Select,
  Alert, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import logoUPC from './assets/logo-sede-laboulaye.png';

// URL base del backend: en Vercel viene de VITE_API_URL, en local usa localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const orangeTheme = createTheme({
  palette: {
    primary: {
      main: '#f7a600',
      dark: '#bc7e01',
    },
  },
});

export default function Login() {
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Estados de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados de Registro
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estados para los catálogos dinámicos
  const [listaCarreras, setListaCarreras] = useState([]);
  
  // Estado para manejar las filas de inscripción: [{ carreraId: '', anioCarreraId: '', aniosDisponibles: [] }]
  const [selecciones, setSelecciones] = useState([
    { carreraId: '', anioCarreraId: '', aniosDisponibles: [] }
  ]);

  // Cargar las carreras al iniciar la pantalla
  useEffect(() => {
    fetch(`${API_URL}/carreras`)
      .then(res => res.json())
      .then(data => setListaCarreras(data))
      .catch(err => console.error("Error al cargar carreras:", err));
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setExito('');
  };

  // Manejador dinámico para cuando el estudiante elige una carrera en una fila específica
  const handleCarreraChange = async (index, newCarreraId) => {
    // Limpiamos el año previo y actualizamos la carrera
    setSelecciones(prev =>
      prev.map((s, i) =>
        i === index
          ? { ...s, carreraId: newCarreraId, anioCarreraId: '', aniosDisponibles: [] }
          : s
      )
    );

    if (newCarreraId) {
      try {
        const respuesta = await fetch(`${API_URL}/carreras/${newCarreraId}/anios`);
        if (respuesta.ok) {
          const aniosData = await respuesta.json();
          setSelecciones(prev =>
            prev.map((s, i) => (i === index ? { ...s, aniosDisponibles: aniosData } : s))
          );
        }
      } catch (error) {
        console.error("Error al cargar los años:", error);
      }
    }
  };

  const handleAnioChange = (index, newAnioCarreraId) => {
    setSelecciones(prev =>
      prev.map((s, i) => (i === index ? { ...s, anioCarreraId: newAnioCarreraId } : s))
    );
  };

  const agregarFila = () => {
    setSelecciones([...selecciones, { carreraId: '', anioCarreraId: '', aniosDisponibles: [] }]);
  };

  const eliminarFila = (index) => {
    if (selecciones.length > 1) {
      const nuevasSelecciones = selecciones.filter((_, i) => i !== index);
      setSelecciones(nuevasSelecciones);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const respuesta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      if (respuesta.ok) {
        const data = await respuesta.json();
        // Guardamos el token para que Matías lo use después en los permisos
        localStorage.setItem('token', data.token);
        navigate('/feed'); 
      } else {
        const mensajeError = await respuesta.text();
        setError(mensajeError || 'Email o contraseña incorrectos.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setLoading(true);

    // Filtramos solo las selecciones que estén completas (carrera y año) y armamos el formato exacto para el backend
    const inscripcionesValidas = selecciones
      .filter(s => s.carreraId && s.anioCarreraId)
      .map(s => ({ anioCarreraId: s.anioCarreraId }));

    if (inscripcionesValidas.length === 0) {
      setError('Debes completar al menos una carrera y su año correspondiente.');
      setLoading(false);
      return;
    }

    const payload = {
      nombre,
      apellido,
      email,
      password,
      inscripciones: inscripcionesValidas
    };

    try {
      const respuesta = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (respuesta.status === 201) {
        setExito('¡Registro exitoso! Ya podés iniciar sesión.');
        setTabValue(0); // Lo mandamos al login para que entre
        setNombre(''); setApellido(''); setEmail(''); setPassword('');
        setSelecciones([{ carreraId: '', anioCarreraId: '', aniosDisponibles: [] }]);
      } else {
        const mensajeError = await respuesta.text();
        setError(mensajeError);
      }
    } catch (err) {
      setError('Error de conexión al registrarse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={orangeTheme}>
      <Box sx={{ backgroundColor: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box component="img" src={logoUPC} alt="Logo UPC" sx={{ height: 70, width: 'auto', maxWidth: '100%', objectFit: 'contain', mb: 1.5, display: 'inline-block' }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#000000' }}>Portal Informativo Académico</Typography>
            <Typography variant="body2" color="text.secondary">Comunidad Universitaria - Laboulaye</Typography>
          </Box>

          <Card sx={{ borderRadius: 4, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth" 
              sx={{ 
                borderBottom: '1px solid #e2e8f0', 
                '& .MuiTabs-indicator': { backgroundColor: '#f7a600 !important', height: 3 }, 
                '& .MuiTab-root': { color: 'gray', fontWeight: 'bold', '&.Mui-selected': { color: '#f7a600 !important' } } 
              }}
            >
              <Tab label="Iniciar Sesión" />
              <Tab label="Registrarse" />
            </Tabs>

            <CardContent sx={{ p: 4 }}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {exito && <Alert severity="success" sx={{ mb: 2 }}>{exito}</Alert>}
              
              {tabValue === 0 && (
                <Box component="form" onSubmit={handleLoginSubmit} sx={{ color: '#000000', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="body2" color="text.secondary">Ingresá con tu correo institucional para acceder a las novedades de tu carrera.</Typography>
                  <TextField label="Correo electrónico" type="email" fullWidth required size="small" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                  <TextField label="Contraseña" type="password" fullWidth required size="small" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                  <Typography 
                    variant="body2" 
                    component="a" 
                    href="#recuperar" 
                    onClick={(e) => { e.preventDefault(); navigate('/olvide-password'); }} 
                    sx={{ textAlign: 'right', color: '#000000', textDecoration: 'none', fontWeight: 'medium', '&:hover': { textDecoration: 'underline' }, mt: -1 }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Typography>
                  <Button type="submit" disabled={loading} variant="contained" size="large" sx={{ bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, py: 1.5, fontWeight: 'bold', color: '#ffffff' }}>
                    {loading ? 'Ingresando...' : 'Entrar a la Plataforma'}
                  </Button>
                </Box>
              )}

              {tabValue === 1 && (
                <Box component="form" onSubmit={handleRegisterSubmit} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <TextField label="Nombre" fullWidth required size="small" sx={{ mb: 2 }} value={nombre} onChange={(e) => setNombre(e.target.value)} />
                  <TextField label="Apellido" fullWidth required size="small" sx={{ mb: 2 }} value={apellido} onChange={(e) => setApellido(e.target.value)} />
                  <TextField label="Correo Electrónico" type="email" fullWidth required size="small" sx={{ mb: 2 }} value={email} onChange={(e) => setEmail(e.target.value)} />
                  <TextField label="Contraseña" type="password" fullWidth required size="small" sx={{ mb: 3 }} value={password} onChange={(e) => setPassword(e.target.value)} />
                  
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#000' }}>Seleccioná tus carreras en curso:</Typography>
                  
                  {selecciones.map((seleccion, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
                      <FormControl fullWidth size="small" required>
                        <InputLabel>Carrera</InputLabel>
                        <Select
                          value={seleccion.carreraId}
                          label="Carrera"
                          onChange={(e) => handleCarreraChange(index, e.target.value)}
                        >
                          {listaCarreras.map((c) => (
                            <MenuItem key={c.id} value={c.id} disabled={selecciones.some(s => s.carreraId === c.id && s !== seleccion)}>
                              {c.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small" required disabled={!seleccion.carreraId || seleccion.aniosDisponibles.length === 0}>
                        <InputLabel>Año</InputLabel>
                        <Select
                          value={seleccion.anioCarreraId}
                          label="Año"
                          onChange={(e) => handleAnioChange(index, e.target.value)}
                        >
                          {seleccion.aniosDisponibles.map((a) => (
                            <MenuItem key={a.anioCarreraId} value={a.anioCarreraId}>
                              {a.numero}° Año
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <IconButton color="error" onClick={() => eliminarFila(index)} disabled={selecciones.length === 1}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}

                  <Button onClick={agregarFila} sx={{ alignSelf: 'flex-start', mb: 3, textTransform: 'none', fontWeight: 'bold', color: '#f7a600' }}>
                    + Añadir otra carrera
                  </Button>

                  <Button type="submit" disabled={loading} variant="contained" size="large" sx={{ bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, py: 1.5, fontWeight: 'bold', color: '#ffffff' }}>
                    {loading ? 'Registrando...' : 'Completar Registro'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'text.secondary' }}>Universidad Provincial de Córdoba — Sede Laboulaye</Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
}