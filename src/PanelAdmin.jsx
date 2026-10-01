import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography, Card, CardContent } from '@mui/material';
import EditorAnuncios from './EditorAnuncios';
import GestionCarreras from './GestionCarreras';
import GestionAlumnos from './GestionAlumnos';

const anchoMenu = 240;

export default function PanelAdmin() {
  const [vistaActiva, setVistaActiva] = useState('inicio');

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: anchoMenu,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: anchoMenu, boxSizing: 'border-box', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0' },
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="h6" fontWeight="bold" color="#0B1E3B">Portal UPC</Typography>
          <Typography variant="body2" color="textSecondary">Administración</Typography>
        </Box>
        <List sx={{ pt: 2 }}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setVistaActiva('inicio')} sx={{ bgcolor: vistaActiva === 'inicio' ? '#f1f5f9' : 'transparent' }}>
              <ListItemText primary="Inicio" sx={{ color: vistaActiva === 'inicio' ? '#f7a600' : 'inherit' }}/>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setVistaActiva('editor')} sx={{ bgcolor: vistaActiva === 'editor' ? '#f1f5f9' : 'transparent' }}>
              <ListItemText primary="Publicar Anuncio" sx={{ color: vistaActiva === 'editor' ? '#f7a600' : 'inherit' }}/>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setVistaActiva('carreras')} sx={{ bgcolor: vistaActiva === 'carreras' ? '#f1f5f9' : 'transparent' }}>
              <ListItemText primary="Gestión de Carreras" sx={{ color: vistaActiva === 'carreras' ? '#f7a600' : 'inherit' }}/>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setVistaActiva('alumnos')} sx={{ bgcolor: vistaActiva === 'alumnos' ? '#f1f5f9' : 'transparent' }}>
              <ListItemText primary="Gestión de Alumnos" sx={{ color: vistaActiva === 'alumnos' ? '#f7a600' : 'inherit' }}/>
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        {vistaActiva === 'inicio' && (
          <Box>
            <Typography variant="h4" sx={{ color: '#0B1E3B', fontWeight: 'bold', mb: 4 }}>Panel de Administración</Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Card sx={{ width: 260, cursor: 'pointer', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }} onClick={() => setVistaActiva('editor')}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" sx={{ color: '#f7a600', fontWeight: 'bold' }}>Publicar Anuncio</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Crear y enviar notificaciones</Typography>
                </CardContent>
              </Card>
              <Card sx={{ width: 260, cursor: 'pointer', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }} onClick={() => setVistaActiva('carreras')}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" sx={{ color: '#f7a600', fontWeight: 'bold' }}>Gestión de Carreras</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Administrar carreras y años</Typography>
                </CardContent>
              </Card>
              <Card sx={{ width: 260, cursor: 'pointer', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }} onClick={() => setVistaActiva('alumnos')}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" sx={{ color: '#f7a600', fontWeight: 'bold' }}>Gestión de Alumnos</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Ver y editar alumnos</Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
        {vistaActiva === 'editor' && <EditorAnuncios />}
        {vistaActiva === 'carreras' && <GestionCarreras />}
        {vistaActiva === 'alumnos' && <GestionAlumnos />}
      </Box>
    </Box>
  );
}