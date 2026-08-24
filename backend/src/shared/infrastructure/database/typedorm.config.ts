//Dependencies
import * as dotenv from 'dotenv';
import { getEnv } from 'src/shared/utils/env';
import { createConnection } from '@typedorm/core';
import { Table, INDEX_TYPE } from '@typedorm/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DocumentClientV3 } from '@typedorm/document-client';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

//Entities
import { UserEntity } from 'src/auth/infrastructure/entities/user.entity';
import { ObraEntity } from 'src/obras/infrastructure/entities/obra.entity';
import { ContratoEntity } from 'src/contratos/infrastructure/entities/contrato.entity';
import { AsignacionEntity } from 'src/contratos/infrastructure/entities/asignacion.entity';
import { EstimacionEntity } from 'src/contratos/infrastructure/entities/estimacion.entity';
import { PersonalEntity } from 'src/personal/infrastructure/entities/personal.entity';
import { ConfigEntity } from 'src/shared/infrastructure/entities/config.entity';
import { AreaEntity } from 'src/shared/infrastructure/entities/area.entity';

import { ZonaEntity } from 'src/zonas/infrastructure/entities/zona.entity';

// Cargar variables de entorno
dotenv.config(); // Cargar .env por defecto
dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
});

let endpoint = process.env.DYNAMO_ENDPOINT || process.env.DYNAMODB_ENDPOINT;

// Si estamos en producción o AWS Lambda, ignorar endpoint de localhost
if (process.env.NODE_ENV === 'production' || process.env.AWS_EXECUTION_ENV) {
  if (endpoint && (endpoint.includes('localhost') || endpoint.includes('127.0.0.1'))) {
    endpoint = undefined;
  }
}
const tableName = process.env.DYNAMO_TABLE_NAME || process.env.DYNAMODB_TABLE_NAME || 'ControlDeObras';
const region = process.env.DYNAMO_REGION || process.env.AWS_REGION || 'us-east-1';

const clientConfig: any = { region };
// Solo incluir endpoint y credenciales dummy para DynamoDB Local
if (endpoint && endpoint.trim() !== '') {
  clientConfig.endpoint = endpoint;
  clientConfig.credentials = {
    accessKeyId: process.env.DYNAMO_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: process.env.DYNAMO_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY || 'local',
  };
}

// Cliente base para SDK v3
const baseClient = new DynamoDBClient(clientConfig);

// Cliente de documentos para TypeDORM (forma oficial y correcta)
const documentClient = new DocumentClientV3(
  DynamoDBDocumentClient.from(baseClient, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  }),
);

// Conexión a TypeDORM
export const connection = createConnection({
  table: new Table({
    name: tableName,
    partitionKey: 'pk',
    sortKey: 'sk',
    indexes: {
      GSI1: {
        type: INDEX_TYPE.GSI,
        partitionKey: 'sk',
        sortKey: 'pk',
      },
    },
  }),
  entities: [UserEntity, ObraEntity, ContratoEntity, AsignacionEntity, EstimacionEntity, PersonalEntity, ConfigEntity, AreaEntity, ZonaEntity],
  documentClient,
});

