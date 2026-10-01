import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, FormControlLabel, Switch, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';

export default function EditorAnuncios() {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [esUrgente, setEsUrgente] = useState(false);
  const [esGeneral, setEsGeneral] = useState(true); 
  const [carrerasDestino, setCarrerasDestino] = useState([]); 
  const [aniosDestino, setAniosDestino] = useState({}); 

  const handleArchivoChange = (e) => { if (e.target.files && e.target.files[0]) setArchivo(e.target.files[0]); };
  const handleEliminarArchivo = () => { setArchivo(null); };
  const handlePublicar = (e) => { e.preventDefault(); console.log({ titulo, contenido, esUrgente, esGeneral, carrerasDestino, aniosDestino, archivo }); };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0B1E3B', mb: 1 }}>Publicar Anuncio</Typography>
        <Typography variant="body1" color="text.secondary">Creación de anuncios institucionales para el alumnado.</Typography>
      </Box>

      <Card sx={{ borderRadius: 4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handlePublicar} sx={{ display: 'flex', flexDirection: 'column' }}>
            <TextField label="Título del Anuncio" fullWidth required sx={{ mb: 3 }} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            <TextField label="Texto del Anuncio" fullWidth required multiline minRows={5} sx={{ mb: 3 }} placeholder="Escribí el texto acá..." value={contenido} onChange={(e) => setContenido(e.target.value)} />

            <Box sx={{ mb: 3, p: 2, border: '1px dashed #cbd5e1', borderRadius: 2, bgcolor: '#f8fafc' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0B1E3B', mb: 1.5 }}>Adjuntar archivo o imagen (opcional)</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ color: '#0B1E3B', borderColor: '#0B1E3B', textTransform: 'none', '&:hover': { borderColor: '#f7a600', color: '#f7a600' } }}>
                  Seleccionar archivo
                  <input type="file" hidden onChange={handleArchivoChange} />
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

            <Button type="submit" variant="contained" size="large" sx={{ bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, py: 1.5, fontWeight: 'bold', mt: 2 }}>
              Publicar Y Enviar Notificación
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}