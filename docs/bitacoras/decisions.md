# Decisiones técnicas — Bitácoras

## [2026-08-10] Generación de Formatos en Cliente
**Decisión**: Generar los formatos de bitácoras y avisos MT directamente en el cliente (browser) usando plantillas HTML con estilos de impresión (`@media print`), sin depender de PDF-generation del backend.
**Motivo**: Reducir la carga del backend serverless y permitir previsualización instantánea antes de imprimir.
**Trade-off**: El control de formato y fidelidad tipográfica está limitado a las capacidades de impresión del navegador del usuario.

## [2026-09-05] Membrete Institucional como Asset Estático
**Decisión**: Incluir el membrete CFE como imagen estática (`membretadaCFE_2026.docx`/`membrete.png`) referenciada en las plantillas de impresión.
**Motivo**: Mantener la identidad institucional consistente en todos los documentos generados por el sistema.
**Trade-off**: El membrete debe actualizarse manualmente en el repositorio cuando cambie la imagen oficial.

