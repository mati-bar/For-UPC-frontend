import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Card, CardContent, 
  TextField, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert 
} from '@mui/material';
import api from './api/axiosConfig'; // Asegúrate de ajustar la ruta relativa a tu axiosConfig

export default function GestionCarreras() {
  // 1. Estados de datos y formulario
  const [carreras, setCarreras] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cantidadAnios, setCantidadAnios] = useState(3);

  // Estados de control de UI
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // 2. Traer las carreras del backend al montar el componente
  const cargarCarreras = async () => {
    try {
      setCargando(true);
      setErrorMsg(null);
      const res = await api.get('/carreras');
      setCarreras(res.data);
    } catch (error) {
      console.error('Error al cargar carreras:', error);
      setErrorMsg('No se pudieron obtener las carreras. Verifica la conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCarreras();
  }, []);

  // 3. Crear una nueva carrera en el backend
  const handleCrearCarrera = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorMsg(null);

    const nuevaCarrera = {
      nombre: nombre.trim(),
      cantidadAnios: Number(cantidadAnios),
    };

    try {
      const res = await api.post('/carreras', nuevaCarrera);
      setCarreras((prev) => [...prev, res.data]);
      setNombre('');
      setCantidadAnios(3);
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error al crear carrera:', error);
      const mensaje = error.response?.data?.mensaje || error.response?.data || 'Error al guardar la carrera.';
      alert('Atención: ' + (typeof mensaje === 'string' ? mensaje : JSON.stringify(mensaje)));
    } finally {
      setGuardando(false);
    }
  };

  // 4. Eliminar carrera en la base de datos
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de que querés eliminar esta carrera y todos sus años vinculados?')) {
      return;
    }

    try {
      await api.delete(`/carreras/${id}`);
      setCarreras((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error al eliminar:', error);
      const mensaje = error.response?.data?.mensaje || 'Error al intentar eliminar la carrera del servidor.';
      alert(mensaje);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>
          Gestión de Carreras
        </Typography>
        
        {/* Botón dinámico que abre/cierra el formulario */}
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

      {/* Alerta de error si falla la carga */}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* Formulario desplegable */}
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
                  <MenuItem value={1}>1 Año</MenuItem>
                  <MenuItem value={2}>2 Años</MenuItem>
                  <MenuItem value={3}>3 Años</MenuItem>
                  <MenuItem value={4}>4 Años</MenuItem>
                  <MenuItem value={5}>5 Años</MenuItem>
                </Select>
              </FormControl>

              <Button 
                type="submit" 
                variant="contained" 
                disabled={guardando}
                sx={{ 
                  bgcolor: '#f7a600', 
                  '&:hover': { bgcolor: '#bc7e01' }, 
                  color: '#fff', 
                  fontWeight: 'bold', 
                  height: '40px',
                  textTransform: 'none'
                }}
              >
                {guardando ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Guardar Carrera'}
              </Button>

            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tabla de carreras */}
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