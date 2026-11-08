# Módulo: Notifications

## Propósito
Gestiona el sistema de avisos y alertas automatizadas: notificaciones por correo electrónico (SMTP con Nodemailer), mensajes por WhatsApp y tareas programadas (cron jobs) para supervisión de obras vencidas o próximas a vencer.

## Entradas
- Eventos de alerta: Obras con fecha límite vencida o próximas a vencer.
- Parámetros de conexión SMTP: Servidor, puerto, usuario, contraseña, remitente.
- Endpoints de prueba: `/config/smtp/test`, `/config/whatsapp/test`, `/config/whatsapp/test-alert`.

## Salidas
- Correos electrónicos transaccionales enviados a supervisores y contratistas.
- Mensajes de alerta despachados vía API de WhatsApp.
- Logs de ejecución de cron jobs en CloudWatch / consola.

## Reglas de negocio
1. El cron job `ObrasVencidasCron` se ejecuta periódicamente (cada 15 minutos o según CloudWatch) para detectar obras con fechas vencidas.
2. Si las variables SMTP o de WhatsApp no están configuradas en el entorno, el servicio debe capturar el error sin interrumpir el flujo principal de la API.
3. Las notificaciones a contratistas solo se envían para obras en estado `ASIGNADA` con fechas programadas activas.
