# Módulo: Notifications

## Propósito
Gestiona el sistema de avisos y alertas automatizadas del sistema: notificaciones por correo electrónico (SMTP con Nodemailer), alertas por mensajería instantánea (WhatsApp Integration) y tareas programadas en segundo plano (cron jobs para supervisión de obras vencidas).

## Entradas
- Eventos de alerta: Obras con fecha límite vencida o próximas a vencer.
- Peticiones de prueba: Endpoints `/config/smtp/test`, `/config/whatsapp/test` y `/config/whatsapp/test-alert`.
- Parámetros de conexión: Servidor SMTP, puerto, usuario, contraseña, remitente.

## Salidas
- Correos electrónicos transaccionales enviados a supervisores y contratistas.
- Mensajes de alerta despachados vía API de WhatsApp.
- Logs de ejecución de cron jobs en CloudWatch / consola.

## Reglas de negocio
1. El cron job de obras vencidas (`ObrasVencidasCron`) se ejecuta periódicamente según la programación definida (15 minutos o programada diaria).
2. Si las variables SMTP o de WhatsApp no están configuradas en el entorno, el servicio debe capturar el error sin interrumpir el flujo principal de la API.
3. Las notificaciones a contratistas solo se envían para obras en estado `ASIGNADA` con fechas programadas activas.

