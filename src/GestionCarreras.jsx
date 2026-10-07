import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Card, CardContent, 
  TextField, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';

export default function GestionCarreras() {
  // 1. Estados para manejar los datos reales y el formulario
  const [carreras, setCarreras] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cantidadAnios, setCantidadAnios] = useState(3);

  // 2. Traer las carreras del backend al cargar la pantalla
  useEffect(() => {
    fetch('http://localhost:8080/carreras')
      .then(respuesta => respuesta.json())
      .then(datos => setCarreras(datos))
      .catch(error => console.error("Error al cargar carreras:", error));
  }, []);

  // 3. Función para enviar la nueva carrera al backend
  const handleCrearCarrera = async (e) => {
    e.preventDefault();
    
    const nuevaCarrera = {
      nombre: nombre,
      cantidadAnios: cantidadAnios
    };

    try {
      const respuesta = await fetch('http://localhost:8080/carreras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaCarrera)
      });

      if (respuesta.ok) {
        const carreraGuardada = await respuesta.json();
        setCarreras([...carreras, carreraGuardada]); // Actualizamos la tabla
        setNombre(''); // Limpiamos el form
        setCantidadAnios(3);
        setMostrarFormulario(false); // Cerramos el form
      } else {
        const mensajeError = await respuesta.text();
        alert("Atención: " + mensajeError);
      }
    } catch (error) {
      console.error("Error de conexión al crear carrera:", error);
    }
  };

  // 4. Función para eliminar la carrera en la base de datos
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de que querés eliminar esta carrera y todos sus años vinculados?")) return;

    try {
      const respuesta = await fetch(`http://localhost:8080/carreras/${id}`, {
        method: 'DELETE'
      });

      if (respuesta.ok) {
        setCarreras(carreras.filter(c => c.id !== id)); // La sacamos de la tabla
      } else {
        alert("Error al intentar eliminar la carrera del servidor.");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
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
          variant={mostrarFormulario ? "outlined" : "contained"} 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          sx={{ 
            bgcolor: mostrarFormulario ? 'transparent' : '#f7a600', 
            color: mostrarFormulario ? '#64748b' : '#fff',
            borderColor: mostrarFormulario ? '#cbd5e1' : 'transparent',
            '&:hover': { bgcolor: mostrarFormulario ? '#f1f5f9' : '#bc7e01' }, 
            fontWeight: 'bold' 
          }}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Agregar Nueva Carrera'}
        </Button>
      </Box>

      {/* Formulario que se despliega al apretar el botón */}
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
                fullWidth 
                size="small"
                sx={{ flexGrow: 1, minWidth: '300px' }} 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
              />
              
              <FormControl size="small" sx={{ minWidth: '150px' }}>
                <InputLabel>Duración (Años)</InputLabel>
                <Select 
                  value={cantidadAnios} 
                  label="Duración (Años)"
                  onChange={(e) => setCantidadAnios(e.target.value)}
                >
                  <MenuItem value={1}>1 Año</MenuItem>
                  <MenuItem value={2}>2 Años</MenuItem>
                  <MenuItem value={3}>3 Años</MenuItem>
                  <MenuItem value={4}>4 Años</MenuItem>
                </Select>
              </FormControl>

              <Button type="submit" variant="contained" sx={{ bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, color: '#fff', fontWeight: 'bold', height: '40px' }}>
                Guardar Carrera
              </Button>

            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tabla con la lista real de carreras y funcionalidad en los botones */}
      <TableContainer component={Paper} sx={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>Nombre de la Carrera</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', color: '#0B1E3B' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {carreras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', py: 3, color: '#64748b' }}>
                  No hay carreras registradas.
                </TableCell>
              </TableRow>
            ) : (
              carreras.map((carrera) => (
                <TableRow key={carrera.id}>
                  <TableCell>{carrera.id}</TableCell>
                  <TableCell>{carrera.nombre}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small" 
                      sx={{ fontWeight: 'bold' }}
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