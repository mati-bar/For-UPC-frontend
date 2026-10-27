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
  IconButton,
  useMediaQuery,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { useNavigate, useSearchParams } from 'react-router-dom';

import EditorAnuncios from './EditorAnuncios';
import GestionCarreras from './GestionCarreras';
import GestionAlumnos from './GestionAlumnos';
import logoUPC from './assets/logo-sede-laboulaye.png';

const anchoMenu = 250;

// Ruta del feed, definida en App.jsx
const RUTA_FEED = '/feed';

// Vistas permitidas en la URL (?vista=...). Cualquier otro valor cae en 'inicio'
const VISTAS_VALIDAS = ['inicio', 'editor', 'carreras', 'alumnos'];

// Tarjetas de la pantalla de inicio
const TARJETAS = [
  { id: 'editor', titulo: 'Publicar Anuncio', descripcion: 'Crear y enviar notificaciones', Icono: CampaignRoundedIcon },
  { id: 'carreras', titulo: 'Gestión de Carreras', descripcion: 'Administrar carreras y años', Icono: SchoolRoundedIcon },
  { id: 'alumnos', titulo: 'Gestión de Alumnos', descripcion: 'Ver y editar alumnos', Icono: PeopleAltRoundedIcon },
];

export default function PanelAdmin() {
  const navigate = useNavigate();

  // Pantallas chicas (menos de 900px): el menú lateral pasa a ser un cajón que se abre con un botón
  // (consulta de texto: no depende de que la app tenga un ThemeProvider)
  const esMovil = useMediaQuery('(max-width:899.95px)');
  const [menuAbierto, setMenuAbierto] = useState(false);

  // La vista activa se guarda en la URL, así sobrevive a la recarga (F5)
  const [searchParams, setSearchParams] = useSearchParams();
  const vistaParam = searchParams.get('vista');
  const vistaActiva = VISTAS_VALIDAS.includes(vistaParam) ? vistaParam : 'inicio';

  const setVistaActiva = (vista) => {
    setSearchParams(vista === 'inicio' ? {} : { vista });
    setMenuAbierto(false); // en celular, el cajón se cierra al elegir una sección
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('token'); // sin esto el JWT quedaba guardado después de salir
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

  // Contenido del menú: se reutiliza en el menú fijo (escritorio) y en el cajón (celular)
  const contenidoMenu = (
    <>
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
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.88rem',
                      fontWeight: activo ? 700 : 500,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  const estiloPaperMenu = {
    width: anchoMenu,
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f8fafc', minHeight: '100vh' }}>

      {/* MENÚ LATERAL: solo si vistaActiva !== 'inicio'.
          Escritorio: fijo a la izquierda. Celular: cajón que se abre con el botón de la barra superior. */}
      {mostrarMenu && (
        esMovil ? (
          <Drawer
            variant="temporary"
            open={menuAbierto}
            onClose={() => setMenuAbierto(false)}
            ModalProps={{ keepMounted: true }} // mejor rendimiento al abrir en celulares
            sx={{ '& .MuiDrawer-paper': estiloPaperMenu }}
          >
            {contenidoMenu}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              width: anchoMenu,
              flexShrink: 0,
              '& .MuiDrawer-paper': estiloPaperMenu,
            }}
          >
            {contenidoMenu}
          </Drawer>
        )
      )}

      {/* ÁREA DE CONTENIDO + APPBAR SUPERIOR (minWidth: 0 evita que el contenido ancho desborde la pantalla) */}
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          width: mostrarMenu && !esMovil ? `calc(100% - ${anchoMenu}px)` : '100%',
        }}
      >

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
          <Toolbar
            sx={{
              justifyContent: 'space-between',
              gap: 1,
              px: { xs: 1.5, sm: 2, md: 4 },
              minHeight: { xs: '64px !important', md: '82px !important' },
            }}
          >

            {/* Izquierda: botón del menú (solo celular), logo (en inicio) y perfil del administrador */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, minWidth: 0 }}>
              {mostrarMenu && esMovil && (
                <IconButton
                  aria-label="Abrir menú"
                  edge="start"
                  onClick={() => setMenuAbierto(true)}
                  sx={{ color: '#475569' }}
                >
                  <MenuRoundedIcon />
                </IconButton>
              )}
              {!mostrarMenu && (
                <Box
                  component="img"
                  src={logoUPC}
                  alt="Logo UPC"
                  sx={{ height: { xs: 36, sm: 50 }, width: 'auto', mr: { xs: 0, sm: 1 }, display: { xs: 'none', sm: 'block' } }}
                />
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Avatar
                  sx={{
                    bgcolor: '#fffbeb',
                    color: '#f7a600',
                    border: '1px solid #fef3c7',
                    width: { xs: 34, sm: 38 },
                    height: { xs: 34, sm: 38 },
                    flexShrink: 0,
                  }}
                >
                  <AdminPanelSettingsRoundedIcon sx={{ fontSize: 22 }} />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, fontSize: { xs: '0.82rem', sm: '0.875rem' } }}
                  >
                    Administrador General
                  </Typography>
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ color: '#64748b', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}
                  >
                    Sede Laboulaye • Gestión UPC
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Derecha: volver al feed y cerrar sesión (en celular, solo íconos) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.5 }, flexShrink: 0 }}>
              <Button
                variant="contained"
                size="small"
                aria-label="Volver al feed"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => navigate(RUTA_FEED)}
                sx={{
                  bgcolor: '#f7a600',
                  color: '#ffffff',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  borderRadius: 2,
                  px: { xs: 1, sm: 1.75 },
                  py: 0.6,
                  minWidth: 0,
                  boxShadow: 'none',
                  '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 }, ml: { xs: 0, sm: -0.5 } },
                  '&:hover': { bgcolor: '#bc7e01', boxShadow: 'none' },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Volver al Feed</Box>
              </Button>

              <Button
                variant="outlined"
                size="small"
                aria-label="Cerrar sesión"
                startIcon={<LogoutRoundedIcon />}
                onClick={handleCerrarSesion}
                sx={{
                  color: '#475569',
                  borderColor: '#cbd5e1',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  borderRadius: 2,
                  px: { xs: 1, sm: 1.75 },
                  py: 0.6,
                  minWidth: 0,
                  '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 }, ml: { xs: 0, sm: -0.5 } },
                  '&:hover': {
                    borderColor: '#94a3b8',
                    bgcolor: '#f1f5f9',
                  },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Cerrar Sesión</Box>
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* CONTENIDO PRINCIPAL */}
        <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, sm: 3, md: 5 } }}>
          {vistaActiva === 'inicio' && (
            <Box>
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#0f172a',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    fontSize: { xs: '1.6rem', sm: '2.125rem' },
                    mb: 1,
                  }}
                >
                  Panel de Administración
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Selecciona una sección para gestionar la información académica y los comunicados
                </Typography>
              </Box>

              {/* En celular las tarjetas ocupan todo el ancho; en pantallas grandes miden 270px */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 2, sm: 3 }, flexWrap: 'wrap' }}>
                {TARJETAS.map(({ id, titulo, descripcion, Icono }) => (
                  <Card
                    key={id}
                    sx={{
                      width: { xs: '100%', sm: 270 },
                      maxWidth: { xs: 420, sm: 270 },
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
                    <CardActionArea onClick={() => setVistaActiva(id)} sx={{ p: 2, height: '100%' }}>
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
                          <Icono sx={{ fontSize: 30, color: '#f7a600' }} />
                        </Box>
                        <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700, fontSize: '1.05rem', mb: 0.5 }}>
                          {titulo}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {descripcion}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
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