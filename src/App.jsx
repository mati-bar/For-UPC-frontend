import React from 'react';
import { 
  AppBar, Toolbar, Typography, Box, Avatar, Card, CardContent, 
  TextField, Button, Chip, IconButton, Container, InputAdornment, Divider 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ReplyIcon from '@mui/icons-material/Reply';

export default function App() {
  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', pb: 12 }}>
      
      {/* 1. NAVBAR INSTITUCIONAL */}
      <AppBar position="sticky" elevation={1} sx={{ backgroundColor: 'white', color: 'text.primary', borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            
            {/* Logo UPC */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ bgcolor: '#0F2C59', color: 'white', p: 1, borderRadius: 2, fontWeight: 'bold' }}>
                UPC
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0B1E3B', lineHeight: 1 }}>FOR UPC</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Comunidad Universitaria</Typography>
              </Box>
            </Box>

            {/* Buscador Central */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, width: '100%', maxWidth: 500 }}>
              <TextField 
                fullWidth
                size="small"
                placeholder="Buscar preguntas, asignaturas..."
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }}/></InputAdornment>,
                  sx: { borderRadius: 5, backgroundColor: '#f1f5f9' }
                }}
              />
            </Box>

            {/* Perfil de Usuario */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton><NotificationsIcon /></IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderLeft: '1px solid #e2e8f0', pl: 2 }}>
                <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" sx={{ width: 32, height: 32 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>Valeria M.</Typography>
              </Box>
            </Box>

          </Toolbar>
        </Container>
      </AppBar>

      {/* 2. CONTENEDOR CENTRAL DEL TEMA */}
      <Container maxWidth="md" sx={{ mt: 4 }}>
        
        {/* Breadcrumb (Ruta de navegación) */}
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
          Foros &gt; Programación &gt; Optimización de algoritmos
        </Typography>

        {/* TARJETA DEL POST PRINCIPAL */}
        <Card sx={{ borderRadius: 4, mb: 4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 4 }}>
            
            {/* Encabezado del autor */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80" sx={{ width: 48, height: 48 }} />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Mateo Silva</Typography>
                    <Chip label="Estudiante" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Publicado hace 2 horas • Campus Monterrico</Typography>
                </Box>
              </Box>
            </Box>

            {/* Título y Etiquetas */}
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B', mb: 2 }}>
              ¿Cómo reducir el consumo de memoria con generadores en Python para datasets grandes?
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Chip label="#Python" size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 'bold' }} />
              <Chip label="#Algoritmos" size="small" sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 'bold' }} />
            </Box>

            {/* Cuerpo del mensaje */}
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.7 }}>
              Buenas tardes a la comunidad. En el curso de Algoritmos Avanzados nos solicitaron procesar un archivo log de transacciones de aproximadamente 4.2 GB. Al usar una lista convencional, la máquina virtual colapsa por Out of Memory (OOM). ¿Es conveniente usar yield línea a línea?
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<ThumbUpOutlinedIcon />} size="small" sx={{ color: 'text.secondary', borderColor: '#e2e8f0' }}>
                Me gusta (14)
              </Button>
              <Button variant="text" startIcon={<ShareOutlinedIcon />} size="small" sx={{ color: 'text.secondary' }}>
                Compartir
              </Button>
            </Box>

          </CardContent>
        </Card>

        {/* TARJETA DE RESPUESTA */}
        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', color: 'text.secondary', mb: 2, fontWeight: 'bold' }}>
          Respuestas de la comunidad
        </Typography>

        <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <CardContent sx={{ p: 3 }}>
             <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Avatar src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Dra. Elena Torres</Typography>
                    <Chip label="Docente" size="small" sx={{ bgcolor: '#fef3c7', color: '#b45309', height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Hace 1 hora</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Hola Mateo. Para 4.2 GB de logs textuales, no cargues todo a memoria. Te sugiero un generador puro que aproveche el protocolo de iteración de archivos en Python.
              </Typography>
              <Button size="small" startIcon={<ReplyIcon />} sx={{ color: 'text.secondary' }}>Responder</Button>
          </CardContent>
        </Card>

      </Container>

      {/* 3. CAJA DE TEXTO INFERIOR FIJA PARA RESPONDER */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', borderTop: '1px solid #e2e8f0', p: 2, zIndex: 10 }}>
        <Container maxWidth="md" sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" />
          <TextField 
            fullWidth 
            size="small" 
            placeholder="Escribe una respuesta técnica..." 
            sx={{ bgcolor: 'white' }}
          />
          <Button variant="contained" sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}>
            Responder
          </Button>
        </Container>
      </Box>

    </Box>
  );
}