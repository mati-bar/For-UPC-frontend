import axios from 'axios'

// URL base del backend. Acepta cualquiera de las dos variables, así toda la app apunta al mismo lugar.
// Ej: VITE_API_URL=https://for-upc-backend.onrender.com
const API_URL =
  import.meta.env.VITE_AUTH_API_URL ||
  import.meta.env.VITE_API_URL ||
  'https://for-upc-backend.onrender.com'

// El login está en "/" (ver App.jsx)
const RUTA_LOGIN = '/'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Un 401 en el propio login significa "credenciales incorrectas": no hay que redirigir,
    // para que la pantalla de login pueda mostrar el error.
    const esLogin = error.config?.url?.includes('/auth/login')

    if (error.response?.status === 401 && !esLogin) {
      localStorage.removeItem('token')
      if (window.location.pathname !== RUTA_LOGIN) {
        window.location.href = RUTA_LOGIN
      }
    }
    return Promise.reject(error)
  },
)

export default api