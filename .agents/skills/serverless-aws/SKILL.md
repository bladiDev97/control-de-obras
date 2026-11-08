---
name: serverless-aws
description: Guía de despliegue con Serverless Framework v3, AWS Lambda (dist/lambda.handler), buckets S3, tareas cron en CloudWatch y variables de entorno.
---

# Skill: Serverless y Despliegue en AWS

## Cuándo se usa
Aplica al trabajar en la infraestructura como código en `backend/serverless.yml`, configuración del adaptador de AWS Lambda (`backend/src/lambda.ts`), buckets S3, eventos cron de ejecución periódica o políticas de permisos IAM.

## Reglas principales
1. **Punto de Entrada en Lambda**:
   - El handler serverless apunta a `dist/lambda.handler`.
   - Utiliza `@codegenie/serverless-express` para envolver la aplicación NestJS inicializada en frío (`bootstrapServer()`).
   - El bundle de producción debe compilarse previamente con `npm run build` en `backend/`.
2. **Eventos y Triggers**:
   - Peticiones HTTP a través de `httpApi: '*'`.
   - Tareas periódicas configuradas como eventos programados (ej: `schedule: rate(15 minutes)` para supervisión de obras o vencimientos).
3. **Manejo de Archivos e Inclusión/Exclusión de Empaquetado**:
   - Patrones definidos en `serverless.yml`:
     - Incluir: `dist/**`, `assets/**`.
     - Excluir: `src/**`, `test/**`, archivos de entorno locales (`.env*`).
4. **Permisos IAM (Principio de Mínimo Privilegio)**:
   - Acciones permitidas sobre DynamoDB: `Query`, `Scan`, `GetItem`, `PutItem`, `UpdateItem`, `DeleteItem`, `BatchWriteItem`, `DescribeTable` limitadas a la tabla `${self:provider.environment.DYNAMO_TABLE_NAME}` y sus índices `index/*`.
   - Acciones permitidas sobre S3: `PutObject`, `GetObject`, `PutObjectAcl`, `ListBucket` acotadas a `arn:aws:s3:::control-de-obras-*`.
5. **Zona Horaria y Entorno**:
   - Configurada explícitamente como `TZ: 'America/Mexico_City'` para consistencia en cálculos de fechas y generación de cron jobs.

## Patrones y ejemplos

### Configuración del Handler Lambda (`backend/src/lambda.ts`)
```typescript
import { configure as serverlessExpress } from '@codegenie/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let cachedServer: any;

export const handler = async (event: any, context: any, callback: any) => {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer(event, context, callback);
};
```

## Lo que NO hacer
- **NO desplegar sin compilar el proyecto (`npm run build`)**: Lambda necesita los archivos compilados en `dist/`.
- **NO confiar en el disco local `/tmp` para persistencia duradera**: `/tmp` es temporal y se destruye al reciclar la instancia de Lambda. Usar S3.
- **NO hardcodear credenciales en `serverless.yml`**: referenciar variables de entorno seguras `${env:VAR_NAME}` o parámetros de SSM.

