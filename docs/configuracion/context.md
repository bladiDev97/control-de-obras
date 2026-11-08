# Contexto actual — Configuración

Última actualización: 2026-11-08

## Estado general
Implementado en `src/modules/configuracion/`. Permite gestionar parámetros del sistema y canales de notificación con pruebas de conectividad.

## Qué está implementado
- [x] Formulario de configuración SMTP con prueba de envío de correo.
- [x] Formulario de configuración de WhatsApp con endpoint de prueba.
- [x] Endpoints en `ConfigController` protegidos con JWT.
- [x] Vista frontend en `src/modules/configuracion/`.

## Qué falta implementar
- [ ] Botón de prueba de conectividad inmediata integrado directamente en el formulario (test SMTP ping / WhatsApp ping sin envío real).
- [ ] Indicador visual del estado de conexión (verde/rojo) después del test.

## Decisiones pendientes
- Ninguna bloqueante por el momento.

