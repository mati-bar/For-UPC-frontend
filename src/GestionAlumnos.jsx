import React from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export default function GestionAlumnos() {
  const alumnosPrueba = [
    { id: 1, legajo: 'UPC-10234', nombre: 'Juan', apellido: 'Pérez', carrera: 'Programación Full Stack' },
    { id: 2, legajo: 'UPC-10235', nombre: 'María', apellido: 'Gómez', carrera: 'Profesorado de Biología' }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>Gestión de Alumnos</Typography>
        <Button variant="contained" sx={{ bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, fontWeight: 'bold' }}>+ Agregar Nuevo Alumno</Button>
      </Box>
      <TableContainer component={Paper} sx={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>Legajo</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>Nombre y Apellido</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>Carrera</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', color: '#0B1E3B' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alumnosPrueba.map((alumno) => (
              <TableRow key={alumno.id}>
                <TableCell>{alumno.legajo}</TableCell>
                <TableCell>{alumno.nombre} {alumno.apellido}</TableCell>
                <TableCell>{alumno.carrera}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  <Button variant="outlined" color="error" size="small" sx={{ fontWeight: 'bold' }}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}