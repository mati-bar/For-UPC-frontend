import React from 'react';
import { 
AppBar, Toolbar, Typography, Box, Avatar, Card, CardContent, 
Button, Chip, IconButton, Divider, List, ListItem, ListItemIcon, ListItemText,
Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Badge
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ForumIcon from '@mui/icons-material/Forum';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function PanelAdmin() {
return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
    
      {/* Navbar Superior */}
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: '#0f2c59', color: 'white' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ bgcolor: '#dc2626', color: 'white', p: 0.5, px: 1, borderRadius: 1, fontWeight: 'bold', fontSize: '0.8rem' }}>
                UPC
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>FOR UPC</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 2 }} />
            <Chip 
            icon={<SecurityIcon style={{ color: '#fcd34d' }} fontSize="small" />} 
            label="Modo Administrador" 
            size="small" 
            sx={{ bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.4)', fontWeight: 'bold' }} 
            />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1 }}>Mag. Roberto Cárdenas</Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Coordinación de Calidad Académica</Typography>
            </Box>
            <Avatar src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80" sx={{ border: '1px solid #475569' }} />
        </Box>

        </Toolbar>
    </AppBar>

      {/* Contenedor Principal: Sidebar + Contenido */}
    <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        
        {/* Sidebar Lateral */}
        <Box sx={{ width: 260, bgcolor: 'white', borderRight: '1px solid #e2e8f0', p: 2, display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#94a3b8', mb: 2, px: 2 }}>GESTIÓN DE PLATAFORMA</Typography>
        
        <List sx={{ flexGrow: 1 }}>
            <ListItem button sx={{ bgcolor: '#eff6ff', borderRadius: 2, mb: 1, color: '#1e3a8a' }}>
            <ListItemIcon sx={{ minWidth: 40, color: '#1e3a8a' }}><DashboardIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Cartelera Oficial" primaryTypographyProps={{ fontWeight: 'bold', fontSize: '0.875rem' }} />
            <Chip label="Activo" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#dbeafe', color: '#1e3a8a', fontWeight: 'bold' }} />
            </ListItem>
            
            <ListItem button sx={{ borderRadius: 2, mb: 1, color: '#475569' }}>
            <ListItemIcon sx={{ minWidth: 40 }}><ForumIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Foros y Categorías" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'medium' }} />
            </ListItem>

            <ListItem button sx={{ borderRadius: 2, mb: 1, color: '#475569' }}>
            <ListItemIcon sx={{ minWidth: 40 }}><PeopleIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Usuarios" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'medium' }} />
            </ListItem>

            <ListItem button sx={{ borderRadius: 2, mb: 1, color: '#475569' }}>
            <ListItemIcon sx={{ minWidth: 40 }}><SecurityIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Moderación" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'medium' }} />
            <Badge badgeContent={3} color="error" />
            </ListItem>
        </List>
        </Box>

        {/* Área Central de Trabajo */}
        <Box sx={{ flexGrow: 1, p: 4, overflowY: 'auto' }}>
        
          {/* Módulo de Cartelera */}
        <Card sx={{ borderRadius: 4, mb: 4, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a' }}>Cartelera Oficial UPC</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Comunicados prioritarios visibles para todos los alumnos.</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' }, textTransform: 'none', fontWeight: 'bold', borderRadius: 2 }}>
                Nuevo Anuncio
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Título</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Autor</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Alcance</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#64748b' }}>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow hover>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e293b' }}>Inicio del Periodo de Matrícula 2026-II</TableCell>
                    <TableCell sx={{ color: '#64748b' }}>14 Sep 2026</TableCell>
                    <TableCell sx={{ color: '#334155' }}>Secretaría Académica</TableCell>
                    <TableCell><Chip label="Todos los Campus" size="small" sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 'bold', fontSize: '0.65rem' }} /></TableCell>
                    <TableCell align="right">
                        <IconButton size="small" sx={{ color: '#94a3b8' }}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" sx={{ color: '#ef4444' }}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                    </TableRow>
                </TableBody>
                </Table>
            </TableContainer>
            </CardContent>
        </Card>

          {/* Módulo de Moderación */}
        <Card sx={{ borderRadius: 4, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a' }}>Panel de Moderación</Typography>
                <Chip label="3 pendientes" size="small" sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 3 }}>Mensajes marcados por la comunidad que requieren revisión.</Typography>

            <Box sx={{ border: '1px solid #e2e8f0', bgcolor: '#f8fafc', borderRadius: 3, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                <Chip label="Posible Spam" size="small" sx={{ bgcolor: '#ffe4e6', color: '#9f1239', height: 20, fontSize: '0.65rem', fontWeight: 'bold', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0f172a' }}>"Vendo solucionario del parcial de Finanzas 2026-I a 20 soles al DM"</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Publicado por @alumno_anon92 en Foro General</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<CheckCircleIcon />} size="small" sx={{ color: '#059669', borderColor: '#cbd5e1', bgcolor: 'white', textTransform: 'none' }}>
                    Aprobar
                </Button>
                <Button variant="contained" startIcon={<DeleteIcon />} size="small" sx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' }, textTransform: 'none' }}>
                    Eliminar
                </Button>
                </Box>
            </Box>
            </CardContent>
        </Card>

        </Box>
    </Box>
    </Box>
);
}