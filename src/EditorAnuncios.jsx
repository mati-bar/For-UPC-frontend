import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, Button, FormControl, 
  InputLabel, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, 
  FormControlLabel, Switch, IconButton, Divider, Chip, CircularProgress, Alert 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

import api from './api/axiosConfig';

export default function EditorAnuncios() {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [esUrgente, setEsUrgente] = useState(false);
  const [esGeneral, setEsGeneral] = useState(true); 
  const [carrerasDestino, setCarrerasDestino] = useState([]); 
  const [aniosDestino, setAniosDestino] = useState({}); 

  const [idEdicion, setIdEdicion] = useState(null);
  const [anunciosFeed, setAnunciosFeed] = useState([]);
  const [listaCarreras, setListaCarreras] = useState([]);

  // Estados de control de interfaz
  const [cargandoFeed, setCargandoFeed] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // 1. Cargar las carreras y el feed de publicaciones desde el backend
  const cargarDatosIniciales = async () => {
    setCargandoFeed(true);
    setErrorMsg(null);
    try {
      const [resCarreras, resAnuncios] = await Promise.all([
        api.get('/carreras'),
        api.get('/publicaciones')
      ]);
      setListaCarreras(Array.isArray(resCarreras.data) ? resCarreras.data : []);
      setAnunciosFeed(Array.isArray(resAnuncios.data) ? resAnuncios.data : []);
    } catch (error) {
      console.error('Error al sincronizar datos:', error);
      setErrorMsg('No se pudieron cargar los datos del servidor. Verifica que el backend esté activo.');
    } finally {
      setCargandoFeed(false);
    }
  };

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const handleArchivoChange = (e) => { 
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]); 
    }
  };
  
  const handleEliminarArchivo = () => { 
    setArchivo(null); 
  };

  const handleEditarAnuncio = (anuncio) => {
    setTitulo(anuncio.titulo || '');
    // Soporta tanto 'mensaje' como 'contenido' según devuelva la base de datos
    setContenido(anuncio.mensaje || anuncio.contenido || '');
    setEsUrgente(Boolean(anuncio.urgente));
    
    let carreras = anuncio.carrerasDestino || [];
    if (typeof carreras === 'string') {
      try { carreras = JSON.parse(carreras); } catch { carreras = []; }
    }
    
    let anios = anuncio.aniosDestino || {};
    if (typeof anios === 'string') {
      try { anios = JSON.parse(anios); } catch { anios = {}; }
    }

    const general = anuncio.esGeneral ?? (anuncio.destino?.toLowerCase().includes('general') || carreras.length === 0);
    
    setEsGeneral(general);
    setCarrerasDestino(carreras);
    setAniosDestino(anios);
    setIdEdicion(anuncio.id);
    setArchivo(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFormulario = () => {
    setTitulo('');
    setContenido('');
    setArchivo(null);
    setEsUrgente(false);
    setEsGeneral(true);
    setCarrerasDestino([]);
    setAniosDestino({});
    setIdEdicion(null);
  };
  
  // 2. Crear o Actualizar anuncio enviando 'mensaje' como campo obligatorio
  const handlePublicar = async (e) => { 
    e.preventDefault(); 
    setEnviando(true);
    setErrorMsg(null);

    const payload = {
      titulo: titulo.trim(),
      mensaje: contenido.trim(),    // Campo que el backend valida como obligatorio
      contenido: contenido.trim(),  // Respaldado por compatibilidad
      urgente: esUrgente,
      esGeneral: esGeneral,
      carrerasDestino: carrerasDestino,
      aniosDestino: aniosDestino,
      fecha: new Date().toISOString()
    };

    try {
      if (idEdicion) {
        // MODO EDICIÓN
        const res = await api.put(`/publicaciones/${idEdicion}`, payload);
        setAnunciosFeed((prev) => prev.map((a) => (a.id === idEdicion ? res.data : a)));
      } else {
        // MODO CREACIÓN
        const res = await api.post('/publicaciones', payload);
        setAnunciosFeed((prev) => [res.data, ...prev]);
      }
      resetFormulario();
      alert('¡Anuncio publicado correctamente!');
    } catch (error) {
      console.error('Detalle completo del error:', error.response);
      const msg = 
        error.response?.data?.mensaje || 
        error.response?.data?.message || 
        error.response?.data || 
        'Error al procesar el anuncio en el servidor.';
      alert('Atención: ' + (typeof msg === 'string' ? msg : JSON.stringify(msg)));
    } finally {
      setEnviando(false);
    }
  };

  // 3. Eliminar anuncio en la base de datos
  const handleEliminarAnuncio = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este anuncio?')) return;

    try {
      await api.delete(`/publicaciones/${id}`);
      setAnunciosFeed((prev) => prev.filter((anuncio) => anuncio.id !== id));
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('No se pudo eliminar el anuncio del servidor.');
    }
  };

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

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* Formulario de Anuncio */}
      <Card sx={{ 
        borderRadius: 4, 
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', 
        mb: 6,
        border: idEdicion ? '2px solid #f7a600' : 'none'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handlePublicar} sx={{ display: 'flex', flexDirection: 'column' }}>
            
            <TextField 
              label="Título del Anuncio" 
              fullWidth 
              required 
              sx={{ mb: 3 }} 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              disabled={enviando}
            />

            <TextField 
              label="Texto del Anuncio" 
              fullWidth 
              required 
              multiline 
              minRows={5} 
              sx={{ mb: 3 }} 
              placeholder="Escribí el texto acá..." 
              value={contenido} 
              onChange={(e) => setContenido(e.target.value)} 
              disabled={enviando}
            />

            {/* Subida de archivos */}
            <Box sx={{ mb: 3, p: 2, border: '1px dashed #cbd5e1', borderRadius: 2, bgcolor: '#f8fafc' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#000000', mb: 1.5 }}>
                Adjuntar archivo o imagen (opcional)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  component="label" 
                  variant="outlined" 
                  startIcon={<CloudUploadIcon />} 
                  disabled={enviando}
                  sx={{ 
                    color: '#0B1E3B', 
                    borderColor: '#0B1E3B', 
                    textTransform: 'none', 
                    '&:hover': { borderColor: '#f7a600', color: '#f7a600' } 
                  }}
                >
                  Seleccionar archivo
                  <input type="file" hidden onChange={handleArchivoChange} />
                </Button>
                {archivo ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#ffffff', p: '4px 12px', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                    <AttachFileIcon fontSize="small" sx={{ color: '#f7a600' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>
                      {archivo.name}
                    </Typography>
                    <IconButton size="small" color="error" onClick={handleEliminarArchivo} disabled={enviando}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">Ningún archivo seleccionado aún.</Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ mb: 3, p: 2, bgcolor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 2 }}>
              <FormControlLabel 
                control={<Switch color="error" checked={esUrgente} onChange={(e) => setEsUrgente(e.target.checked)} disabled={enviando} />} 
                label={<Typography sx={{ fontWeight: 'bold', color: '#e11d48' }}>Marcar anuncio como URGENTE / DESTACADO</Typography>} 
              />
            </Box>

            <FormControlLabel 
              control={
                <Checkbox 
                  checked={esGeneral} 
                  sx={{ color: '#f7a600', '&.Mui-checked': { color: '#f7a600' } }} 
                  onChange={(e) => { 
                    setEsGeneral(e.target.checked); 
                    if (e.target.checked) { 
                      setCarrerasDestino([]); 
                      setAniosDestino({}); 
                    } 
                  }} 
                  disabled={enviando}
                />
              } 
              label="Anuncio General (Se manda a todas las carreras y años)" 
              sx={{ mb: 2 }} 
            />

            {!esGeneral && (
              <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, mb: 3, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#0B1E3B', fontWeight: 'bold' }}>
                  Elegir a qué carreras y años mandarlo:
                </Typography>
                
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Carreras</InputLabel>
                  <Select 
                    multiple 
                    value={carrerasDestino} 
                    onChange={(e) => setCarrerasDestino(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)} 
                    input={<OutlinedInput label="Carreras" />} 
                    renderValue={(selected) => selected.join(', ')}
                    disabled={enviando}
                  >
                    {listaCarreras.map((carrera) => {
                      const nombreCarrera = carrera.nombre || carrera;
                      return (
                        <MenuItem key={carrera.id || nombreCarrera} value={nombreCarrera}>
                          <Checkbox checked={carrerasDestino.indexOf(nombreCarrera) > -1} sx={{ color: '#f7a600', '&.Mui-checked': { color: '#f7a600' } }} />
                          <ListItemText primary={nombreCarrera} />
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                
                {carrerasDestino.map((carreraNombre) => {
                  const carreraObj = listaCarreras.find((c) => (c.nombre || c) === carreraNombre);
                  const limiteAnios = carreraObj?.cantidadAnios || 4;
                  const aniosArray = Array.from({ length: limiteAnios }, (_, i) => `${i + 1}° Año`);

                  return (
                    <FormControl fullWidth size="small" sx={{ mb: 2 }} key={carreraNombre}>
                      <InputLabel>Año/s - {carreraNombre}</InputLabel>
                      <Select 
                        multiple 
                        value={aniosDestino[carreraNombre] || []} 
                        onChange={(e) => setAniosDestino({ 
                          ...aniosDestino, 
                          [carreraNombre]: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value 
                        })} 
                        input={<OutlinedInput label={`Año/s - ${carreraNombre}`} />} 
                        renderValue={(selected) => selected.join(', ')}
                        disabled={enviando}
                      >
                        {aniosArray.map((anio) => (
                          <MenuItem key={anio} value={anio}>
                            <Checkbox checked={(aniosDestino[carreraNombre] || []).indexOf(anio) > -1} sx={{ color: '#f7a600', '&.Mui-checked': { color: '#f7a600' } }} />
                            <ListItemText primary={anio} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                })}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                disabled={enviando}
                sx={{ 
                  flexGrow: 1, 
                  bgcolor: '#f7a600', 
                  '&:hover': { bgcolor: '#bc7e01' }, 
                  py: 1.5, 
                  fontWeight: 'bold',
                  textTransform: 'none'
                }}
              >
                {enviando ? (
                  <CircularProgress size={24} sx={{ color: '#fff' }} />
                ) : (
                  idEdicion ? 'Guardar Cambios' : 'Publicar y Enviar Notificación'
                )}
              </Button>
              {idEdicion && (
                <Button 
                  variant="outlined" 
                  size="large" 
                  onClick={resetFormulario} 
                  disabled={enviando}
                  startIcon={<CloseIcon />} 
                  sx={{ color: '#64748b', borderColor: '#cbd5e1', textTransform: 'none', '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' } }}
                >
                  Cancelar
                </Button>
              )}
            </Box>

          </Box>
        </CardContent>
      </Card>

      {/* Historial de Feed */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a', letterSpacing: '-0.02em', mb: 1 }}>
          Historial de Anuncios Publicados
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          Vista previa del feed en tiempo real con las publicaciones del servidor.
        </Typography>
      </Box>

      {cargandoFeed ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress sx={{ color: '#f7a600' }} />
        </Box>
      ) : anunciosFeed.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
          <Typography color="text.secondary">No hay anuncios publicados aún.</Typography>
        </Card>
      ) : (
        anunciosFeed.map((anuncio) => (
          <Card key={anuncio.id} sx={{ 
            borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)', mb: 3,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease', '&:hover': { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)' }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Chip 
                  label={anuncio.destino || (anuncio.esGeneral ? 'General' : 'Específico')} 
                  size="small" 
                  sx={{ 
                    bgcolor: anuncio.urgente ? '#ffe4e6' : '#f1f5f9', 
                    color: anuncio.urgente ? '#e11d48' : '#334155', 
                    fontWeight: 600, 
                    fontSize: '0.75rem', 
                    border: anuncio.urgente ? '1px solid #fecdd3' : '1px solid #e2e8f0' 
                  }} 
                />
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                  {anuncio.fecha || 'Reciente'}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '1.05rem', lineHeight: 1.4 }}>
                {anuncio.titulo}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mb: 2, lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                {anuncio.mensaje || anuncio.contenido}
              </Typography>
              
              {anuncio.archivoUrl && (
                <Box sx={{ mb: 2 }}>
                  <Button 
                    variant="text" 
                    size="small" 
                    href={anuncio.archivoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    startIcon={<AttachFileIcon sx={{ color: '#f7a600' }} />}
                    sx={{ textTransform: 'none', color: '#0B1E3B' }}
                  >
                    Ver archivo adjunto
                  </Button>
                </Box>
              )}

              <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<EditIcon />} 
                  onClick={() => handleEditarAnuncio(anuncio)} 
                  sx={{ color: '#f7a600', borderColor: '#f7a600', textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: '#bc7e01', bgcolor: '#fffbeb', color: '#bc7e01' } }}
                >
                  Editar
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small" 
                  startIcon={<DeleteIcon />} 
                  onClick={() => handleEliminarAnuncio(anuncio.id)} 
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Eliminar
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}