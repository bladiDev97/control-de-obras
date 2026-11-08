# Contexto actual — Notifications

Última actualización: 2026-11-08

## Estado general
Implementado y funcional con servicios de correo (`MailService`), mensajería (`WhatsAppService`) y cron job (`ObrasVencidasCron`).

## Qué está implementado
- [x] Servicio de correo con Nodemailer para envíos transaccionales a contratistas y supervisores.
- [x] `WhatsAppService` con endpoints de prueba en `ConfigController`.
- [x] Cron job `ObrasVencidasCron` para detección y aviso de obras vencidas.
- [x] Disparador CloudWatch `rate(15 minutes)` configurado en `serverless.yml`.

## Qué falta implementar
- [ ] Pruebas unitarias en `whatsapp.service.spec.ts` y `obras-vencidas.cron.spec.ts`.
- [ ] Plantillas HTML enriquecidas para correos transaccionales.
- [ ] Reintentos exponenciales ante fallos temporales de envío en WhatsApp.

## Decisiones pendientes
- Evaluar el uso de Amazon SES en reemplazo de servidores SMTP genéricos para entornos de producción AWS.

