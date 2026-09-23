import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Card, CardContent, 
  TextField, Button, MenuItem, Grid, Divider, Paper,
  Chip, IconButton, Stack, Alert
} from '@mui/material';
import { Add, Logout, Delete, Campaign } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Asegura la ruta correcta a tu AuthContext

export default function PanelAdmin() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [carreraDestino, setCarreraDestino] = useState('');
  const [anioDestino, setAnioDestino] = useState('');
  
  // Lista de publicaciones guardadas
  const [publicaciones, setPublicaciones] = useState([]);
  const [mensajeExito, setMensajeExito] = useState(false);

  // Cargar publicaciones persistidas al montar el componente
  useEffect(() => {
    const dataGuardada = localStorage.getItem('upc_publicaciones');
    if (dataGuardada) {
      setPublicaciones(JSON.parse(dataGuardada));
    }
  }, []);

  const handlePublicar = (e) => {
    e.preventDefault();

    const nuevaPublicacion = {
      id: Date.now(),
      titulo,
      contenido,
      carreraDestino,
      anioDestino,
      autor: user?.nombre || user?.email || 'Administrador',
      fecha: new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const listaActualizada = [nuevaPublicacion, ...publicaciones];
    setPublicaciones(listaActualizada);
    localStorage.setItem('upc_publicaciones', JSON.stringify(listaActualizada));

    // Resetear formulario y mostrar feedback
    setTitulo('');
    setContenido('');
    setCarreraDestino('');
    setAnioDestino('');
    setMensajeExito(true);
    setTimeout(() => setMensajeExito(false), 4000);
  };

  const handleEliminar = (id) => {
    const filtradas = publicaciones.filter((pub) => pub.id !== id);
    setPublicaciones(filtradas);
    localStorage.setItem('upc_publicaciones', JSON.stringify(filtradas));
  };

  const handleCerrarSesion = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ backgroundColor: '#f1f5f9', minHeight: '100vh', pb: 6 }}>
      {/* BARRA SUPERIOR INSTITUCIONAL */}
      <Box sx={{ bgcolor: '#0F2C59', color: 'white', py: 2, px: 4, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Portal Informativo Académico
          </Typography>
          <Typography variant="caption" sx={{ color: '#93c5fd' }}>
            Panel de Administración — Sesión: {user?.nombre || user?.email}
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
        {mensajeExito && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Comunicado publicado y guardado exitosamente.
          </Alert>
        )}

        {/* FORMULARIO DE NUEVA PUBLICACIÓN */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0B1E3B', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Add color="primary" /> Redactar Nueva Publicación Institucional
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Los avisos publicados aquí se filtrarán automáticamente para los estudiantes según la carrera y el año seleccionados.
            </Typography>

            <Box component="form" onSubmit={handlePublicar} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField 
                label="Título del Comunicado" 
                fullWidth 
                required 
                size="small"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Suspensión de clases por mejoras edilicias"
              />

              <TextField 
                label="Contenido del Comunicado" 
                multiline
                rows={5}
                fullWidth 
                required 
                size="small"
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Escribí aquí el comunicado institucional..."
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Carrera Destinataria"
                    value={carreraDestino}
                    onChange={(e) => setCarreraDestino(e.target.value)}
                    fullWidth
                    required
                    size="small"
                  >
                    <MenuItem value="todas">Todas las Carreras</MenuItem>
                    <MenuItem value="programacion">Tecnicatura en Programación</MenuItem>
                    <MenuItem value="geografia">Profesorado en Geografía</MenuItem>
                    <MenuItem value="enfermeria">Enfermería Profesional</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Año Destinatario"
                    value={anioDestino}
                    onChange={(e) => setAnioDestino(e.target.value)}
                    fullWidth
                    required
                    size="small"
                  >
                    <MenuItem value="todos">Todos los Años</MenuItem>
                    <MenuItem value="1">1° Año</MenuItem>
                    <MenuItem value="2">2° Año</MenuItem>
                    <MenuItem value="3">3° Año</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Button 
                type="submit"
                variant="contained" 
                size="large" 
                sx={{ 
                  bgcolor: '#0F2C59', 
                  '&:hover': { bgcolor: '#0b1e3b' },
                  py: 1.5,
                  fontWeight: 'bold',
                  mt: 1
                }}
              >
                Publicar y Guardar Comunicado
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* LISTADO DE PUBLICACIONES RECIENTES */}
        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0B1E3B', mb: 2 }}>
            Publicaciones Realizadas Recientemente ({publicaciones.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {publicaciones.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 3 }}>
              Aún no hay publicaciones cargadas. Crea una desde el formulario superior.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {publicaciones.map((pub) => (
                <Card key={pub.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ pr: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#0F2C59' }}>
                        {pub.titulo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pub.fecha} — Por: {pub.autor}
                      </Typography>
                    </Box>
                    <IconButton 
                      color="error" 
                      size="small" 
                      onClick={() => handleEliminar(pub.id)}
                      title="Eliminar publicación"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" sx={{ my: 1.5, whiteSpace: 'pre-line' }}>
                    {pub.contenido}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip 
                      label={`Carrera: ${pub.carreraDestino}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={`Año: ${pub.anioDestino === 'todos' ? 'Todos' : pub.anioDestino + '°'}`} 
                      size="small" 
                      color="secondary" 
                      variant="outlined" 
                    />
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
}