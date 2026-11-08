---
name: obras-domain
description: Reglas de negocio del dominio de obras, cálculo de estados (PENDIENTE, ASIGNADA, TERMINADA, CAPITALIZADA, CANCELADA), números de oficio consecutivos, planos en S3 y bitácoras.
---

# Skill: Dominio de Obras

## Cuándo se usa
Aplica al trabajar en la lógica de negocio central del sistema: ciclo de vida de obras, cálculo dinámico de estados, oficios consecutivos, bitácoras de campo, estimaciones, importación masiva y generación/asociación de planos.

## Reglas principales
1. **Ciclo de Estados de la Obra**:
   - `PENDIENTE`: Obra registrada en el sistema pero sin asignación de contratista, contrato ni oficio.
   - `ASIGNADA`: Obra con número de oficio consecutivo, contrato, contratista o fecha de asignación registrada.
   - `TERMINADA`: Obra con fecha de término de campo (`fechaTerminoCampo`) registrada y validada.
   - `CAPITALIZADA`: Obra con fecha de capitalización (`fechaCapitalizacion`) oficial.
   - `CANCELADA`: Obra explícitamente cancelada con motivo y fecha (`fechaCancelacion`). Prevalece sobre cualquier otro estado.
2. **Determinación Dinámica de Estados**:
   - Utilizar el método `determineEstatus(obra: IObra)` y `isObraAsignada(obra: IObra)` en `ObraService`.
   - Si la obra está cancelada, nunca debe ser marcada como asignada ni terminada.
3. **Control de Oficios y Consecutivos**:
   - Cada obra asignada recibe un número consecutivo único (`oficioConsecutivo`) dentro de su periodo o zona.
   - La resecuenciación o asignación concurrente debe protegerse con mecanismos de bloqueo en memoria o sincronización transaccional (`resequenceLocks`).
4. **Tratamiento de Fechas**:
   - Las fechas pueden provenir en formato ISO (`YYYY-MM-DD`) o formato latino/mexicano (`DD/MM/YYYY` o `DD-MM-YYYY`).
   - Usar `parseDateToTimestamp` de `ObraService` para normalizar fechas al ordenar cronológicamente o calcular días sin capitalizar.
5. **Almacenamiento de Planos y Documentos**:
   - Los planos en formato PDF se almacenan en AWS S3 a través de `S3Service`.
   - Las URLs de planos se persisten en el atributo `planoPdf` de la obra y se visualizan mediante el endpoint proxy `/obras/plano-view`.

## Patrones y ejemplos

### Validación y Determinación de Estatus
```typescript
public isObraAsignada(obra: IObra): boolean {
  if (obra.estatus === 'CANCELADA') return false;
  if (!obra.at || obra.at.trim() === '') return false;
  if (obra.contrato && obra.contrato.trim() !== '') return true;
  if (obra.contratista && obra.contratista.trim() !== '') return true;
  if (obra.fechaAsignacion && obra.fechaAsignacion.trim() !== '') return true;
  if (obra.oficioConsecutivo != null && Number(obra.oficioConsecutivo) > 0) return true;
  return false;
}
```

## Lo que NO hacer
- **NO modificar el estatus directamente sin evaluar las reglas de negocio**: una obra no puede pasar a `CAPITALIZADA` sin haber cumplido los requisitos de terminación o asignación previa.
- **NO recalcular números de oficio sin auditoría previa**: cualquier resecuenciación masiva debe validar integridad y evitar duplicidades de oficios ya emitidos a contratistas.
- **NO escribir archivos binarios de planos en el sistema de archivos local (`fs`) en producción**: el entorno AWS Lambda es efímero; usar siempre `S3Service`.
