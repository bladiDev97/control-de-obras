# Reglas de Seguridad

## Variables de Entorno y Secretos
- Nunca almacenar claves privadas, secretos o credenciales de producción en el código cliente.
- Todas las variables expuestas en el build deben tener el prefijo `VITE_` (e.g. `VITE_API_URL`).
- Verificar que archivos con credenciales o configuraciones locales (`.env.local`) estén en `.gitignore`.

## Procesamiento de Archivos y Datos
- Validar las extensiones permitidas (`.xlsx`, `.xlsb`, `.csv`) y los tipos MIME antes de procesar archivos subidos por el usuario.
- Sanitizar nombres de archivo y controlar excepciones al leer libros de Excel corruptos o mal formateados para evitar denegación de servicio en el navegador.

## Sesión y Comunicaciones
- Transportar tokens de autenticación únicamente vía headers Authorization (`Bearer <token>`) o cookies seguras HttpOnly gestionadas por el backend.
- No registrar datos sensibles de usuarios ni contenido confidencial en `console.log`.

