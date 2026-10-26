import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Card, CardContent,
  TextField, FormControl, InputLabel, Select, MenuItem, Checkbox,
  ListItemText, OutlinedInput, CircularProgress, Alert, Pagination, Chip
} from '@mui/material';
import api from './api/axiosConfig'; // misma instancia de axios que usa GestionCarreras

// ⚠️ Rutas que el backend tiene que exponer (solo ADMINISTRADOR).
// No figuran en la documentación: si dan 404 o 405, hay que crearlas en el backend.
const RUTA_LISTAR = '/usuarios';                 // GET
const RUTA_ELIMINAR = (id) => `/usuarios/${id}`; // DELETE
const RUTA_EDITAR = (id) => `/usuarios/${id}`;   // PUT { nombre, apellido, inscripciones: [{ anioCarreraId }] }

const POR_PAGINA = 10; // alumnos por página

// El backend puede devolver texto plano o un objeto JSON en los errores
const mensajeDeError = (error, porDefecto) => {
  const status = error.response?.status;
  if (status === 401) return 'Tu sesión venció. Volvé a iniciar sesión.';
  if (status === 403) return 'No tenés permisos de administrador para realizar esta acción.';
  if (status === 404) return `${porDefecto} No se encontró el recurso (la ruta puede no existir en el backend).`;
  if (status === 405) return `${porDefecto} El backend todavía no permite editar alumnos (falta PUT en esa ruta).`;
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

// Si el backend devuelve un Page de Spring ({ content, totalPages, totalElements })
const esPaginado = (data) => data && !Array.isArray(data) && Array.isArray(data.content);

// Si no está paginado, busca el array en la respuesta ([...] u objeto con un array adentro)
const extraerLista = (data) =>
  Array.isArray(data) ? data : Object.values(data ?? {}).find(Array.isArray) ?? [];

const FORM_VACIO = { nombre: '', apellido: '', email: '', password: '' };

export default function GestionAlumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [idEdicion, setIdEdicion] = useState(null);               // null = alta; si no, id del alumno que se edita
  const [alumnoEnEdicion, setAlumnoEnEdicion] = useState(null);   // para mostrar su email, carreras y años (solo lectura)

  // Paginación
  const [pagina, setPagina] = useState(1); // página actual (empieza en 1)
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalAlumnos, setTotalAlumnos] = useState(0);
  const tablaRef = useRef(null);

  // Selectores del ALTA: carreras y, por carrera, un solo año (el registro no permite dos de la misma)
  const [carreras, setCarreras] = useState([]);                 // [{id, nombre}]
  const [aniosPorCarrera, setAniosPorCarrera] = useState({});   // {carreraId: [{anioCarreraId, numero}]}
  const [carrerasElegidas, setCarrerasElegidas] = useState([]); // [carreraId]
  const [anioElegido, setAnioElegido] = useState({});           // {carreraId: anioCarreraId}

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [exitoMsg, setExitoMsg] = useState(null);

  const editando = idEdicion !== null;

  // GET /usuarios?page=N&size=10 (page empieza en 0 en el backend).
  // Funciona con los dos formatos posibles:
  //  - Backend paginado (Page de Spring): se pide solo la página necesaria.
  //  - Backend que devuelve la lista completa: se corta acá, en pantalla.
  // silencioso = true: no muestra el spinner de la tabla.
  const cargarAlumnos = useCallback(async (paginaPedida = 1, silencioso = false) => {
    try {
      if (!silencioso) setCargando(true);

      const pedir = (n) => api.get(RUTA_LISTAR, { params: { page: n - 1, size: POR_PAGINA } });

      let numero = Math.max(1, paginaPedida);
      let data = (await pedir(numero)).data;

      if (esPaginado(data)) {
        const total = Math.max(1, data.totalPages ?? 1);
        // Si la página pedida ya no existe (por ejemplo, se borró el último alumno de la última página)
        if (numero > total) {
          numero = total;
          data = (await pedir(numero)).data;
        }
        setAlumnos(data.content ?? []);
        setTotalPaginas(Math.max(1, data.totalPages ?? 1));
        setTotalAlumnos(data.totalElements ?? (data.content ?? []).length);
      } else {
        const lista = extraerLista(data);
        const total = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
        numero = Math.min(numero, total);
        setAlumnos(lista.slice((numero - 1) * POR_PAGINA, numero * POR_PAGINA));
        setTotalPaginas(total);
        setTotalAlumnos(lista.length);
      }
      setPagina(numero);
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
      setErrorMsg(mensajeDeError(error, 'No se pudieron obtener los alumnos.'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarAlumnos(1); }, [cargarAlumnos]);

  const cambiarPagina = async (_, nueva) => {
    await cargarAlumnos(nueva);
    tablaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetFormulario = () => {
    setForm(FORM_VACIO);
    setCarrerasElegidas([]);
    setAnioElegido({});
    setIdEdicion(null);
    setAlumnoEnEdicion(null);
    setMostrarFormulario(false);
  };

  // GET /carreras (solo la primera vez que se abre el formulario de alta)
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

  // Botón superior: abre el formulario de alta o lo cierra (y cancela una edición en curso)
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

  // Abre el formulario con los datos del alumno. Solo nombre y apellido son editables;
  // el email, las carreras y los años se muestran sin posibilidad de cambio.
  const handleEditar = (alumno) => {
    setErrorMsg(null);
    setExitoMsg(null);
    setForm({
      nombre: alumno.nombre ?? '',
      apellido: alumno.apellido ?? '',
      email: alumno.email ?? '',
      password: ''
    });
    setAlumnoEnEdicion(alumno);
    setIdEdicion(alumno.id);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // PUT /usuarios/{id} (edición) o POST /auth/registro (alta)
  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setExitoMsg(null);

    // ---- EDICIÓN: solo nombre y apellido
    if (editando) {
      const nombre = form.nombre.trim();
      const apellido = form.apellido.trim();
      if (!nombre || !apellido) {
        return setErrorMsg('El nombre y el apellido no pueden estar vacíos.');
      }

      setGuardando(true);
      try {
        // El backend exige al menos una inscripción: se reenvían las actuales sin cambios
        const inscripciones = (alumnoEnEdicion?.inscripciones ?? [])
          .map((i) => ({ anioCarreraId: i.anioCarreraId }))
          .filter((i) => i.anioCarreraId != null);
        await api.put(RUTA_EDITAR(idEdicion), { nombre, apellido, inscripciones });
        resetFormulario();
        setExitoMsg('Cambios guardados.');
        await cargarAlumnos(pagina, true); // recarga la página actual: la lista refleja lo guardado en el backend
      } catch (error) {
        console.error('Error al guardar alumno:', error);
        setErrorMsg(mensajeDeError(error, 'No se pudieron guardar los cambios.'));
      } finally {
        setGuardando(false);
      }
      return;
    }

    // ---- ALTA
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
      await cargarAlumnos(pagina, true);
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
      if (idEdicion === alumno.id) resetFormulario(); // si justo se estaba editando, se cierra el formulario
      setExitoMsg('Alumno eliminado.');
      // Recarga la página actual; si quedó vacía, vuelve a la anterior
      await cargarAlumnos(pagina, true);
    } catch (error) {
      console.error('Error al eliminar alumno:', error);
      setErrorMsg(mensajeDeError(error, 'No se pudo eliminar al alumno.'));
    }
  };

  const nombreCarrera = (id) => carreras.find((c) => c.id === id)?.nombre ?? id;

  const desde = totalAlumnos === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1;
  const hasta = (pagina - 1) * POR_PAGINA + alumnos.length;

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
              {editando ? 'Editar perfil del alumno' : 'Registrar nuevo alumno en el sistema'}
            </Typography>
            <Box component="form" onSubmit={handleGuardar} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField label="Nombre" required size="small" sx={{ flex: 1, minWidth: 200 }}
                  value={form.nombre} onChange={setCampo('nombre')} disabled={guardando} />
                <TextField label="Apellido" required size="small" sx={{ flex: 1, minWidth: 200 }}
                  value={form.apellido} onChange={setCampo('apellido')} disabled={guardando} />
              </Box>

              {editando ? (
                <>
                  {/* EDICIÓN: email, carreras y años solo se muestran. No hay campo de contraseña. */}
                  <TextField
                    label="Email"
                    size="small"
                    fullWidth
                    value={alumnoEnEdicion?.email ?? ''}
                    disabled
                    helperText="El email no se puede modificar."
                  />

                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.75 }}>
                      Carreras y año de inscripción
                    </Typography>
                    {(alumnoEnEdicion?.inscripciones ?? []).length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {alumnoEnEdicion.inscripciones.map((i, idx) => (
                          <Chip
                            key={idx}
                            size="small"
                            label={`${i.carrera} • ${i.numero}° Año`}
                            sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 600, border: '1px solid #e2e8f0' }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>Sin carreras asignadas.</Typography>
                    )}
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.75 }}>
                      Solo se pueden editar el nombre y el apellido.
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  {/* ALTA: email, contraseña, carreras y años */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField label="Email" type="email" required size="small" sx={{ flex: 1, minWidth: 200 }}
                      value={form.email} onChange={setCampo('email')} disabled={guardando} />
                    <TextField label="Contraseña (mín. 8 caracteres)" type="password" required size="small" sx={{ flex: 1, minWidth: 200 }}
                      value={form.password} onChange={setCampo('password')} disabled={guardando} autoComplete="new-password" />
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
                </>
              )}

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={guardando}
                  sx={{ bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, color: '#fff', fontWeight: 'bold', height: '40px', textTransform: 'none' }}
                >
                  {guardando
                    ? <CircularProgress size={22} sx={{ color: '#fff' }} />
                    : editando ? 'Guardar Cambios' : 'Guardar Alumno'}
                </Button>
                {editando && (
                  <Button
                    variant="outlined"
                    onClick={resetFormulario}
                    disabled={guardando}
                    sx={{ color: '#64748b', borderColor: '#cbd5e1', height: '40px', textTransform: 'none', fontWeight: 'bold', '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' } }}
                  >
                    Cancelar edición
                  </Button>
                )}
              </Box>

            </Box>
          </CardContent>
        </Card>
      )}

      <TableContainer ref={tablaRef} component={Paper} sx={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: 2, scrollMarginTop: 16 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>Nombre y Apellido</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>Carrera</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', color: '#0B1E3B', width: '22%' }}>Acciones</TableCell>
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
                <TableRow key={alumno.id} hover selected={alumno.id === idEdicion}>
                  <TableCell>{alumno.email}</TableCell>
                  <TableCell>{alumno.nombre} {alumno.apellido}</TableCell>
                  <TableCell>{carreraDe(alumno)}</TableCell>
                  <TableCell sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        fontWeight: 'bold', textTransform: 'none', mr: 1,
                        color: '#f7a600', borderColor: '#f7a600',
                        '&:hover': { borderColor: '#bc7e01', bgcolor: '#fffbeb', color: '#bc7e01' }
                      }}
                      onClick={() => handleEditar(alumno)}
                    >
                      Editar
                    </Button>
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

      {/* PAGINACIÓN */}
      {!cargando && totalAlumnos > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mt: 3, mb: 2 }}>
          {totalPaginas > 1 && (
            <Pagination
              count={totalPaginas}
              page={pagina}
              onChange={cambiarPagina}
              shape="rounded"
              siblingCount={1}
              sx={{
                '& .MuiPaginationItem-root': { fontWeight: 600, color: '#475569' },
                '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#f7a600', color: '#fff' },
                '& .MuiPaginationItem-root.Mui-selected:hover': { bgcolor: '#bc7e01' }
              }}
            />
          )}
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
            Mostrando {desde}–{hasta} de {totalAlumnos} alumnos
          </Typography>
        </Box>
      )}
    </Box>
  );
}