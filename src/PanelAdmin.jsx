import React, { useState } from 'react';
import { 
Box, Card, CardContent, Typography, TextField, Button, Container,
FormControl, InputLabel, Select, MenuItem, Checkbox, 
ListItemText, OutlinedInput, FormControlLabel, Switch 
} from '@mui/material';

export default function PanelAdmin() {
  // Dónde guardamos el título y el texto del anuncio
const [titulo, setTitulo] = useState('');
const [contenido, setContenido] = useState('');

  // NUEVO: Esto maneja si el anuncio es urgente/destacado (arranca apagado)
const [esUrgente, setEsUrgente] = useState(false);

  // Esto maneja a quién le va a llegar el anuncio
const [esGeneral, setEsGeneral] = useState(true); 
const [carrerasDestino, setCarrerasDestino] = useState([]); 
const [aniosDestino, setAniosDestino] = useState({}); 

const handlePublicar = (e) => {};

return (
    <Box sx={{ backgroundColor: '#f1f5f9', minHeight: '100vh', py: 4 }}>
    <Container maxWidth="md">
        
        {/* LOS TÍTULOS DE LA PÁGINA */}
        <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0B1E3B', mb: 1 }}>
            Panel de Administración
        </Typography>
        <Typography variant="body1" color="text.secondary">
            Publicación de anuncios institucionales.
        </Typography>
        </Box>

        {/* LA CAJA BLANCA DONDE ESTÁ EL FORMULARIO */}
        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handlePublicar} sx={{ display: 'flex', flexDirection: 'column' }}>
            
            <TextField 
                label="Título del Anuncio" 
                fullWidth required sx={{ mb: 3 }} 
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
            />
            
            <TextField 
                label="Texto del Anuncio" 
                fullWidth required multiline minRows={5} sx={{ mb: 3 }} 
                placeholder="Escribí el texto acá. Podés usar Enter para separar párrafos o guiones para armar listas..."
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
            />

              {/* NUEVA LLAVECITA PARA MARCAR COMO URGENTE */}
            <Box sx={{ mb: 3, p: 2, bgcolor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 2 }}>
                <FormControlLabel 
                control={
                    <Switch 
                    color="error"
                    checked={esUrgente} 
                    onChange={(e) => setEsUrgente(e.target.checked)} 
                    />
                } 
                label={
                    <Typography sx={{ fontWeight: 'bold', color: '#e11d48' }}>
                    Marcar anuncio como URGENTE / DESTACADO
                    </Typography>
                } 
                />
                <Typography variant="caption" sx={{ display: 'block', ml: 7, color: '#be123c' }}>
                
                </Typography>
            </Box>

              {/* LA OPCIÓN PARA TILDAR UN ANUNCIO PARA "TODOS" */}
            <FormControlLabel 
                control={
                <Checkbox 
                    checked={esGeneral} 
                    onChange={(e) => {
                    setEsGeneral(e.target.checked);
                    if (e.target.checked) {
                        setCarrerasDestino([]);
                        setAniosDestino({});
                    }
                    }} 
                />
                } 
                label="Anuncio General (Se manda a todas las carreras y años sin filtrar nada)" 
                sx={{ mb: 2 }}
            />

              {/* LAS CAJITAS PARA FILTRAR (Ojo: esto solo aparece si destildan el "Todos" de arriba) */}
            {!esGeneral && (
                <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, mb: 3, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#334155', fontWeight: 'bold' }}>
                    Elegir a qué carreras y años mandarlo:
                </Typography>

                  {/* LA CAJITA DESPLEGABLE PARA ELEGIR LAS CARRERAS */}
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Carreras</InputLabel>
                    <Select
                    multiple
                    value={carrerasDestino}
                    onChange={(e) => setCarrerasDestino(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                    input={<OutlinedInput label="Carreras" />}
                    renderValue={(selected) => selected.join(', ')}
                    >
                    {['Tecnicatura Universitaria en Programación Full Stack', 'Profesorado Universitario de Biología', 'Profesorado Universitario de Geografía', 'Profesorado de Educación Secundaria en Historia', 'Profesorado de Educación Secundaria en  Matemática', 'Prof. Educación Física'].map((carrera) => (
                        <MenuItem key={carrera} value={carrera}>
                        <Checkbox checked={carrerasDestino.indexOf(carrera) > -1} />
                        <ListItemText primary={carrera} />
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>

                  {/* LAS CAJITAS DE AÑOS */}
                {carrerasDestino.map((carrera) => (
                    <FormControl fullWidth size="small" sx={{ mb: 2 }} key={carrera}>
                    <InputLabel>Año/s - {carrera}</InputLabel>
                    <Select
                        multiple
                        value={aniosDestino[carrera] || []}
                        onChange={(e) => setAniosDestino({
                        ...aniosDestino, 
                        [carrera]: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                        })}
                        input={<OutlinedInput label={`Año/s - ${carrera}`} />}
                        renderValue={(selected) => selected.join(', ')}
                    >
                        {['1er Año', '2do Año', '3er Año', '4to Año'].map((anio) => (
                        <MenuItem key={anio} value={anio}>
                            <Checkbox checked={(aniosDestino[carrera] || []).indexOf(anio) > -1} />
                            <ListItemText primary={anio} />
                        </MenuItem>
                        ))}
                    </Select>
                    </FormControl>
                ))}
                </Box>
            )}

            <Button 
                type="submit"
                variant="contained" 
                size="large" 
                sx={{ bgcolor: '#0F2C59', '&:hover': { bgcolor: '#0b1e3b' }, py: 1.5, fontWeight: 'bold', mt: 2 }}
            >
                Publicar Y Enviar Notificación
            </Button>
            </Box>
        </CardContent>
        </Card>
    </Container>
    </Box>
);
}