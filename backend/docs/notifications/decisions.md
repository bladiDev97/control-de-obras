# Decisiones técnicas — Notifications

## [2026-08-24] Integración Dual de Notificaciones (Email SMTP + WhatsApp)
**Decisión**: Proveer canales de notificación tanto por correo electrónico con `nodemailer` como por API HTTP para WhatsApp (`WhatsAppService`).
**Motivo**: Los supervisores y personal de campo en obras tienen acceso prioritario y más inmediato vía WhatsApp en dispositivos móviles que mediante correo corporativo.
**Trade-off**: Mantenimiento de dos servicios externos independientes y manejo de cuotas o límites de la API de mensajería.

## [2026-08-24] Tareas Programadas en Entorno Serverless
**Decisión**: Configurar las tareas periódicas tanto con `@nestjs/schedule` para desarrollo local como con eventos de CloudWatch Scheduled en `serverless.yml` (`rate(15 minutes)`).
**Motivo**: En AWS Lambda las instancias se congelan al terminar la petición HTTP; un cron puramente en memoria no se dispararía sin un evento programado de CloudWatch.
**Trade-off**: Es necesario asegurar que la ejecución periódica no cause solapamientos ni consumos excesivos de cómputo en Lambda.

