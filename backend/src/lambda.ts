import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serverlessExpress = require('@codegenie/serverless-express').default || require('@codegenie/serverless-express');
import { Callback, Context, Handler } from 'aws-lambda';
import { json, urlencoded } from 'express';
import * as express from 'express';
import { join } from 'path';
import { ObrasVencidasCron } from './notifications/cron/obras-vencidas.cron';

let server: Handler;
let nestApp: any;

async function bootstrap(): Promise<{ server: Handler; nestApp: any }> {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Static files
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Payload body limits
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  const serverHandler = serverlessExpress({ app: expressApp });
  return { server: serverHandler, nestApp: app };
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!server || !nestApp) {
    const res = await bootstrap();
    server = res.server;
    nestApp = res.nestApp;
  }

  // Detect AWS EventBridge Scheduled Event
  if (event.source === 'aws.events' || event['detail-type'] === 'Scheduled Event') {
    console.log('[Lambda Handler] EventBridge Scheduled Event detected. Executing ObrasVencidasCron...');
    try {
      const cron = nestApp.get(ObrasVencidasCron);
      if (cron) {
        await cron.handleCron();
        console.log('[Lambda Handler] ObrasVencidasCron executed successfully.');
      }
    } catch (err: any) {
      console.error('[Lambda Handler] Error executing ObrasVencidasCron:', err);
    }
    return { statusCode: 200, body: JSON.stringify({ message: 'Scheduled event processed' }) };
  }

  return server(event, context, callback);
};
