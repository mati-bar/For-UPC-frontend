import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, Button, 
  Tabs, Tab, Container, MenuItem, FormControl, InputLabel, Select,
  Checkbox, ListItemText, OutlinedInput
} from '@mui/material';

export default function Login() {
  const [tabValue, setTabValue] = useState(0); // 0: Login, 1: Registro

const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
};

  // Estados base del registro
const [nombreApellido, setNombreApellido] = useState('');
const [correo, setCorreo] = useState('');
const [password, setPassword] = useState('');

  // Estado para el Multiple Select (guarda un arreglo con las carreras elegidas)
const [carreras, setCarreras] = useState([]);

  // Estado para guardar el año de cada carrera de forma dinámica (ej: { "Tecnicatura...": "1er Año" })
const [anios, setAnios] = useState({});

const opcionesCarreras = [
    "Tecnicatura Universitaria en Programación Full Stack",
    "Profesorado Universitario de Biología",
    "Profesorado Universitario de Geografía",
    "Profesorado de Educación Secundaria en Historia",
    "Profesorado de Educación Secundaria en Matemática",
    "Prof. Educación Física",

];

const handleCarrerasChange = (event) => {
    const { target: { value } } = event;
    setCarreras(typeof value === 'string' ? value.split(',') : value);
};

  // guarda un arreglo de años para cada carrera
const handleAnioChange = (carrera, event) => {
    const { target: { value } } = event;
    setAnios({ 
    ...anios, 
    [carrera]: typeof value === 'string' ? value.split(',') : value 
    });
};

return (
    <Box sx={{ 
    backgroundColor: '#f1f5f9', minHeight: '100vh', display: 'flex', 
    alignItems: 'center', justifyContent: 'center', py: 4
    }}>
    <Container maxWidth="sm">
        
        {/* ENCABEZADO INSTITUCIONAL */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ 
            display: 'inline-block', bgcolor: '#0F2C59', color: 'white', 
            px: 2, py: 1, borderRadius: 2, fontWeight: 'bold', mb: 1
        }}>
            UPC
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>
            Portal Informativo Académico
        </Typography>
        <Typography variant="body2" color="text.secondary">
            Comunidad Universitaria - Laboulaye
        </Typography>
        </Box>

        {/* TARJETA PRINCIPAL */}
        <Card sx={{ borderRadius: 4, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
        
        <Tabs 
            value={tabValue} onChange={handleTabChange} variant="fullWidth" 
            sx={{ borderBottom: '1px solid #e2e8f0', '& .MuiTab-root': { fontWeight: 'bold' } }}
        >
            <Tab label="Iniciar Sesión" />
            <Tab label="Registrarse" />
        </Tabs>

        <CardContent sx={{ p: 4 }}>
            
            {/* VISTA 1: INICIAR SESIÓN */}
            {tabValue === 0 && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="body2" color="text.secondary">
                Ingresá con tu correo institucional para acceder a las novedades de tu carrera.
                </Typography>
                <TextField label="Correo electrónico" type="email" fullWidth required size="small" />
                <TextField label="Contraseña" type="password" fullWidth required size="small" />

                <Typography 
                variant="body2" component="a" href="#recuperar" 
                onClick={(e) => { e.preventDefault(); alert("Próximamente: Sistema de recuperación de contraseña."); }}
                sx={{ 
                    textAlign: 'right', color: '#0F2C59', textDecoration: 'none', 
                    fontWeight: 'medium', '&:hover': { textDecoration: 'underline' }, mt: -1
                }}
                >
                ¿Olvidaste tu contraseña?
                </Typography>

                <Button 
                variant="contained" size="large" 
                sx={{ bgcolor: '#0F2C59', '&:hover': { bgcolor: '#0b1e3b' }, py: 1.5, fontWeight: 'bold' }}
                >
                Entrar a la Plataforma
                </Button>
            </Box>
            )}

            {/* VISTA 2: REGISTRO DE ESTUDIANTE */}
            {tabValue === 1 && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column' }}>
                <TextField 
                label="Nombre y Apellido" fullWidth required size="small" sx={{ mb: 2 }} 
                value={nombreApellido} onChange={(e) => setNombreApellido(e.target.value)} 
                />
                <TextField 
                label="Correo Electrónico" type="email" fullWidth required size="small" sx={{ mb: 2 }} 
                value={correo} onChange={(e) => setCorreo(e.target.value)} 
                />
                <TextField 
                label="Contraseña" type="password" fullWidth required size="small" sx={{ mb: 3 }} 
                value={password} onChange={(e) => setPassword(e.target.value)} 
                />

                {/* SELECT MÚLTIPLE DE CARRERAS */}
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Carreras</InputLabel>
                <Select
                    multiple
                    value={carreras}
                    onChange={handleCarrerasChange}
                    input={<OutlinedInput label="Carreras" />}
                    renderValue={(selected) => selected.join(', ')}
                >
                    {opcionesCarreras.map((carrera) => (
                    <MenuItem key={carrera} value={carrera}>
                        <Checkbox checked={carreras.indexOf(carrera) > -1} />
                        <ListItemText primary={carrera} />
                    </MenuItem>
                    ))}
                </Select>
                </FormControl>

                {/* CAJAS DE AÑOS DINÁMICAS (Ahora con Select Múltiple) */}
                {carreras.map((carrera) => (
                <FormControl fullWidth size="small" sx={{ mb: 2 }} key={carrera}>
                    <InputLabel>Año/s que cursás - {carrera}</InputLabel>
                    <Select
                    multiple
                      value={anios[carrera] || []} // Inicia como arreglo vacío
                    onChange={(e) => handleAnioChange(carrera, e)}
                    input={<OutlinedInput label={`Año/s que cursás - ${carrera}`} />}
                    renderValue={(selected) => selected.join(', ')}
                    >
                    {['1er Año', '2do Año', '3er Año', '4to Año'].map((anio) => (
                        <MenuItem key={anio} value={anio}>
                        <Checkbox checked={(anios[carrera] || []).indexOf(anio) > -1} />
                        <ListItemText primary={anio} />
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
                ))}
            

                <Button 
                variant="contained" size="large" 
                sx={{ bgcolor: '#0F2C59', '&:hover': { bgcolor: '#0b1e3b' }, py: 1.5, fontWeight: 'bold', mt: 1 }}
                >
                Completar Registro
                </Button>
            </Box>
            )}

        </CardContent>
        </Card>
        
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'text.secondary' }}>
        Universidad Provincial de Córdoba — Sede Laboulaye
        </Typography>

    </Container>
    </Box>
);
}