import React from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export default function GestionCarreras() {
  const carrerasPrueba = [
    { id: 1, nombre: 'Tecnicatura Universitaria en Programación Full Stack' },
    { id: 2, nombre: 'Profesorado Universitario de Biología' }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>Gestión de Carreras</Typography>
        <Button variant="contained" sx={{ bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, fontWeight: 'bold' }}>+ Agregar Nueva Carrera</Button>
      </Box>
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
            {carrerasPrueba.map((carrera) => (
              <TableRow key={carrera.id}>
                <TableCell>{carrera.id}</TableCell>
                <TableCell>{carrera.nombre}</TableCell>
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