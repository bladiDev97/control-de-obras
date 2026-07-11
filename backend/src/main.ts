import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DynamoDBClient, DescribeTableCommand, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { json, urlencoded } from 'express';
import * as express from 'express';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function ensureTableExists() {
  // ...
  const endpoint = process.env.DYNAMO_ENDPOINT || process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';
  const tableName = process.env.DYNAMO_TABLE_NAME || process.env.DYNAMODB_TABLE_NAME || 'ControlDeObras';
  const region = process.env.DYNAMO_REGION || process.env.AWS_REGION || 'us-east-1';
  const accessKeyId = process.env.DYNAMO_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || 'local';
  const secretAccessKey = process.env.DYNAMO_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY || 'local';

  const client = new DynamoDBClient({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`✅ La tabla DynamoDB "${tableName}" ya existe.`);
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      console.log(`⏳ La tabla DynamoDB "${tableName}" no existe. Creándola de forma automática...`);
      try {
        await client.send(
          new CreateTableCommand({
            TableName: tableName,
            AttributeDefinitions: [
              { AttributeName: 'pk', AttributeType: 'S' },
              { AttributeName: 'sk', AttributeType: 'S' },
            ],
            KeySchema: [
              { AttributeName: 'pk', KeyType: 'HASH' },
              { AttributeName: 'sk', KeyType: 'RANGE' },
            ],
            GlobalSecondaryIndexes: [
              {
                IndexName: 'GSI1',
                KeySchema: [
                  { AttributeName: 'sk', KeyType: 'HASH' },
                  { AttributeName: 'pk', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' },
              },
            ],
            BillingMode: 'PAY_PER_REQUEST',
          }),
        );
        console.log(`🎉 Tabla DynamoDB "${tableName}" creada exitosamente.`);
      } catch (createError) {
        console.error(`❌ Error al crear la tabla DynamoDB de forma automática:`, createError);
      }
    } else {
      console.error(`❌ Error al conectar/verificar la tabla DynamoDB:`, error);
    }
  }
}

async function bootstrap() {
  // Asegurar que la tabla existe antes de levantar Nest
  await ensureTableExists();

  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir peticiones desde el frontend
  app.enableCors();

  // Servir archivos estáticos de la carpeta uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Aumentar el límite de tamaño de carga útil para importar archivos Excel pesados
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuración Swagger
  const config = new DocumentBuilder()
    .setTitle('Pigeon API')
    .setDescription('Documentación de la API de Pigeon BLADI')
    .setVersion('1.0')
    .addBearerAuth() // si usas JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      filter: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 App corriendo en http://localhost:${port}/api`);
}
bootstrap();

