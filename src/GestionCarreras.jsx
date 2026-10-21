import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Card, CardContent,
  TextField, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert
} from '@mui/material';
import api from './api/axiosConfig'; // Ajustá la ruta relativa a tu axiosConfig

// El backend puede devolver texto plano o un objeto JSON en los errores
const mensajeDeError = (error, porDefecto) => {
  const status = error.response?.status;
  if (status === 401) return 'Tu sesión venció. Volvé a iniciar sesión.';
  if (status === 403) return 'No tenés permisos de administrador para realizar esta acción.';
  if (!error.response) return 'No se pudo conectar con el servidor. Verificá que el backend esté corriendo.';

  const data = error.response.data;
  const texto = typeof data === 'string' ? data : (data?.mensaje || data?.message || data?.error);
  return texto ? `${porDefecto} ${texto}` : `${porDefecto} (error ${status})`;
};

export default function GestionCarreras() {
  const [carreras, setCarreras] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cantidadAnios, setCantidadAnios] = useState(3);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [exitoMsg, setExitoMsg] = useState(null);

  // GET /carreras (silencioso = no muestra el spinner de la tabla)
  const cargarCarreras = async (silencioso = false) => {
    try {
      if (!silencioso) setCargando(true);
      const res = await api.get('/carreras');
      setCarreras(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error al cargar carreras:', error);
      setErrorMsg(mensajeDeError(error, 'No se pudieron obtener las carreras.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarCarreras(); }, []);

  // POST /carreras
  const handleCrearCarrera = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorMsg(null);
    setExitoMsg(null);

    try {
      await api.post('/carreras', {
        nombre: nombre.trim(),
        cantidadAnios: Number(cantidadAnios) // el backend actual podría ignorarlo: ver nota en la respuesta
      });
      setNombre('');
      setCantidadAnios(3);
      setMostrarFormulario(false);
      setExitoMsg('Carrera creada.');
      await cargarCarreras(true); // la lista siempre refleja lo que quedó guardado en el backend
    } catch (error) {
      console.error('Error al crear carrera:', error);
      setErrorMsg(mensajeDeError(error, 'No se pudo guardar la carrera.'));
    } finally {
      setGuardando(false);
    }
  };

  // DELETE /carreras/{id}
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de que querés eliminar esta carrera?')) return;

    setErrorMsg(null);
    setExitoMsg(null);
    try {
      await api.delete(`/carreras/${id}`);
      setCarreras((prev) => prev.filter((c) => c.id !== id));
      setExitoMsg('Carrera eliminada.');
    } catch (error) {
      console.error('Error al eliminar:', error);
      setErrorMsg(mensajeDeError(error, 'No se pudo eliminar la carrera. Puede tener años, estudiantes o publicaciones asociados.'));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>
          Gestión de Carreras
        </Typography>

        <Button
          variant={mostrarFormulario ? 'outlined' : 'contained'}
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          sx={{
            bgcolor: mostrarFormulario ? 'transparent' : '#f7a600',
            color: mostrarFormulario ? '#64748b' : '#fff',
            borderColor: mostrarFormulario ? '#cbd5e1' : 'transparent',
            '&:hover': { bgcolor: mostrarFormulario ? '#f1f5f9' : '#bc7e01' },
            fontWeight: 'bold',
            textTransform: 'none'
          }}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Agregar Nueva Carrera'}
        </Button>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg(null)}>{errorMsg}</Alert>}
      {exitoMsg && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setExitoMsg(null)}>{exitoMsg}</Alert>}

      {mostrarFormulario && (
        <Card sx={{ mb: 4, borderRadius: 2, border: '2px solid #f7a600', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0B1E3B', mb: 2 }}>
              Registrar nueva carrera en el sistema
            </Typography>
            <Box component="form" onSubmit={handleCrearCarrera} sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>

              <TextField
                label="Nombre de la Carrera"
                required
                size="small"
                sx={{ flexGrow: 1, minWidth: '300px' }}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={guardando}
              />

              <FormControl size="small" sx={{ minWidth: '150px' }}>
                <InputLabel>Duración (Años)</InputLabel>
                <Select
                  value={cantidadAnios}
                  label="Duración (Años)"
                  onChange={(e) => setCantidadAnios(e.target.value)}
                  disabled={guardando}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <MenuItem key={n} value={n}>{n} {n === 1 ? 'Año' : 'Años'}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                disabled={guardando || !nombre.trim()}
                sx={{ bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, color: '#fff', fontWeight: 'bold', height: '40px', textTransform: 'none' }}
              >
                {guardando ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Guardar Carrera'}
              </Button>

            </Box>
          </CardContent>
        </Card>
      )}

      <TableContainer component={Paper} sx={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B1E3B', width: '10%' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>Nombre de la Carrera</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', color: '#0B1E3B', width: '20%' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cargando ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={30} sx={{ color: '#f7a600' }} />
                </TableCell>
              </TableRow>
            ) : carreras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', py: 3, color: '#64748b' }}>
                  No hay carreras registradas.
                </TableCell>
              </TableRow>
            ) : (
              carreras.map((carrera) => (
                <TableRow key={carrera.id} hover>
                  <TableCell>{carrera.id}</TableCell>
                  <TableCell>{carrera.nombre}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      sx={{ fontWeight: 'bold', textTransform: 'none' }}
                      onClick={() => handleEliminar(carrera.id)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}