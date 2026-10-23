import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Card, CardContent,
  TextField, FormControl, InputLabel, Select, MenuItem, Checkbox,
  ListItemText, OutlinedInput, CircularProgress, Alert
} from '@mui/material';
import api from './api/axiosConfig'; // misma instancia de axios que usa GestionCarreras

// ⚠️ Rutas que el backend tiene que exponer (solo ADMINISTRADOR).
// No figuran en la documentación: si dan 404, hay que crearlas en el backend.
const RUTA_LISTAR = '/usuarios';                 // GET
const RUTA_ELIMINAR = (id) => `/usuarios/${id}`; // DELETE

// El backend puede devolver texto plano o un objeto JSON en los errores
const mensajeDeError = (error, porDefecto) => {
  const status = error.response?.status;
  if (status === 401) return 'Tu sesión venció. Volvé a iniciar sesión.';
  if (status === 403) return 'No tenés permisos de administrador para realizar esta acción.';
  if (status === 404) return `${porDefecto} No se encontró el recurso (la ruta puede no existir en el backend).`;
  if (status === 409) return 'Ya existe un usuario con ese email.';
  if (!error.response) return 'No se pudo conectar con el servidor. Verificá que el backend esté corriendo.';

  const data = error.response.data;
  const texto = typeof data === 'string' ? data : (data?.mensaje || data?.message || data?.error);
  return texto ? `${porDefecto} ${texto}` : `${porDefecto} (error ${status})`;
};

// Formato documentado en /usuarios/me:
// inscripciones: [{ anioCarreraId, carreraId, carrera: "nombre", numero }]
const carreraDe = (alumno) =>
  (alumno.inscripciones ?? [])
    .map((i) => `${i.carrera} (${i.numero}° año)`)
    .join(', ') || '—';

const FORM_VACIO = { nombre: '', apellido: '', email: '', password: '' };

export default function GestionAlumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);

  // Selectores del alta: carreras y, por carrera, un solo año (el registro no permite dos de la misma)
  const [carreras, setCarreras] = useState([]);                 // [{id, nombre}]
  const [aniosPorCarrera, setAniosPorCarrera] = useState({});   // {carreraId: [{anioCarreraId, numero}]}
  const [carrerasElegidas, setCarrerasElegidas] = useState([]); // [carreraId]
  const [anioElegido, setAnioElegido] = useState({});           // {carreraId: anioCarreraId}

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [exitoMsg, setExitoMsg] = useState(null);

  // GET /usuarios (silencioso = no muestra el spinner de la tabla)
  const cargarAlumnos = async (silencioso = false) => {
    try {
      if (!silencioso) setCargando(true);
      const res = await api.get(RUTA_LISTAR);
      const data = res.data;
      // Acepta: [...], { content: [...] } (paginado) u objeto con un array adentro
      const lista = Array.isArray(data)
        ? data
        : data?.content ?? Object.values(data ?? {}).find(Array.isArray) ?? [];
      setAlumnos(lista);
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
      setErrorMsg(mensajeDeError(error, 'No se pudieron obtener los alumnos.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarAlumnos(); }, []);

  const resetFormulario = () => {
    setForm(FORM_VACIO);
    setCarrerasElegidas([]);
    setAnioElegido({});
    setMostrarFormulario(false);
  };

  // GET /carreras (solo la primera vez que se abre el formulario)
  const cargarCarreras = async () => {
    if (carreras.length > 0) return;
    try {
      const res = await api.get('/carreras');
      setCarreras(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error al cargar carreras:', error);
      setErrorMsg(mensajeDeError(error, 'No se pudieron obtener las carreras.'));
    }
  };

  // Botón superior: abre el formulario de alta o lo cierra
  const handleToggleFormulario = () => {
    if (mostrarFormulario) {
      resetFormulario();
    } else {
      setErrorMsg(null);
      setExitoMsg(null);
      setMostrarFormulario(true);
      cargarCarreras();
    }
  };

  // GET /carreras/{id}/anios
  const cargarAnios = async (carreraId) => {
    if (aniosPorCarrera[carreraId]) return;
    const res = await api.get(`/carreras/${carreraId}/anios`);
    setAniosPorCarrera((prev) => ({ ...prev, [carreraId]: Array.isArray(res.data) ? res.data : [] }));
  };

  const handleCambiarCarreras = async (ids) => {
    setCarrerasElegidas(ids);
    // Quitar el año elegido de las carreras destildadas
    setAnioElegido((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([cid]) => ids.includes(Number(cid))))
    );
    try {
      await Promise.all(ids.map(cargarAnios));
    } catch (error) {
      console.error('Error al cargar años:', error);
      setErrorMsg(mensajeDeError(error, 'No se pudieron obtener los años de la carrera.'));
    }
  };

  const setCampo = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  // POST /auth/registro (crea un estudiante)
  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setExitoMsg(null);

    if (carrerasElegidas.length === 0) return setErrorMsg('Elegí al menos una carrera.');
    const inscripciones = carrerasElegidas
      .map((cid) => anioElegido[cid])
      .filter(Boolean)
      .map((anioCarreraId) => ({ anioCarreraId }));
    if (inscripciones.length < carrerasElegidas.length) {
      return setErrorMsg('Elegí el año de cada carrera seleccionada.');
    }
    if (form.password.length < 8) {
      return setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
    }

    setGuardando(true);
    try {
      await api.post('/auth/registro', {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        password: form.password,
        inscripciones
      });
      resetFormulario();
      setExitoMsg('Alumno creado correctamente.');
      await cargarAlumnos(true); // la lista siempre refleja lo que quedó guardado en el backend
    } catch (error) {
      console.error('Error al crear alumno:', error);
      setErrorMsg(mensajeDeError(error, 'No se pudo crear el alumno.'));
    } finally {
      setGuardando(false);
    }
  };

  // DELETE /usuarios/{id}
  const handleEliminar = async (alumno) => {
    if (!window.confirm(`¿Estás seguro de que querés eliminar a ${alumno.nombre} ${alumno.apellido}?`)) return;

    setErrorMsg(null);
    setExitoMsg(null);
    try {
      await api.delete(RUTA_ELIMINAR(alumno.id));
      setAlumnos((prev) => prev.filter((a) => a.id !== alumno.id));
      setExitoMsg('Alumno eliminado.');
    } catch (error) {
      console.error('Error al eliminar alumno:', error);
      setErrorMsg(mensajeDeError(error, 'No se pudo eliminar al alumno.'));
    }
  };

  const nombreCarrera = (id) => carreras.find((c) => c.id === id)?.nombre ?? id;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>
          Gestión de Alumnos
        </Typography>

        <Button
          variant={mostrarFormulario ? 'outlined' : 'contained'}
          onClick={handleToggleFormulario}
          sx={{
            bgcolor: mostrarFormulario ? 'transparent' : '#f7a600',
            color: mostrarFormulario ? '#64748b' : '#fff',
            borderColor: mostrarFormulario ? '#cbd5e1' : 'transparent',
            '&:hover': { bgcolor: mostrarFormulario ? '#f1f5f9' : '#bc7e01' },
            fontWeight: 'bold',
            textTransform: 'none'
          }}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Agregar Nuevo Alumno'}
        </Button>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg(null)}>{errorMsg}</Alert>}
      {exitoMsg && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setExitoMsg(null)}>{exitoMsg}</Alert>}

      {mostrarFormulario && (
        <Card sx={{ mb: 4, borderRadius: 2, border: '2px solid #f7a600', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0B1E3B', mb: 2 }}>
              Registrar nuevo alumno en el sistema
            </Typography>
            <Box component="form" onSubmit={handleGuardar} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField label="Nombre" required size="small" sx={{ flex: 1, minWidth: 200 }}
                  value={form.nombre} onChange={setCampo('nombre')} disabled={guardando} />
                <TextField label="Apellido" required size="small" sx={{ flex: 1, minWidth: 200 }}
                  value={form.apellido} onChange={setCampo('apellido')} disabled={guardando} />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField label="Email" type="email" required size="small" sx={{ flex: 1, minWidth: 200 }}
                  value={form.email} onChange={setCampo('email')} disabled={guardando} />
                <TextField label="Contraseña (mín. 8 caracteres)" type="password" required size="small" sx={{ flex: 1, minWidth: 200 }}
                  value={form.password} onChange={setCampo('password')} disabled={guardando} />
              </Box>

              <FormControl size="small" fullWidth>
                <InputLabel>Carreras</InputLabel>
                <Select
                  multiple
                  value={carrerasElegidas}
                  onChange={(e) => handleCambiarCarreras(e.target.value)}
                  input={<OutlinedInput label="Carreras" />}
                  renderValue={(sel) => sel.map(nombreCarrera).join(', ')}
                  disabled={guardando}
                >
                  {carreras.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      <Checkbox
                        checked={carrerasElegidas.includes(c.id)}
                        sx={{ color: '#f7a600', '&.Mui-checked': { color: '#f7a600' } }}
                      />
                      <ListItemText primary={c.nombre} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Un solo año por carrera */}
              {carrerasElegidas.map((cid) => (
                <FormControl size="small" fullWidth key={cid}>
                  <InputLabel>{`Año - ${nombreCarrera(cid)}`}</InputLabel>
                  <Select
                    value={anioElegido[cid] ?? ''}
                    label={`Año - ${nombreCarrera(cid)}`}
                    onChange={(e) => setAnioElegido({ ...anioElegido, [cid]: e.target.value })}
                    disabled={guardando}
                  >
                    {(aniosPorCarrera[cid] || []).map((a) => (
                      <MenuItem key={a.anioCarreraId} value={a.anioCarreraId}>{a.numero}° año</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}

              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={guardando}
                  sx={{ bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, color: '#fff', fontWeight: 'bold', height: '40px', textTransform: 'none' }}
                >
                  {guardando ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Guardar Alumno'}
                </Button>
              </Box>

            </Box>
          </CardContent>
        </Card>
      )}

      <TableContainer component={Paper} sx={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>Nombre y Apellido</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>Carrera</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', color: '#0B1E3B', width: '15%' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cargando ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={30} sx={{ color: '#f7a600' }} />
                </TableCell>
              </TableRow>
            ) : alumnos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3, color: '#64748b' }}>
                  No hay alumnos registrados.
                </TableCell>
              </TableRow>
            ) : (
              alumnos.map((alumno) => (
                <TableRow key={alumno.id} hover>
                  <TableCell>{alumno.email}</TableCell>
                  <TableCell>{alumno.nombre} {alumno.apellido}</TableCell>
                  <TableCell>{carreraDe(alumno)}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      sx={{ fontWeight: 'bold', textTransform: 'none' }}
                      onClick={() => handleEliminar(alumno)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}