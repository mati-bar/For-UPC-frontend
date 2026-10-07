import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  AppBar,
  Toolbar,
  Button,
  Avatar,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import { useNavigate } from 'react-router-dom';

import EditorAnuncios from './EditorAnuncios';
import GestionCarreras from './GestionCarreras';
import GestionAlumnos from './GestionAlumnos';
import logoUPC from './assets/logo-sede-laboulaye.png';

const anchoMenu = 250;

export default function PanelAdmin() {
  const [vistaActiva, setVistaActiva] = useState('inicio');
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    navigate('/');
  };

  // Variable que determina si mostramos el menú lateral
  const mostrarMenu = vistaActiva !== 'inicio';

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: <DashboardRoundedIcon fontSize="small" /> },
    { id: 'editor', label: 'Publicar Anuncio', icon: <CampaignRoundedIcon fontSize="small" /> },
    { id: 'carreras', label: 'Gestión de Carreras', icon: <SchoolRoundedIcon fontSize="small" /> },
    { id: 'alumnos', label: 'Gestión de Alumnos', icon: <PeopleAltRoundedIcon fontSize="small" /> },
  ];

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* SIDEBAR / MENÚ LATERAL: Solo se renderiza si vistaActiva !== 'inicio' */}
      {mostrarMenu && (
        <Drawer
          variant="permanent"
          sx={{
            width: anchoMenu,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: anchoMenu,
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
              borderRight: '1px solid #e2e8f0',
            },
          }}
        >
          <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid #e2e8f0', minHeight: 64, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box
              component="img"
              src={logoUPC}
              alt="Logo UPC"
              sx={{
                height: 50,
                width: 'auto',
                maxWidth: '100%',
                mx: 'auto',
                mb: 1.2,
                display: 'block',
                objectFit: 'contain',
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                color: '#0f172a',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
              }}
            >
              Administración
            </Typography>
          </Box>

          {/* LISTADO DE NAVEGACIÓN */}
          <List sx={{ px: 1.5, py: 2 }}>
            {menuItems.map((item) => {
              const activo = vistaActiva === item.id;
              return (
                <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => setVistaActiva(item.id)}
                    sx={{
                      borderRadius: 2,
                      py: 1.1,
                      px: 1.75,
                      bgcolor: activo ? '#fef3c7' : 'transparent',
                      color: activo ? '#92400e' : '#475569',
                      borderLeft: activo ? '3.5px solid #f7a600' : '3.5px solid transparent',
                      '&:hover': {
                        bgcolor: activo ? '#fde68a' : '#f1f5f9',
                        color: activo ? '#78350f' : '#0f172a',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: activo ? '#f7a600' : '#64748b',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.88rem',
                        fontWeight: activo ? 700 : 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Drawer>
      )}

      {/* ÁREA DE CONTENIDO + APPBAR SUPERIOR */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: mostrarMenu ? `calc(100% - ${anchoMenu}px)` : '100%' }}>
        
        {/* APPBAR SUPERIOR */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            color: '#0f172a',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, minHeight: '82px !important' }}>
            
            {/* Perfil del Administrador (o Logo si está en inicio) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {!mostrarMenu && (
                <Box
                  component="img"
                  src={logoUPC}
                  alt="Logo UPC"
                  sx={{ height: 50, width: 'auto', mr: 1 }}
                />
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    bgcolor: '#fffbeb',
                    color: '#f7a600',
                    border: '1px solid #fef3c7',
                    width: 38,
                    height: 38,
                  }}
                >
                  <AdminPanelSettingsRoundedIcon sx={{ fontSize: 22 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                    Administrador General
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block' }}>
                    Sede Laboulaye • Gestión UPC
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Botón Cerrar Sesión */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<LogoutRoundedIcon />}
              onClick={handleCerrarSesion}
              sx={{
                color: '#475569',
                borderColor: '#cbd5e1',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                borderRadius: 2,
                px: 1.75,
                py: 0.6,
                '&:hover': {
                  borderColor: '#94a3b8',
                  bgcolor: '#f1f5f9',
                },
              }}
            >
              Cerrar Sesión
            </Button>
          </Toolbar>
        </AppBar>

        {/* CONTENIDO PRINCIPAL */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 3, md: 5 } }}>
          {vistaActiva === 'inicio' && (
            <Box>
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#0f172a',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    mb: 1,
                  }}
                >
                  Panel de Administración
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Selecciona una sección para gestionar la información académica y los comunicados
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                {/* Tarjeta 1: Publicar Anuncio */}
                <Card
                  sx={{
                    width: 270,
                    borderRadius: 2.5,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px -4px rgb(0 0 0 / 0.08)',
                      borderColor: '#f7a600',
                    },
                  }}
                >
                  <CardActionArea onClick={() => setVistaActiva('editor')} sx={{ p: 2, height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                      <Box
                        sx={{
                          width: 58,
                          height: 58,
                          borderRadius: '50%',
                          backgroundColor: '#fffbeb',
                          border: '1px solid #fef3c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <CampaignRoundedIcon sx={{ fontSize: 30, color: '#f7a600' }} />
                      </Box>
                      <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700, fontSize: '1.05rem', mb: 0.5 }}>
                        Publicar Anuncio
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                        Crear y enviar notificaciones
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>

                {/* Tarjeta 2: Gestión de Carreras */}
                <Card
                  sx={{
                    width: 270,
                    borderRadius: 2.5,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px -4px rgb(0 0 0 / 0.08)',
                      borderColor: '#f7a600',
                    },
                  }}
                >
                  <CardActionArea onClick={() => setVistaActiva('carreras')} sx={{ p: 2, height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                      <Box
                        sx={{
                          width: 58,
                          height: 58,
                          borderRadius: '50%',
                          backgroundColor: '#fffbeb',
                          border: '1px solid #fef3c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <SchoolRoundedIcon sx={{ fontSize: 30, color: '#f7a600' }} />
                      </Box>
                      <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700, fontSize: '1.05rem', mb: 0.5 }}>
                        Gestión de Carreras
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                        Administrar carreras y años
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>

                {/* Tarjeta 3: Gestión de Alumnos */}
                <Card
                  sx={{
                    width: 270,
                    borderRadius: 2.5,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px -4px rgb(0 0 0 / 0.08)',
                      borderColor: '#f7a600',
                    },
                  }}
                >
                  <CardActionArea onClick={() => setVistaActiva('alumnos')} sx={{ p: 2, height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                      <Box
                        sx={{
                          width: 58,
                          height: 58,
                          borderRadius: '50%',
                          backgroundColor: '#fffbeb',
                          border: '1px solid #fef3c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <PeopleAltRoundedIcon sx={{ fontSize: 30, color: '#f7a600' }} />
                      </Box>
                      <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700, fontSize: '1.05rem', mb: 0.5 }}>
                        Gestión de Alumnos
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                        Ver y editar alumnos
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            </Box>
          )}

          {vistaActiva === 'editor' && <EditorAnuncios />}
          {vistaActiva === 'carreras' && <GestionCarreras />}
          {vistaActiva === 'alumnos' && <GestionAlumnos />}
        </Box>
      </Box>
    </Box>
  );
}