# Decisiones técnicas — Configuración

## [2026-08-30] Configuración de SMTP por Variable de Entorno y Formulario Admin
**Decisión**: Permitir tanto la configuración de SMTP vía variables de entorno Lambda (para producción estable) como vía formulario de administración (para ajustes dinámicos sin redespliegue).
**Motivo**: Facilitar ajustes de servidor de correo sin necesidad de un nuevo despliegue en AWS Lambda.
**Trade-off**: Si la configuración dinámica y la variable de entorno coexisten, debe definirse una prioridad clara de resolución (variable de entorno > configuración en DB).

## [2026-09-18] Protección de Rutas de Configuración
**Decisión**: Las rutas de configuración del sistema (`/config/*`) requieren autenticación JWT con rol de administrador.
**Motivo**: Evitar que usuarios no autorizados modifiquen canales de notificación o credenciales del sistema.
**Trade-off**: Ninguno significativo; refuerza la seguridad del panel de administración.

