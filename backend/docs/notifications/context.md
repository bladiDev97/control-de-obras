# Contexto actual — Notifications

Última actualización: 2026-11-08

## Estado general
Implementado y funcional con servicios de correo (`MailService`), mensajería (`WhatsAppService`) y cron job (`ObrasVencidasCron`).

## Qué está implementado
- [x] Servicio de correo con Nodemailer para envíos transaccionales.
- [x] Servicio `WhatsAppService` con endpoints de prueba en `ConfigController`.
- [x] Cron job `ObrasVencidasCron` para detección y aviso de obras vencidas.
- [x] Configuración de disparador `rate(15 minutes)` en `serverless.yml`.

## Qué falta implementar
- [ ] Pruebas unitarias en `whatsapp.service.spec.ts` y `obras-vencidas.cron.spec.ts`.
- [ ] Plantillas HTML enriquecidas para correos de notificación.
- [ ] Reintentos exponenciales ante fallos temporales de envío en WhatsApp.

## Decisiones pendientes
- Evaluar uso de Amazon SES en reemplazo de servidores SMTP genéricos para entornos de producción en AWS.

## Notas para la próxima sesión
- Si se ejecutan pruebas locales, asegurarse de configurar variables SMTP válidas o verificar los logs donde se notifican los fallos de transporte sin tumbar la aplicación.

