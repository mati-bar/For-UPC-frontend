import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Button, Chip, Divider, Paper,
  Alert, CircularProgress, Link, Dialog, IconButton, Pagination
} from '@mui/material';
import {
  Logout, School, AttachFile, Refresh, Close, Download, AdminPanelSettings, Person
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'https://for-upc-backend.onrender.com';
const RUTA_PANEL_ADMIN = '/admin';
const RUTA_PERFIL = '/perfil';
const POR_PAGINA = 5;

// ------------------------------------------------------------------ helpers
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const mensajePorEstado = (status, texto) => {
  if (status === 401) return 'Tu sesión venció. Volvé a iniciar sesión.';
  if (status === 403) return 'No tenés permisos para realizar esta acción.';
  return texto || `Error ${status}`;
};

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(API + path, {
    method,
    cache: 'no-store',
    headers: {
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  if (!res.ok) throw new ApiError(res.status, mensajePorEstado(res.status, await res.text()));
  return res.json();
}

// Pide una página al backend enviando auth para que sepa qué usuario es (page en base 0)
async function pedirPublicaciones(numeroPagina) {
  return request(`/publicaciones?page=${numeroPagina - 1}&size=${POR_PAGINA}`, { auth: true });
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

const destinosDe = (p) => {
  if (p.destinos && p.destinos.length > 0) {
    return p.destinos.map((d) => ({
      carreraId: d.carrera?.id,
      carrera: d.carrera?.nombre,
      numero: d.anio?.numero
    }));
  }
  if (p.carrera) {
    return [{ carreraId: p.carrera.id, carrera: p.carrera.nombre, numero: p.anio?.numero }];
  }
  return [];
};

const nombreArchivo = (url, titulo) => {
  const ext = (url.split('?')[0].match(/\.(png|jpe?g|gif|webp|svg)$/i) || [])[1] || 'jpg';
  const base = (titulo || 'imagen')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  return `${base || 'imagen'}.${ext}`;
};

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
  [...insc].sort((a, b) => a.carrera?.localeCompare(b.carrera) || a.numero - b.numero);

const botonCompacto = {
  minWidth: 0,
  px: { xs: 1, sm: 1.5 },
  '& .MuiButton-startIcon': { mr: { xs: 0, sm: '6px' }, ml: { xs: 0, sm: '-2px' } }
};

const Etiqueta = ({ children }) => (
  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{children}</Box>
);

// ------------------------------------------------ SUBCOMPONENTE DE CHIPS
// Muestra las primeras 2 carreras y un botón para alternar el resto ("View all")
function ChipsDestinos({ destinos = [] }) {
  const [expandido, setExpandido] = useState(false);
  const LIMITE = 2;

  if (!destinos.length) return null;

  const visibles = expandido ? destinos : destinos.slice(0, LIMITE);
  const restantes = destinos.length - LIMITE;

  return (
    <>
      {visibles.map((d, i) => (
        <Chip
          key={i}
          size="small"
          label={`${d.carrera}${d.numero ? ` • ${d.numero}° Año` : ''}`}
          sx={{
            bgcolor: '#f1f5f9',
            color: '#334155',
            fontWeight: 600,
            fontSize: '0.75rem',
            border: '1px solid #e2e8f0',
            maxWidth: '100%',
            height: 'auto',
            '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 }
          }}
        />
      ))}

      {destinos.length > LIMITE && (
        <Chip
          size="small"
          label={expandido ? 'Ver menos' : `+${restantes} ver todas`}
          onClick={() => setExpandido(!expandido)}
          clickable
          sx={{
            bgcolor: expandido ? '#f1f5f9' : '#fffbeb',
            color: expandido ? '#64748b' : '#b45309',
            border: `1px dashed ${expandido ? '#cbd5e1' : '#fcd34d'}`,
            fontWeight: 700,
            fontSize: '0.72rem',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: expandido ? '#e2e8f0' : '#fef3c7'
            }
          }}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------- COMPONENTE PRINCIPAL
export default function VistaForo() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);

  // Estados de feed idénticos al EditorAnuncios
  const [anunciosFeed, setAnunciosFeed] = useState([]);
  const [cargandoFeed, setCargandoFeed] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalAnuncios, setTotalAnuncios] = useState(0);

  const [error, setError] = useState('');
  const [imagenAbierta, setImagenAbierta] = useState(null);
  const feedRef = useRef(null);

  const handleCerrarSesion = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/');
  }, [navigate]);

  const manejarError = useCallback((err, setter) => {
    if (err.status === 401) return handleCerrarSesion();
    setter(err.message || 'Ocurrió un error inesperado.');
  }, [handleCerrarSesion]);

  // Carga del perfil de usuario
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
      return;
    }
    request('/usuarios/me')
      .then((p) => setPerfil(p))
      .catch((err) => manejarError(err, setError));
  }, [navigate, manejarError]);

  // Carga con paginación
  const cargarFeed = useCallback(async (paginaPedida = 1, { silencioso = false } = {}) => {
    if (!silencioso) {
      setCargandoFeed(true);
      setError('');
    }
    try {
      let numero = paginaPedida;
      let data = await pedirPublicaciones(numero);

      if (Array.isArray(data)) {
        setTotalAnuncios(data.length);
        setTotalPaginas(Math.max(1, Math.ceil(data.length / POR_PAGINA)));
        setAnunciosFeed(data.slice((numero - 1) * POR_PAGINA, numero * POR_PAGINA));
      } else {
        const total = Math.max(1, data?.totalPages ?? 1);
        if (numero > total) {
          numero = total;
          data = await pedirPublicaciones(numero);
        }

        const listaBruta = data?.content ?? [];
        if (listaBruta.length > POR_PAGINA && (data?.totalPages ?? 1) === 1) {
          setTotalAnuncios(listaBruta.length);
          setTotalPaginas(Math.max(1, Math.ceil(listaBruta.length / POR_PAGINA)));
          setAnunciosFeed(listaBruta.slice((numero - 1) * POR_PAGINA, numero * POR_PAGINA));
        } else {
          setTotalAnuncios(data?.totalElements ?? 0);
          setTotalPaginas(total);
          setAnunciosFeed(listaBruta);
        }
      }
      setPagina(numero);
    } catch (err) {
      if (silencioso) {
        if (err.status === 401) handleCerrarSesion();
        return;
      }
      if (err instanceof TypeError) {
        setError(`No se pudo conectar con ${API}. Revisá que el backend esté corriendo.`);
      } else {
        manejarError(err, setError);
      }
    } finally {
      if (!silencioso) setCargandoFeed(false);
    }
  }, [manejarError, handleCerrarSesion]);

  // Carga inicial
  useEffect(() => {
    cargarFeed(1);
  }, [cargarFeed]);

  // Auto-refresco en segundo plano cada 60s
  useEffect(() => {
    const refrescar = () => {
      if (document.visibilityState === 'visible') {
        cargarFeed(pagina, { silencioso: true });
      }
    };
    const intervalo = setInterval(refrescar, 60000);
    document.addEventListener('visibilitychange', refrescar);
    window.addEventListener('focus', refrescar);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', refrescar);
      window.removeEventListener('focus', refrescar);
    };
  }, [pagina, cargarFeed]);

  const cambiarPagina = async (_, nueva) => {
    await cargarFeed(nueva);
    feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const esEstudiante = perfil?.rol === 'ESTUDIANTE';
  const esAdmin = perfil?.rol === 'ADMINISTRADOR';
  const inscripciones = useMemo(() => ordenarInscripciones(perfil?.inscripciones), [perfil]);

  const resumenCarreras = inscripciones.length
    ? inscripciones.map((i) => `${i.carrera} • ${i.numero}° Año`).join('  /  ')
    : 'Sin carreras asignadas';

  const textoEncabezado = !perfil
    ? 'Cargando perfil...'
    : esEstudiante
      ? `${perfil.nombre} ${perfil.apellido} — ${resumenCarreras}`
      : `${perfil.nombre} ${perfil.apellido}`;

  const abrirImagen = (anuncio) => setImagenAbierta({ url: anuncio.imagenUrl, titulo: anuncio.titulo });

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', pb: 6 }}>
      {/* BARRA SUPERIOR */}
      <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0', py: { xs: 1.5, md: 2 }, px: { xs: 2, md: 4 }, mb: { xs: 2.5, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
            Portal Informativo Académico
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'flex-start', gap: 0.75, fontWeight: 500, lineHeight: 1.4 }}>
            <School sx={{ fontSize: 16, color: '#f59e0b', flexShrink: 0, mt: '1px' }} />
            <Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>{textoEncabezado}</Box>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          {esAdmin && (
            <Button
              variant="contained"
              size="small"
              aria-label="Panel de Administración"
              startIcon={<AdminPanelSettings />}
              onClick={() => navigate(RUTA_PANEL_ADMIN)}
              sx={{ ...botonCompacto, bgcolor: '#f7a600', color: '#fff', textTransform: 'none', fontWeight: 700, boxShadow: 'none', '&:hover': { bgcolor: '#bc7e01', boxShadow: 'none' } }}
            >
              <Etiqueta>Panel de Administración</Etiqueta>
            </Button>
          )}
          {perfil && (
            <Button
              variant="outlined"
              size="small"
              aria-label="Mi Perfil"
              startIcon={<Person />}
              onClick={() => navigate(RUTA_PERFIL)}
              sx={{ ...botonCompacto, color: '#f7a600', borderColor: '#f7a600', textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: '#bc7e01', bgcolor: '#fffbeb', color: '#bc7e01' } }}
            >
              <Etiqueta>Mi Perfil</Etiqueta>
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            aria-label="Cerrar Sesión"
            startIcon={<Logout />}
            onClick={handleCerrarSesion}
            sx={{ ...botonCompacto, color: '#475569', borderColor: '#cbd5e1', textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: '#94a3b8', bgcolor: '#f1f5f9' } }}
          >
            <Etiqueta>Cerrar Sesión</Etiqueta>
          </Button>
        </Box>
      </Box>

      <Container maxWidth="md" ref={feedRef} sx={{ scrollMarginTop: 16 }}>
        {/* ENCABEZADO DE SECCIÓN */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Novedades y Comunicados
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Información oficial filtrada exclusivamente para tu carrera y año de cursada.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              startIcon={<Refresh />}
              onClick={() => cargarFeed(pagina)}
              disabled={cargandoFeed}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Actualizar
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
        {cargandoFeed && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}

        {/* FEED DE PUBLICACIONES */}
        {!cargandoFeed && anunciosFeed.length === 0 && (
          <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>
            {esEstudiante ? 'Todavía no hay publicaciones para tu carrera y año.' : 'Todavía no hay publicaciones.'}
          </Typography>
        )}

        {!cargandoFeed && anunciosFeed.map((p) => {
          const destinos = destinosDe(p);
          const propios = esEstudiante
            ? destinos.filter((d) => inscripciones.some((i) => i.carreraId === d.carreraId && (d.numero == null || i.numero === d.numero)))
            : destinos;
          const chipsDestinos = propios.length ? propios : destinos;

          return (
            <Card key={p.id} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)', mb: 3, '&:hover': { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)' } }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: { xs: 1, sm: 2 }, mb: 1.5 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, minWidth: 0, flex: 1 }}>
                    {p.urgente && (
                      <Chip label="Urgente" size="small" sx={{ bgcolor: '#ffe4e6', color: '#e11d48', fontWeight: 600, border: '1px solid #fecdd3' }} />
                    )}
                    {/* Renderiza las primeras 2 carreras y el botón para ver el resto */}
                    <ChipsDestinos destinos={chipsDestinos} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>
                    {tiempoRelativo(p.fecha)}
                  </Typography>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '1.05rem', lineHeight: 1.4, overflowWrap: 'anywhere' }}>
                  {p.titulo}
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', mb: 2, lineHeight: 1.65, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>
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
                      maxWidth: '100%', maxHeight: { xs: 240, sm: 320 }, borderRadius: 1.5, mb: 2, display: 'block',
                      cursor: 'zoom-in', transition: 'opacity 0.15s', '&:hover': { opacity: 0.92 }
                    }}
                  />
                )}

                {p.archivoUrl && (
                  <Link
                    href={p.archivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2, fontSize: '0.875rem', maxWidth: '100%', overflowWrap: 'anywhere' }}
                  >
                    <AttachFile fontSize="small" /> {p.archivoNombre || 'Ver archivo adjunto'}
                  </Link>
                )}

                <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />
                <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                  Publicado por: Administrador Institucional
                </Typography>
              </CardContent>
            </Card>
          );
        })}

        {/* PAGINACIÓN CON EL MISMO ESTILO Y LÓGICA QUE EN EDITOR */}
        {totalPaginas > 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mt: 1, mb: 2 }}>
            <Pagination
              count={totalPaginas}
              page={pagina}
              onChange={cambiarPagina}
              disabled={cargandoFeed}
              shape="rounded"
              siblingCount={0}
              sx={{
                '& .MuiPaginationItem-root': { fontWeight: 600, color: '#475569' },
                '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#f7a600', color: '#fff' },
                '& .MuiPaginationItem-root.Mui-selected:hover': { bgcolor: '#bc7e01' }
              }}
            />
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
              Página {pagina} de {totalPaginas} · {totalAnuncios} publicaciones en total
            </Typography>
          </Box>
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