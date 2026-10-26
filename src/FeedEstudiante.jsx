import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Button, Chip, Divider, Paper,
  Alert, CircularProgress, Link, Dialog, IconButton, Pagination
} from '@mui/material';
import {
  Logout, School, FiberManualRecord, AttachFile, Refresh, Close, Download, AdminPanelSettings, Person
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// En .env: VITE_API_URL=https://for-upc-backend.onrender.com
const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ⚠️ Rutas de tu router: cambialas si usás otras
const RUTA_PANEL_ADMIN = '/admin';
const RUTA_PERFIL = '/perfil';

// ------------------------------------------------------------------ helpers
class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const mensajePorEstado = (status, texto) => {
  if (status === 401) return 'Tu sesión venció. Volvé a iniciar sesión.';
  if (status === 403) return 'No tenés permisos para realizar esta acción.';
  return texto || `Error ${status}`;
};

// Centraliza URL base, JWT y manejo de errores (el backend puede devolver texto plano)
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(API + path, {
    method,
    cache: 'no-store', // siempre datos frescos, nunca una copia guardada por el navegador
    headers: {
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  if (!res.ok) throw new ApiError(res.status, mensajePorEstado(res.status, await res.text()));
  return res.json();
}

// El backend pagina (máx. 100 por página) pero NO filtra por carrera/año del alumno: ese filtro
// se hace acá. Por eso se traen todas las páginas, se filtra y recién después se pagina en pantalla.
// Si se paginara directo en el servidor, un alumno vería páginas incompletas o vacías.
const POR_PAGINA = 5;        // publicaciones que se muestran por página en pantalla
const TAM_PAGINA_API = 100;  // tamaño de página que se pide al backend (máximo permitido)
const MAX_PAGINAS_API = 20;  // tope de seguridad contra bucles

async function cargarTodasLasPublicaciones() {
  const todas = [];
  for (let page = 0; page < MAX_PAGINAS_API; page++) {
    const data = await request(`/publicaciones?page=${page}&size=${TAM_PAGINA_API}`, { auth: false });
    if (Array.isArray(data)) return data; // respuesta sin paginar (array simple)
    todas.push(...(data?.content ?? []));
    if (page + 1 >= (data?.totalPages ?? 1)) break;
  }
  return todas;
}

const tiempoRelativo = (iso) => {
  if (!iso) return '';
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  for (const [unidad, seg] of [['day', 86400], ['hour', 3600], ['minute', 60]]) {
    if (Math.abs(diff) >= seg) return rtf.format(Math.round(diff / seg), unidad);
  }
  return 'hace instantes';
};

// Normaliza los destinos de una publicación (incluye las históricas con carrera/anio sueltos)
const destinosDe = (p) => {
  if (p.destinos && p.destinos.length > 0) {
    return p.destinos.map((d) => ({ carreraId: d.carrera?.id, carrera: d.carrera?.nombre, numero: d.anio?.numero }));
  }
  if (p.carrera) return [{ carreraId: p.carrera.id, carrera: p.carrera.nombre, numero: p.anio?.numero }];
  return [];
};

// Nombre de archivo a partir del título del anuncio: "Inscripciones abiertas" -> inscripciones-abiertas.jpg
const nombreArchivo = (url, titulo) => {
  const ext = (url.split('?')[0].match(/\.(png|jpe?g|gif|webp|svg)$/i) || [])[1] || 'jpg';
  const base = (titulo || 'imagen')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  return `${base || 'imagen'}.${ext}`;
};

// El atributo "download" se ignora en imágenes de otro dominio (Supabase), por eso se
// baja el archivo como blob. Si el servidor no lo permite, se abre en una pestaña nueva.
async function descargarImagen(url, titulo) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = nombreArchivo(url, titulo);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

const ordenarInscripciones = (insc = []) =>
  [...insc].sort((a, b) => a.carrera.localeCompare(b.carrera) || a.numero - b.numero);

// ---------------------------------------------------------------- componente
export default function VistaForo() {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [imagenAbierta, setImagenAbierta] = useState(null); // { url, titulo }
  const [pagina, setPagina] = useState(1); // página actual del feed (empieza en 1)

  const handleCerrarSesion = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/');
  }, [navigate]);

  // Si el backend responde 401, la sesión no sirve más
  const manejarError = useCallback((err, setter) => {
    if (err.status === 401) return handleCerrarSesion();
    setter(err.message || 'Ocurrió un error inesperado.');
  }, [handleCerrarSesion]);

  // ------------------------------------------------------- carga principal
  // silencioso = true: refresca sin spinner ni cartel de error (para el refresco automático)
  const cargar = useCallback(async ({ silencioso = false } = {}) => {
    if (!silencioso) {
      setCargando(true);
      setError('');
    }
    try {
      const [p, pubs] = await Promise.all([
        request('/usuarios/me'),
        cargarTodasLasPublicaciones() // lectura pública: junta todas las páginas del backend
      ]);
      setPerfil(p);
      setPublicaciones(pubs);
    } catch (err) {
      if (silencioso) {
        if (err.status === 401) handleCerrarSesion(); // sesión vencida: igual se cierra
        return; // cualquier otro fallo: se conserva lo que ya se está mostrando
      }
      if (err instanceof TypeError) {
        setError(`No se pudo conectar con ${API}. Revisá que el backend esté corriendo.`);
      } else {
        manejarError(err, setError);
      }
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, [manejarError, handleCerrarSesion]);

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/'); return; }
    cargar();
  }, [cargar, navigate]);

  // Refresco automático: si el administrador cambia los destinatarios de un anuncio,
  // el alumno deja de verlo sin tener que apretar "Actualizar".
  useEffect(() => {
    const refrescar = () => {
      if (document.visibilityState === 'visible') cargar({ silencioso: true });
    };
    const intervalo = setInterval(refrescar, 60000); // cada 60 segundos
    document.addEventListener('visibilitychange', refrescar); // al volver a la pestaña
    window.addEventListener('focus', refrescar);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', refrescar);
      window.removeEventListener('focus', refrescar);
    };
  }, [cargar]);

  // --------------------------------------------------------------- filtrado
  const esEstudiante = perfil?.rol === 'ESTUDIANTE';
  const esAdmin = perfil?.rol === 'ADMINISTRADOR';
  const inscripciones = useMemo(() => ordenarInscripciones(perfil?.inscripciones), [perfil]);

  const feed = useMemo(() => {
    const ahora = Date.now();
    return publicaciones
      .filter((p) => !p.fechaExpiracion || new Date(p.fechaExpiracion).getTime() > ahora)
      .map((p) => {
        const destinos = destinosDe(p);
        // Destinos que le corresponden al estudiante (carrera + número de año)
        const propios = destinos.filter((d) =>
          inscripciones.some((i) => i.carreraId === d.carreraId && (d.numero == null || i.numero === d.numero))
        );
        return { ...p, propios };
      })
      .filter((p) => !esEstudiante || p.propios.length > 0)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [publicaciones, inscripciones, esEstudiante]);

  // Paginación en pantalla (sobre el feed ya filtrado)
  const totalPaginas = Math.max(1, Math.ceil(feed.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas); // si el feed se achica al refrescar, no queda una página vacía
  const desde = (paginaActual - 1) * POR_PAGINA;
  const feedPagina = feed.slice(desde, desde + POR_PAGINA);

  const cambiarPagina = (_, nueva) => {
    setPagina(nueva);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resumenCarreras = inscripciones.length
    ? inscripciones.map((i) => `${i.carrera} • ${i.numero}° Año`).join('  /  ')
    : 'Sin carreras asignadas';

  // El administrador no tiene carrera ni año: solo se muestra su nombre
  const textoEncabezado = !perfil
    ? 'Cargando perfil...'
    : esEstudiante
      ? `${perfil.nombre} ${perfil.apellido} — ${resumenCarreras}`
      : `${perfil.nombre} ${perfil.apellido}`;

  const abrirImagen = (p) => setImagenAbierta({ url: p.imagenUrl, titulo: p.titulo });

  // ------------------------------------------------------------------ vista
  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', pb: 6 }}>

      {/* BARRA SUPERIOR */}
      <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0', py: 2, px: { xs: 2, md: 4 }, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem' }}>
            Portal Informativo Académico
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 500 }}>
            <School sx={{ fontSize: 16, color: '#f59e0b' }} />
            {textoEncabezado}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {esAdmin && (
            <Button variant="contained" size="small" startIcon={<AdminPanelSettings />} onClick={() => navigate(RUTA_PANEL_ADMIN)}
              sx={{ bgcolor: '#f7a600', color: '#fff', textTransform: 'none', fontWeight: 700, boxShadow: 'none', '&:hover': { bgcolor: '#bc7e01', boxShadow: 'none' } }}>
              Panel de Administración
            </Button>
          )}
        {/* Botón visible para TODOS los usuarios con sesión iniciada */}
          {perfil && (
            <Button variant="outlined" size="small" startIcon={<Person />} onClick={() => navigate(RUTA_PERFIL)}
              sx={{ color: '#f7a600', borderColor: '#f7a600', textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: '#bc7e01', bgcolor: '#fffbeb', color: '#bc7e01' } }}>
              Mi Perfil
            </Button>
          )}
          
          <Button variant="outlined" size="small" startIcon={<Logout />} onClick={handleCerrarSesion}
            sx={{ color: '#475569', borderColor: '#cbd5e1', textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: '#94a3b8', bgcolor: '#f1f5f9' } }}>
            Cerrar Sesión
          </Button>
        </Box>
      </Box>
      
      <Container maxWidth="md">

        {/* ENCABEZADO */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Novedades y Comunicados
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Información oficial filtrada exclusivamente para tu carrera y año de cursada.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!cargando && !error && (
              <Chip
                icon={<FiberManualRecord sx={{ fontSize: '10px !important', color: '#10b981 !important' }} />}
                label="Feed Actualizado" size="small"
                sx={{ bgcolor: '#ecfdf5', color: '#065f46', fontWeight: 600, border: '1px solid #a7f3d0' }}
              />
            )}
            <Button size="small" startIcon={<Refresh />} onClick={() => cargar()} disabled={cargando} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Actualizar
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

        {cargando && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}

        {/* TARJETAS DE COMUNICADOS */}
        {!cargando && feedPagina.map((p) => (
          <Card key={p.id} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)', mb: 3, '&:hover': { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)' } }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 1.5 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {p.urgente && (
                    <Chip label="Urgente" size="small" sx={{ bgcolor: '#ffe4e6', color: '#e11d48', fontWeight: 600, border: '1px solid #fecdd3' }} />
                  )}
                  {(p.propios.length ? p.propios : destinosDe(p)).map((d, i) => (
                    <Chip key={i} size="small"
                      label={`${d.carrera}${d.numero ? ` - ${d.numero}° Año` : ''}`}
                      sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: '0.75rem', border: '1px solid #e2e8f0' }} />
                  ))}
                </Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>
                  {tiempoRelativo(p.fecha)}
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '1.05rem', lineHeight: 1.4 }}>
                {p.titulo}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mb: 2, lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                {p.mensaje}
              </Typography>

              {p.imagenUrl && (
                <Box
                  component="img"
                  src={p.imagenUrl}
                  alt={p.titulo}
                  role="button"
                  tabIndex={0}
                  onClick={() => abrirImagen(p)}
                  onKeyDown={(e) => e.key === 'Enter' && abrirImagen(p)}
                  sx={{
                    maxWidth: '100%', maxHeight: 320, borderRadius: 1.5, mb: 2, display: 'block',
                    cursor: 'zoom-in', transition: 'opacity 0.15s', '&:hover': { opacity: 0.92 }
                  }}
                />
              )}
              {p.archivoUrl && (
                <Link href={p.archivoUrl} target="_blank" rel="noopener noreferrer" underline="hover"
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2, fontSize: '0.875rem' }}>
                  <AttachFile fontSize="small" /> {p.archivoNombre || 'Ver archivo adjunto'}
                </Link>
              )}

              <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />
              <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                Publicado por: Administrador Institucional
              </Typography>
            </CardContent>
          </Card>
        ))}

        {/* PAGINACIÓN */}
        {!cargando && totalPaginas > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
            <Pagination
              count={totalPaginas}
              page={paginaActual}
              onChange={cambiarPagina}
              shape="rounded"
              siblingCount={0}
              sx={{
                '& .MuiPaginationItem-root': { fontWeight: 600, color: '#475569' },
                '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#f7a600', color: '#fff' },
                '& .MuiPaginationItem-root.Mui-selected:hover': { bgcolor: '#bc7e01' }
              }}
            />
          </Box>
        )}

        {/* FIN DE FEED */}
        {!cargando && (
          <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center', bgcolor: 'transparent', boxShadow: 'none' }}>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>
              {feed.length === 0
                ? (esEstudiante ? 'Todavía no hay publicaciones para tu carrera y año.' : 'Todavía no hay publicaciones.')
                : `Mostrando ${desde + 1}–${desde + feedPagina.length} de ${feed.length} publicaciones`}
            </Typography>
          </Paper>
        )}
      </Container>

      {/* VISOR DE IMAGEN */}
      <Dialog
        open={Boolean(imagenAbierta)}
        onClose={() => setImagenAbierta(null)}
        maxWidth="lg"
        PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', m: 1 } }}
      >
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Download />}
            onClick={() => descargarImagen(imagenAbierta.url, imagenAbierta.titulo)}
            sx={{
              bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', textTransform: 'none', fontWeight: 600,
              boxShadow: 'none', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)', boxShadow: 'none' }
            }}
          >
            Descargar
          </Button>
          <IconButton
            aria-label="Cerrar imagen"
            onClick={() => setImagenAbierta(null)}
            sx={{ bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}
          >
            <Close />
          </IconButton>
        </Box>
        {imagenAbierta && (
          <Box
            component="img"
            src={imagenAbierta.url}
            alt={imagenAbierta.titulo}
            sx={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 1, display: 'block' }}
          />
        )}
      </Dialog>

    </Box>
  );
}