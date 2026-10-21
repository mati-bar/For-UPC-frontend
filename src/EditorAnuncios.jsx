import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, Button, FormControl, 
  InputLabel, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, 
  FormControlLabel, Switch, IconButton, Divider, Chip 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

export default function EditorAnuncios() {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [esUrgente, setEsUrgente] = useState(false);
  const [esGeneral, setEsGeneral] = useState(true); 
  const [carrerasDestino, setCarrerasDestino] = useState([]); 
  const [aniosDestino, setAniosDestino] = useState({}); 
  
  // NUEVO: Estado para manejar la duración exacta que pide el backend
  const [duracion, setDuracion] = useState('SIN_VENCIMIENTO');

  const [idEdicion, setIdEdicion] = useState(null);

  const [anunciosFeed, setAnunciosFeed] = useState([
    {
      id: 1,
      titulo: 'Suspensión de clases presenciales por capacitación docente',
      contenido: 'Estimados estudiantes, les informamos que el día viernes próximo las actividades académicas se realizarán de manera virtual a través de la plataforma institucional. Por favor revisar los materiales compartidos por los profesores de cada cátedra.',
      fecha: 'Hace 2 horas',
      destino: 'Tecnicatura en Programación - 2° Año',
      urgente: true,
      duracion: 'DIA'
    },
    {
      id: 2,
      titulo: 'Inscripción a mesas de exámenes finales',
      contenido: 'Se encuentra abierta la inscripción para el turno de noviembre-diciembre. Recordar que deben tener las correlativas aprobadas.',
      fecha: 'Hace 1 día',
      destino: 'General (Todas las carreras)',
      urgente: false,
      duracion: 'SIN_VENCIMIENTO'
    }
  ]);

  const handleArchivoChange = (e) => { 
    console.log('Archivo seleccionado:', e.target.files[0]);
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].type.startsWith('image/')) {
      setImagen(e.target.files[0]); 
    } else {
      setArchivo(e.target.files[0]); 
    }

  };
  }
  
  const handleEliminarArchivo = () => { setArchivo(null); };

  const handleEditarAnuncio = (anuncio) => {
    setTitulo(anuncio.titulo);
    setContenido(anuncio.contenido);
    setEsUrgente(anuncio.urgente);
    setDuracion(anuncio.duracion || 'SIN_VENCIMIENTO'); // Recupera la duración
    setIdEdicion(anuncio.id); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFormulario = () => {
    setTitulo('');
    setContenido('');
    setEsUrgente(false);
    setDuracion('SIN_VENCIMIENTO'); // Resetea la duración al valor por defecto
    setIdEdicion(null); 
  };
  
  const handlePublicar = (e) => { 
    e.preventDefault(); 
    
    if (idEdicion) {
        const nuevoAnuncio = {
          titulo: titulo,
          mensaje: contenido,
          carreraId: 1, // se cambia con backend
          anioId: 1, // se cambia con backend
          urgente: esUrgente,
          duracion: duracion // Se suma al objeto final
          
        };

        console.log('Nuevo anuncio a publicar:', nuevoAnuncio);

      try {
        const formData = new FormData();

        if (archivo) {
          // 'archivo' o 'file' según cómo lo reciba tu backend (ej: @RequestParam("archivo") o req.file)
          formData.append('archivo', archivo);
        } else {
          // 'archivo' o 'file' según cómo lo reciba tu backend (ej: @RequestParam("archivo") o req.file)
          formData.append('imagen', imagen);
        }

        formData.append('datos', JSON.stringify(nuevoAnuncio));

        
        const respuesta = fetch(`http://localhost:8080/publicaciones/${idEdicion}`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (respuesta.status === 201) {
          setExito('¡Publicación exitosa!');
          setTabValue(0); // Lo mandamos al login para que entre
          setNombre(''); setApellido(''); setEmail(''); setPassword('');
          setSelecciones([{ carreraId: '', anioCarreraId: '', aniosDisponibles: [] }]);
        } else {
          const mensajeError = respuesta.text();
          setError(mensajeError);
        }
      
        setAnunciosFeed([nuevoAnuncio, ...anunciosFeed]);

      } catch (err) {
        setError('Error al publicar el anuncio.');
      } finally {
        //setLoading(false);
      } 


      const feedActualizado = anunciosFeed.map(anuncio => 
        anuncio.id === idEdicion 
          ? { ...anuncio, titulo: titulo, contenido: contenido, urgente: esUrgente, duracion: duracion } 
          : anuncio
      );

      setAnunciosFeed(feedActualizado);



    } else {
      const nuevoAnuncio = {
        id: Date.now(),
        titulo: titulo,
        mensaje: contenido,
        carreraId: 1, // se cambia con backend
        anioId: 1, // se cambia con backend
        urgente: esUrgente,
        duracion: duracion // Se suma al objeto final
        
      };

      console.log('Nuevo anuncio a publicar:', nuevoAnuncio);

    try {
      const formData = new FormData();

      if (archivo) {
        // 'archivo' o 'file' según cómo lo reciba tu backend (ej: @RequestParam("archivo") o req.file)
        formData.append('archivo', archivo);
      } else {
        // 'archivo' o 'file' según cómo lo reciba tu backend (ej: @RequestParam("archivo") o req.file)
        formData.append('imagen', imagen);
      }

      formData.append('datos', JSON.stringify(nuevoAnuncio));

      
      const respuesta = fetch('http://localhost:8080/publicaciones', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (respuesta.status === 201) {
        setExito('¡Publicación exitosa!');
        setTabValue(0); // Lo mandamos al login para que entre
        setNombre(''); setApellido(''); setEmail(''); setPassword('');
        setSelecciones([{ carreraId: '', anioCarreraId: '', aniosDisponibles: [] }]);
      } else {
        const mensajeError = respuesta.text();
        setError(mensajeError);
      }
    
      setAnunciosFeed([nuevoAnuncio, ...anunciosFeed]);

    } catch (err) {
      setError('Error al publicar el anuncio.');
    } finally {
      //setLoading(false);
    } 
    };

    
    resetFormulario();
  };

  const handleEliminarAnuncio = (id) => {
    const nuevaLista = anunciosFeed.filter(anuncio => anuncio.id !== id);
    setAnunciosFeed(nuevaLista);
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

      <Card sx={{ 
        borderRadius: 4, 
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', 
        mb: 6,
        border: idEdicion ? '2px solid #f7a600' : 'none'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={(e) => handlePublicar(e)} sx={{ display: 'flex', flexDirection: 'column' }}>
            
            <TextField label="Título del Anuncio" fullWidth required sx={{ mb: 3 }} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            <TextField label="Texto del Anuncio" fullWidth required multiline minRows={5} sx={{ mb: 3 }} placeholder="Escribí el texto acá..." value={contenido} onChange={(e) => setContenido(e.target.value)} />

            <Box sx={{ mb: 3, p: 2, border: '1px dashed #cbd5e1', borderRadius: 2, bgcolor: '#f8fafc' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#000000', mb: 1.5 }}>Adjuntar archivo o imagen (opcional)</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ color: '#0B1E3B', borderColor: '#0B1E3B', textTransform: 'none', '&:hover': { borderColor: '#f7a600', color: '#f7a600' } }}>
                  Seleccionar archivo
                  <input type="file" hidden onChange={(e) => handleArchivoChange(e)} />
                </Button>
                {archivo ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#ffffff', p: '4px 12px', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                    <AttachFileIcon fontSize="small" sx={{ color: '#f7a600' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>{archivo.name}</Typography>
                    <IconButton size="small" color="error" onClick={handleEliminarArchivo}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">Ningún archivo seleccionado aún.</Typography>
                )}
              </Box>
            </Box>

            {/*Duración de publicación */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Duración de la Publicación</InputLabel>
              <Select
                value={duracion}
                label="Duración de la Publicación"
                onChange={(e) => setDuracion(e.target.value)}
              >
                <MenuItem value="HORA">1 Hora</MenuItem>
                <MenuItem value="DIA">24 Horas</MenuItem>
                <MenuItem value="SEMANA">1 Semana</MenuItem>
                <MenuItem value="SIN_VENCIMIENTO">Permanente (Sin vencimiento)</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 3, p: 2, bgcolor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 2 }}>
              <FormControlLabel control={<Switch color="error" checked={esUrgente} onChange={(e) => setEsUrgente(e.target.checked)} />} label={<Typography sx={{ fontWeight: 'bold', color: '#e11d48' }}>Marcar anuncio como URGENTE / DESTACADO</Typography>} />
            </Box>

            <FormControlLabel control={<Checkbox checked={esGeneral} sx={{ color: '#f7a600', '&.Mui-checked': { color: '#f7a600' } }} onChange={(e) => { setEsGeneral(e.target.checked); if (e.target.checked) { setCarrerasDestino([]); setAniosDestino({}); } }} />} label="Anuncio General (Se manda a todas las carreras y años)" sx={{ mb: 2 }} />

            {!esGeneral && (
              <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, mb: 3, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#0B1E3B', fontWeight: 'bold' }}>Elegir a qué carreras y años mandarlo:</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Carreras</InputLabel>
                  <Select multiple value={carrerasDestino} onChange={(e) => setCarrerasDestino(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)} input={<OutlinedInput label="Carreras" />} renderValue={(selected) => selected.join(', ')}>
                    {['Tecnicatura Universitaria en Programación Full Stack', 'Profesorado Universitario de Biología', 'Profesorado Universitario de Geografía', 'Profesorado de Educación Secundaria en Historia', 'Profesorado de Educación Secundaria en Matemática', 'Prof. Educación Física'].map((carrera) => (
                      <MenuItem key={carrera} value={carrera}>
                        <Checkbox checked={carrerasDestino.indexOf(carrera) > -1} sx={{ color: '#f7a600', '&.Mui-checked': { color: '#f7a600' } }} />
                        <ListItemText primary={carrera} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {carrerasDestino.map((carrera) => (
                  <FormControl fullWidth size="small" sx={{ mb: 2 }} key={carrera}>
                    <InputLabel>Año/s - {carrera}</InputLabel>
                    <Select multiple value={aniosDestino[carrera] || []} onChange={(e) => setAniosDestino({ ...aniosDestino, [carrera]: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })} input={<OutlinedInput label={`Año/s - ${carrera}`} />} renderValue={(selected) => selected.join(', ')}>
                      {['1er Año', '2do Año', '3er Año', '4to Año'].map((anio) => (
                        <MenuItem key={anio} value={anio}>
                          <Checkbox checked={(aniosDestino[carrera] || []).indexOf(anio) > -1} sx={{ color: '#f7a600', '&.Mui-checked': { color: '#f7a600' } }} />
                          <ListItemText primary={anio} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" size="large" sx={{ flexGrow: 1, bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, py: 1.5, fontWeight: 'bold' }}>
                {idEdicion ? 'Guardar Cambios' : 'Publicar Y Enviar Notificación'}
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

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a', letterSpacing: '-0.02em', mb: 1 }}>
          Historial de Anuncios Publicados
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          Vista previa del feed. Podés editar o eliminar los anuncios que ya enviaste.
        </Typography>
      </Box>

      {anunciosFeed.map((anuncio) => (
        <Card key={anuncio.id} sx={{ 
          borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)', mb: 3,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease', '&:hover': { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)' }
        }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Chip 
                label={anuncio.destino} 
                size="small" 
                sx={{ bgcolor: anuncio.urgente ? '#ffe4e6' : '#f1f5f9', color: anuncio.urgente ? '#e11d48' : '#334155', fontWeight: 600, fontSize: '0.75rem', border: anuncio.urgente ? '1px solid #fecdd3' : '1px solid #e2e8f0' }} 
              />
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>{anuncio.fecha}</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '1.05rem', lineHeight: 1.4 }}>
              {anuncio.titulo}
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', mb: 2, lineHeight: 1.65, whiteSpace: 'pre-line' }}>
              {anuncio.contenido}
            </Typography>
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
      ))}
    </Box>
  );
}