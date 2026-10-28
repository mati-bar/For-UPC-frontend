# FOR UPC - Portal Informativo Académico (Frontend)

Plataforma web desarrollada para la comunidad universitaria de la Universidad Provincial de Córdoba (Sede Laboulaye). El sistema cuenta con dos roles principales: los estudiantes, que pueden registrarse, iniciar sesión y acceder a un feed de novedades específicas de su carrera; y los administradores, encargados de gestionar a los usuarios y publicar los anuncios académicos en la plataforma.

## Tecnologías Utilizadas

* **Framework:** React.js con Vite
* **Librería de Componentes:** Material-UI (MUI)
* **Enrutamiento:** React Router DOM
* **Estado Global:** Redux Toolkit
* **Cliente HTTP:** Axios
* **Testing E2E:** Playwright

##  Enlaces del Despliegue

* **Frontend (Vercel):** [for-upc-frontend.vercel.app]
* **Backend (Render):** [Pegar acá el link del backend de Render]
* **Swagger (Documentación API):** [Pegar acá el link de Swagger]

##  Usuarios de Prueba

Para probar el sistema sin necesidad de registrarse, utilizar las siguientes credenciales:

* **Administrador:**
  * Email: [email_admin_prueba]
  * Contraseña: [password_admin_prueba]

* **Estudiante:**
  * Email: [email_estudiante_prueba]
  * Contraseña: [password_estudiante_prueba]

##  Cómo correr el proyecto en local

1. Clonar el repositorio y entrar a la carpeta:
git clone https://github.com/[usuario]/[repositorio].git
cd For-UPC-frontend

2. Instalar las dependencias:
npm install

3. Configurar Variables de Entorno:
Crear un archivo .env en la raíz del proyecto copiando la estructura de .env.example.
Ejemplo de .env:
VITE_API_URL=http://localhost:8080

4. Ejecutar el servidor de desarrollo:
npm run dev

El proyecto estará disponible en http://localhost:5173.

##  Pruebas Automatizadas (Playwright)

El proyecto cuenta con pruebas End-to-End para verificar el flujo de autenticación y protección de rutas. 

Para ejecutar las pruebas en modo oculto (consola):
npx playwright test

Para ejecutar las pruebas visualmente (UI interactiva):
npx playwright test --ui

(Nota: El backend local debe estar corriendo para que las pruebas de login pasen exitosamente).
