import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Checkbox, ListItemText, OutlinedInput,
  FormControlLabel, Switch, IconButton, Divider, Chip, Alert, CircularProgress, Link, Dialog, Pagination
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';

// En .env: VITE_API_URL=https://for-upc-backend.onrender.com
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const MAX_IMAGEN = 5 * 1024 * 1024;   // 5 MB
const MAX_ARCHIVO = 10 * 1024 * 1024; // 10 MB
const POR_PAGINA = 5;                 // anuncios por página en el historial

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// El backend puede devolver texto plano en errores y en DELETE: nunca asumir JSON.
const leerError = async (res) => {
  const texto = await res.text();
  const base = `Error ${res.status}`;
  if (res.status === 401) return 'Tu sesión venció. Volvé a iniciar sesión.';
  if (res.status === 403) return 'No tenés permisos de administrador para esta acción.';
  if (res.status === 404) return 'La publicación no existe.';
  return texto ? `${base}: ${texto}` : base;
};

// Pide UNA página al backend (page empieza en 0). Devuelve { content, totalPages, totalElements, ... }
async function pedirPublicaciones(numeroPagina) {
  const res = await fetch(
    `${API_URL}/publicaciones?page=${numeroPagina - 1}&size=${POR_PAGINA}`, // público, sin token
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error(await leerError(res));
  return res.json();
}

const formatearFecha = (iso) => (iso ? new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '');

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

// Arma las etiquetas de destino agrupadas por carrera: "Carrera: 1°, 2°"
const etiquetasDestino = (anuncio) => {
  if (anuncio.destinos && anuncio.destinos.length > 0) {
    const porCarrera = {};
    anuncio.destinos.forEach((d) => {
      const nombre = d.carrera?.nombre ?? 'Carrera';
      (porCarrera[nombre] = porCarrera[nombre] || []).push(d.anio?.numero);
    });
    return Object.entries(porCarrera).map(([nombre, anios]) =>
      `${nombre}: ${anios.filter(Boolean).sort((a, b) => a - b).map((n) => `${n}°`).join(', ')}`
    );
  }
  // Publicaciones históricas con carrera/anio individuales (legacy)
  if (anuncio.carrera) return [`${anuncio.carrera.nombre}${anuncio.anio ? `: ${anuncio.anio.numero}°` : ''}`];
  return ['Sin destino'];
};

export default function EditorAnuncios() {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [esUrgente, setEsUrgente] = useState(false);
  const [esGeneral, setEsGeneral] = useState(true);
  const [duracion, setDuracion] = useState('SIN_VENCIMIENTO');
  const [idEdicion, setIdEdicion] = useState(null);
  const [anuncioEnEdicion, setAnuncioEnEdicion] = useState(null);

  // Destinos: carreras elegidas (ids) y, por carrera, los anioCarreraId elegidos
  const [carreras, setCarreras] = useState([]);              // [{id, nombre}]
  const [aniosPorCarrera, setAniosPorCarrera] = useState({}); // {carreraId: [{anioCarreraId, numero}]}
  const [carrerasDestino, setCarrerasDestino] = useState([]); // [carreraId]
  const [aniosDestino, setAniosDestino] = useState({});       // {carreraId: [anioCarreraId]}

  const [anunciosFeed, setAnunciosFeed] = useState([]);
  const [cargandoFeed, setCargandoFeed] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [imagenAbierta, setImagenAbierta] = useState(null); // { url, titulo }
  const [pagina, setPagina] = useState(1);                  // página actual (empieza en 1)
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalAnuncios, setTotalAnuncios] = useState(0);
  const historialRef = useRef(null);

  // ------------------------------------------------------------ carreras/años
  const cargarAnios = useCallback(async (carreraId) => {
    if (aniosPorCarrera[carreraId]) return aniosPorCarrera[carreraId];
    const res = await fetch(`${API_URL}/carreras/${carreraId}/anios`);
    if (!res.ok) throw new Error(await leerError(res));
    const data = await res.json();
    setAniosPorCarrera((prev) => ({ ...prev, [carreraId]: data }));
    return data;
  }, [aniosPorCarrera]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/carreras`);
        if (!res.ok) throw new Error(await leerError(res));
        setCarreras(await res.json());
      } catch (err) {
        setError(err.message || 'No se pudieron cargar las carreras.');
      }
    })();
  }, []);

  // ------------------------------------------------------------------- feed
  // El administrador ve TODOS los anuncios (sin filtrar por carrera), así que acá la
  // paginación se hace en el servidor: cada página es una llamada con page y size.
  const cargarFeed = useCallback(async (paginaPedida = 1) => {
    setCargandoFeed(true);
    try {
      let numero = paginaPedida;
      let data = await pedirPublicaciones(numero);

      if (Array.isArray(data)) {
        // Backend sin paginar (array simple): se pagina acá como respaldo
        setTotalAnuncios(data.length);
        setTotalPaginas(Math.max(1, Math.ceil(data.length / POR_PAGINA)));
        setAnunciosFeed(data.slice((numero - 1) * POR_PAGINA, numero * POR_PAGINA));
      } else {
        const total = Math.max(1, data?.totalPages ?? 1);
        // Si la página pedida ya no existe (por ejemplo, se borró el último anuncio de la última página)
        if (numero > total) {
          numero = total;
          data = await pedirPublicaciones(numero);
        }
        setTotalAnuncios(data?.totalElements ?? 0);
        setTotalPaginas(Math.max(1, data?.totalPages ?? 1));
        setAnunciosFeed(data?.content ?? []);
      }
      setPagina(numero);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial.');
    } finally {
      setCargandoFeed(false);
    }
  }, []);

  useEffect(() => { cargarFeed(1); }, [cargarFeed]);

  // ---------------------------------------------------------------- archivos
  const handleArchivoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.type.startsWith('image/')) {
      if (file.size > MAX_IMAGEN) return setError('La imagen supera el máximo de 5 MB.');
      setImagen(file);
    } else {
      if (file.size > MAX_ARCHIVO) return setError('El archivo supera el máximo de 10 MB.');
      setArchivo(file);
    }
    setError('');
  };

  const handleEliminarArchivo = () => { setArchivo(null); setImagen(null); };

  // -------------------------------------------------------------- formulario
  const resetFormulario = () => {
    setTitulo('');
    setContenido('');
    setEsUrgente(false);
    setDuracion('SIN_VENCIMIENTO');
    setArchivo(null);
    setImagen(null);
    setEsGeneral(true);
    setCarrerasDestino([]);
    setAniosDestino({});
    setIdEdicion(null);
    setAnuncioEnEdicion(null);
  };

  const handleEditarAnuncio = async (anuncio) => {
    setError('');
    setExito('');
    try {
      // Reconstruir la selección: destinos devuelve pares carrera/anio y hay que
      // convertirlos a anioCarreraId usando GET /carreras/{id}/anios.
      const destinos = anuncio.destinos || [];
      const idsCarrera = [...new Set(destinos.map((d) => d.carrera.id))];
      const listas = await Promise.all(idsCarrera.map((id) => cargarAnios(id)));

      const seleccion = {};
      destinos.forEach((d) => {
        const lista = listas[idsCarrera.indexOf(d.carrera.id)] || [];
        const match = lista.find((a) => a.numero === d.anio.numero);
        if (match) (seleccion[d.carrera.id] = seleccion[d.carrera.id] || []).push(match.anioCarreraId);
      });

      setTitulo(anuncio.titulo);
      setContenido(anuncio.mensaje);
      setEsUrgente(!!anuncio.urgente);
      setDuracion('MANTENER'); // la respuesta no trae "duracion": por defecto se conserva la expiración
      setArchivo(null);
      setImagen(null);
      setEsGeneral(false);
      setCarrerasDestino(idsCarrera);
      setAniosDestino(seleccion);
      setIdEdicion(anuncio.id);
      setAnuncioEnEdicion(anuncio);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (destinos.length === 0) {
        setError('Esta publicación es histórica (sin destinos múltiples). Elegí al menos un destino antes de guardar.');
      }
    } catch (err) {
      setError(err.message || 'No se pudo cargar la publicación para editar.');
    }
  };

  const toggleCarreras = async (ids) => {
    setCarrerasDestino(ids);
    // Quitar selecciones de carreras destildadas
    setAniosDestino((prev) => Object.fromEntries(Object.entries(prev).filter(([cid]) => ids.includes(Number(cid)))));
    try {
      await Promise.all(ids.map((id) => cargarAnios(id)));
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los años.');
    }
  };

  // Para "Anuncio General": todos los anioCarreraId de todas las carreras
  const obtenerTodosLosIds = async () => {
    const listas = await Promise.all(carreras.map((c) => cargarAnios(c.id)));
    return listas.flat().map((a) => a.anioCarreraId);
  };

  // --------------------------------------------------------------- POST / PUT
  const handlePublicar = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setEnviando(true);

    try {
      const ids = esGeneral
        ? await obtenerTodosLosIds()
        : carrerasDestino.flatMap((c) => aniosDestino[c] || []);
      const inscripciones = [...new Set(ids)].map((anioCarreraId) => ({ anioCarreraId }));

      if (inscripciones.length === 0) {
        throw new Error('Elegí al menos un año de una carrera (o marcá Anuncio General).');
      }

      const datos = { titulo, mensaje: contenido, urgente: esUrgente, inscripciones };
      if (duracion !== 'MANTENER') datos.duracion = duracion; // omitida en PUT = conserva la expiración

      const form = new FormData();
      form.append('datos', JSON.stringify(datos));
      if (imagen) form.append('imagen', imagen);
      if (archivo) form.append('archivo', archivo);

      const esEdicion = idEdicion !== null;
      const res = await fetch(esEdicion ? `${API_URL}/publicaciones/${idEdicion}` : `${API_URL}/publicaciones`, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: authHeaders(), // sin Content-Type: lo arma el navegador
        body: form
      });
      if (!res.ok) throw new Error(await leerError(res));

      setExito(esEdicion ? 'Cambios guardados.' : '¡Publicación exitosa!');
      resetFormulario();
      await cargarFeed(esEdicion ? pagina : 1); // un anuncio nuevo queda primero; una edición, en su página
    } catch (err) {
      setError(err.message || 'Error al publicar el anuncio.');
    } finally {
      setEnviando(false);
    }
  };

  // ------------------------------------------------------------------ DELETE
  const handleEliminarAnuncio = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este anuncio?')) return;
    setError('');
    setExito('');
    try {
      const res = await fetch(`${API_URL}/publicaciones/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error(await leerError(res));
      await res.text(); // la respuesta es texto, no JSON
      await cargarFeed(pagina); // recarga la página actual (si quedó vacía, vuelve a la anterior)
      if (idEdicion === id) resetFormulario();
      setExito('Anuncio eliminado.');
    } catch (err) {
      setError(err.message || 'Error al eliminar el anuncio.');
    }
  };

  const cambiarPagina = async (_, nueva) => {
    await cargarFeed(nueva);
    historialRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const adjunto = archivo || imagen;
  const nombreCarrera = (id) => carreras.find((c) => c.id === id)?.nombre ?? id;
  const abrirImagen = (anuncio) => setImagenAbierta({ url: anuncio.imagenUrl, titulo: anuncio.titulo });

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#000000', mb: 1 }}>
          {idEdicion ? 'Editar Anuncio' : 'Publicar Anuncio'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {idEdicion ? 'Modificá los datos del anuncio y guardá los cambios.' : 'Creación de anuncios institucionales para el alumnado.'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {exito && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setExito('')}>{exito}</Alert>}

      <Card sx={{ borderRadius: 4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', mb: 6, border: idEdicion ? '2px solid #f7a600' : 'none' }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handlePublicar} sx={{ display: 'flex', flexDirection: 'column' }}>

            <TextField label="Título del Anuncio" fullWidth required sx={{ mb: 3 }} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            <TextField label="Texto del Anuncio" fullWidth required multiline minRows={5} sx={{ mb: 3 }} placeholder="Escribí el texto acá..." value={contenido} onChange={(e) => setContenido(e.target.value)} />

            <Box sx={{ mb: 3, p: 2, border: '1px dashed #cbd5e1', borderRadius: 2, bgcolor: '#f8fafc' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#000000', mb: 1.5 }}>
                Adjuntar archivo o imagen (opcional)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Imagen hasta 5 MB. PDF, DOC o DOCX hasta 10 MB.
                {idEdicion && ' Si no elegís un archivo nuevo, se conservan los actuales.'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ color: '#0B1E3B', borderColor: '#0B1E3B', textTransform: 'none', '&:hover': { borderColor: '#f7a600', color: '#f7a600' } }}>
                  Seleccionar archivo
                  <input type="file" hidden accept="image/*,.pdf,.doc,.docx" onChange={handleArchivoChange} />
                </Button>
                {adjunto ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#ffffff', p: '4px 12px', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                    <AttachFileIcon fontSize="small" sx={{ color: '#f7a600' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>{adjunto.name}</Typography>
                    <IconButton size="small" color="error" onClick={handleEliminarArchivo}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    {anuncioEnEdicion?.archivoNombre
                      ? `Archivo actual: ${anuncioEnEdicion.archivoNombre}`
                      : 'Ningún archivo seleccionado aún.'}
                  </Typography>
                )}
              </Box>
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Duración de la Publicación</InputLabel>
              <Select value={duracion} label="Duración de la Publicación" onChange={(e) => setDuracion(e.target.value)}>
                {idEdicion && <MenuItem value="MANTENER">Mantener la expiración actual</MenuItem>}
                <MenuItem value="HORA">1 Hora</MenuItem>
                <MenuItem value="DIA">24 Horas</MenuItem>
                <MenuItem value="SEMANA">1 Semana</MenuItem>
                <MenuItem value="SIN_VENCIMIENTO">Permanente (Sin vencimiento)</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 3, p: 2, bgcolor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 2 }}>
              <FormControlLabel control={<Switch color="error" checked={esUrgente} onChange={(e) => setEsUrgente(e.target.checked)} />} label={<Typography sx={{ fontWeight: 'bold', color: '#e11d48' }}>Marcar anuncio como URGENTE / DESTACADO</Typography>} />
            </Box>

            <FormControlLabel
              control={<Checkbox checked={esGeneral} sx={{ color: '#f7a600', '&.Mui-checked': { color: '#f7a600' } }} onChange={(e) => { setEsGeneral(e.target.checked); if (e.target.checked) { setCarrerasDestino([]); setAniosDestino({}); } }} />}
              label="Anuncio General (Se manda a todas las carreras y años)"
              sx={{ mb: 2 }}
            />

            {!esGeneral && (
              <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, mb: 3, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#0B1E3B', fontWeight: 'bold' }}>Elegir a qué carreras y años mandarlo:</Typography>

                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Carreras</InputLabel>
                  <Select
                    multiple
                    value={carrerasDestino}
                    onChange={(e) => toggleCarreras(e.target.value)}
                    input={<OutlinedInput label="Carreras" />}
                    renderValue={(selected) => selected.map(nombreCarrera).join(', ')}
                  >
                    {carreras.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        <Checkbox checked={carrerasDestino.includes(c.id)} sx={{ color: '#f7a600', '&.Mui-checked': { color: '#f7a600' } }} />
                        <ListItemText primary={c.nombre} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {carrerasDestino.map((carreraId) => {
                  const anios = aniosPorCarrera[carreraId] || [];
                  const label = `Año/s - ${nombreCarrera(carreraId)}`;
                  return (
                    <FormControl fullWidth size="small" sx={{ mb: 2 }} key={carreraId}>
                      <InputLabel>{label}</InputLabel>
                      <Select
                        multiple
                        value={aniosDestino[carreraId] || []}
                        onChange={(e) => setAniosDestino({ ...aniosDestino, [carreraId]: e.target.value })}
                        input={<OutlinedInput label={label} />}
                        renderValue={(selected) => anios.filter((a) => selected.includes(a.anioCarreraId)).map((a) => `${a.numero}° año`).join(', ')}
                      >
                        {anios.map((a) => (
                          <MenuItem key={a.anioCarreraId} value={a.anioCarreraId}>
                            <Checkbox checked={(aniosDestino[carreraId] || []).includes(a.anioCarreraId)} sx={{ color: '#f7a600', '&.Mui-checked': { color: '#f7a600' } }} />
                            <ListItemText primary={`${a.numero}° año`} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                })}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" size="large" disabled={enviando} sx={{ flexGrow: 1, bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, py: 1.5, fontWeight: 'bold' }}>
                {enviando ? <CircularProgress size={24} color="inherit" /> : idEdicion ? 'Guardar Cambios' : 'Publicar Y Enviar Notificación'}
              </Button>
              {idEdicion && (
                <Button variant="outlined" size="large" onClick={resetFormulario} startIcon={<CloseIcon />} sx={{ color: '#64748b', borderColor: '#cbd5e1', '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' } }}>
                  Cancelar
                </Button>
              )}
            </Box>

          </Box>
        </CardContent>
      </Card>

      <Box ref={historialRef} sx={{ mb: 3, scrollMarginTop: 16 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a', letterSpacing: '-0.02em', mb: 1 }}>
          Historial de Anuncios Publicados
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          Vista previa del feed. Podés editar o eliminar los anuncios que ya enviaste.
        </Typography>
      </Box>

      {cargandoFeed && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}

      {!cargandoFeed && anunciosFeed.length === 0 && (
        <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>
          Todavía no hay anuncios publicados.
        </Typography>
      )}

      {!cargandoFeed && anunciosFeed.map((anuncio) => {
        const vencido = anuncio.fechaExpiracion && new Date(anuncio.fechaExpiracion) < new Date();
        return (
          <Card key={anuncio.id} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)', mb: 3, opacity: vencido ? 0.65 : 1, '&:hover': { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)' } }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 1.5 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {anuncio.urgente && <Chip label="Urgente" size="small" sx={{ bgcolor: '#ffe4e6', color: '#e11d48', fontWeight: 600, border: '1px solid #fecdd3' }} />}
                  {vencido && <Chip label="Vencido" size="small" sx={{ fontWeight: 600 }} />}
                  {etiquetasDestino(anuncio).map((et) => (
                    <Chip key={et} label={et} size="small" sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: '0.75rem', border: '1px solid #e2e8f0' }} />
                  ))}
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500, display: 'block' }}>{formatearFecha(anuncio.fecha)}</Typography>
                  {anuncio.fechaExpiracion && (
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>Vence: {formatearFecha(anuncio.fechaExpiracion)}</Typography>
                  )}
                </Box>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '1.05rem', lineHeight: 1.4 }}>{anuncio.titulo}</Typography>
              <Typography variant="body2" sx={{ color: '#475569', mb: 2, lineHeight: 1.65, whiteSpace: 'pre-line' }}>{anuncio.mensaje}</Typography>

              {anuncio.imagenUrl && (
                <Box
                  component="img"
                  src={anuncio.imagenUrl}
                  alt={anuncio.titulo}
                  role="button"
                  tabIndex={0}
                  onClick={() => abrirImagen(anuncio)}
                  onKeyDown={(e) => e.key === 'Enter' && abrirImagen(anuncio)}
                  sx={{
                    maxWidth: '100%', maxHeight: 280, borderRadius: 1.5, mb: 2, display: 'block',
                    cursor: 'zoom-in', transition: 'opacity 0.15s', '&:hover': { opacity: 0.92 }
                  }}
                />
              )}
              {anuncio.archivoUrl && (
                <Link href={anuncio.archivoUrl} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2, fontSize: '0.875rem' }}>
                  <AttachFileIcon fontSize="small" /> {anuncio.archivoNombre || 'Ver archivo adjunto'}
                </Link>
              )}

              <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => handleEditarAnuncio(anuncio)} sx={{ color: '#f7a600', borderColor: '#f7a600', textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: '#bc7e01', bgcolor: '#fffbeb', color: '#bc7e01' } }}>
                  Editar
                </Button>
                <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleEliminarAnuncio(anuncio.id)} sx={{ textTransform: 'none', fontWeight: 600 }}>
                  Eliminar
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
      })}

      {/* PAGINACIÓN */}
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
            Página {pagina} de {totalPaginas} · {totalAnuncios} anuncios en total
          </Typography>
        </Box>
      )}

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
            startIcon={<DownloadIcon />}
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
            <CloseIcon />
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