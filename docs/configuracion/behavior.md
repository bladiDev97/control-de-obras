# Módulo: Configuración

## Propósito
Administración de parámetros globales del sistema: ajuste de canales de notificación (SMTP, WhatsApp), variables operativas y configuraciones de conectividad. Permite probar los canales de comunicación sin reiniciar el servicio.

## Entradas
- Formularios de captura de credenciales SMTP: host, puerto, usuario, contraseña, remitente.
- Parámetros de integración WhatsApp: token de API, número de teléfono, URL de endpoint.

## Salidas
- Persistencia de configuraciones globales del sistema (en entorno o en tabla DynamoDB).
- Respuestas de prueba de conectividad inmediata (test de envío SMTP y ping WhatsApp).

## Reglas de negocio
1. Las credenciales de configuración (SMTP, WhatsApp) nunca deben exponerse en logs ni respuestas de API.
2. La confirmación de guardado de configuraciones críticas debe requerir acción explícita del usuario (doble confirmación o botón dedicado).
3. Las pruebas de conectividad deben ejecutarse en modo no-destructivo (sin enviar mensajes reales a usuarios del sistema).

