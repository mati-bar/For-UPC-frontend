import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, CircularProgress, Alert, Avatar, Divider, Chip,
  Button, TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import api from './api/axiosConfig';

// ⚠️ Ruta que el backend tiene que exponer para que el usuario edite su propio perfil.
// No figura en la documentación: si da 404, hay que crearla en el backend.
const RUTA_EDITAR_PERFIL = '/usuarios/me'; // PUT { nombre, apellido }

// El backend puede devolver texto plano o un objeto JSON en los errores
const mensajeDeError = (error, porDefecto) => {
  const status = error.response?.status;
  if (status === 401) return 'Tu sesión venció. Volvé a iniciar sesión.';
  if (status === 403) return 'No tenés permisos para realizar esta acción.';
  if (status === 404) return `${porDefecto} No se encontró el recurso (la ruta puede no existir en el backend).`;
  if (!error.response) return 'No se pudo conectar con el servidor. Verificá tu conexión.';

  const data = error.response.data;
  const texto = typeof data === 'string' ? data : (data?.mensaje || data?.message || data?.error);
  return texto ? `${porDefecto} ${texto}` : `${porDefecto} (error ${status})`;
};

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Edición
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '' });
  const [guardando, setGuardando] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState(null);
  const [exitoMsg, setExitoMsg] = useState(null);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const res = await api.get('/usuarios/me');
        setPerfil(res.data);
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
        setErrorMsg('No se pudo cargar la información de tu perfil. Verificá tu conexión.');
      } finally {
        setCargando(false);
      }
    };
    cargarPerfil();
  }, []);

  const handleEditar = () => {
    setForm({ nombre: perfil.nombre ?? '', apellido: perfil.apellido ?? '' });
    setErrorEdicion(null);
    setExitoMsg(null);
    setEditando(true);
  };

  const handleCancelar = () => {
    setEditando(false);
    setErrorEdicion(null);
  };

  const setCampo = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  // PUT /usuarios/me
  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorEdicion(null);
    setExitoMsg(null);

    const nombre = form.nombre.trim();
    const apellido = form.apellido.trim();
    if (!nombre || !apellido) {
      return setErrorEdicion('El nombre y el apellido no pueden estar vacíos.');
    }

    setGuardando(true);
    try {
      await api.put(RUTA_EDITAR_PERFIL, { nombre, apellido });
      // Se actualiza solo lo editado: el resto del perfil (rol, inscripciones) queda como estaba
      setPerfil((prev) => ({ ...prev, nombre, apellido }));
      setEditando(false);
      setExitoMsg('Perfil actualizado.');
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      setErrorEdicion(mensajeDeError(error, 'No se pudieron guardar los cambios.'));
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress sx={{ color: '#f7a600' }} />
      </Box>
    );
  }

  if (errorMsg) return <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>;
  if (!perfil) return null;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B', mb: 3 }}>
        Mi Perfil
      </Typography>

      {exitoMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setExitoMsg(null)}>{exitoMsg}</Alert>}

      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderTop: '4px solid #f7a600' }}>
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#0B1E3B', fontSize: '2rem', mb: 2 }}>
            {perfil.nombre ? perfil.nombre.charAt(0).toUpperCase() : 'U'}
          </Avatar>

          {editando ? (
            <Box component="form" onSubmit={handleGuardar} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              {errorEdicion && <Alert severity="error" onClose={() => setErrorEdicion(null)}>{errorEdicion}</Alert>}
              <TextField label="Nombre" required size="small" fullWidth
                value={form.nombre} onChange={setCampo('nombre')} disabled={guardando} />
              <TextField label="Apellido" required size="small" fullWidth
                value={form.apellido} onChange={setCampo('apellido')} disabled={guardando} />
              <TextField label="Correo electrónico" size="small" fullWidth
                value={perfil.email ?? ''} disabled helperText="El correo no se puede modificar desde acá." />
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                <Button type="submit" variant="contained" disabled={guardando}
                  sx={{ bgcolor: '#f7a600', '&:hover': { bgcolor: '#bc7e01' }, color: '#fff', fontWeight: 'bold', textTransform: 'none' }}>
                  {guardando ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Guardar Cambios'}
                </Button>
                <Button variant="outlined" onClick={handleCancelar} disabled={guardando}
                  sx={{ color: '#64748b', borderColor: '#cbd5e1', textTransform: 'none', fontWeight: 'bold', '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' } }}>
                  Cancelar
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B1E3B' }}>
                {perfil.nombre} {perfil.apellido}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                {perfil.email}
              </Typography>
            </>
          )}

          <Chip
            label={perfil.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Estudiante'}
            sx={{ bgcolor: perfil.rol === 'ADMINISTRADOR' ? '#f7a600' : '#e2e8f0', color: perfil.rol === 'ADMINISTRADOR' ? '#fff' : '#0f172a', fontWeight: 'bold', mb: editando ? 3 : 2 }}
          />

          {!editando && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={handleEditar}
              sx={{
                mb: 3, textTransform: 'none', fontWeight: 'bold',
                color: '#f7a600', borderColor: '#f7a600',
                '&:hover': { borderColor: '#bc7e01', bgcolor: '#fffbeb', color: '#bc7e01' }
              }}
            >
              Editar perfil
            </Button>
          )}

          <Divider sx={{ width: '100%', mb: 3 }} />

          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0B1E3B', mb: 1 }}>
              Mis Inscripciones
            </Typography>

            {perfil.inscripciones && perfil.inscripciones.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {perfil.inscripciones.map((inscripcion, index) => (
                  <Card key={index} variant="outlined" sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 'bold' }}>
                      {inscripcion.carrera
                        ? `${inscripcion.carrera}${inscripcion.numero ? ` • ${inscripcion.numero}° Año` : ''}`
                        : `ID de Inscripción de Carrera / Año: ${inscripcion.anioCarreraId || inscripcion.id}`}
                    </Typography>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No tenés inscripciones registradas en el sistema.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}