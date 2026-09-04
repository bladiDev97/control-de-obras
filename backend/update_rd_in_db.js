const {
  DynamoDBClient,
  ScanCommand,
  UpdateItemCommand
} = require('@aws-sdk/client-dynamodb');
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');
const dotenv = require('dotenv');

const isAws = process.argv.includes('--aws') || process.env.TARGET_ENV === 'aws';

if (isAws) {
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_SECRET_ACCESS_KEY;
  delete process.env.DYNAMO_ACCESS_KEY;
  delete process.env.DYNAMO_SECRET_KEY;
  delete process.env.DYNAMO_ENDPOINT;
  delete process.env.DYNAMODB_ENDPOINT;
}

const tableName = process.env.DYNAMO_TABLE_NAME || process.env.DYNAMODB_TABLE_NAME || 'ControlDeObras';
const region = process.env.DYNAMO_REGION || process.env.AWS_REGION || 'us-east-1';

const clientConfig = { region };
if (!isAws) {
  const endpoint = process.env.DYNAMO_ENDPOINT || process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';
  if (endpoint && endpoint.trim() !== '') {
    clientConfig.endpoint = endpoint;
    clientConfig.credentials = {
      accessKeyId: process.env.DYNAMO_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || 'local',
      secretAccessKey: process.env.DYNAMO_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY || 'local'
    };
  }
}

const client = new DynamoDBClient(clientConfig);

async function runUpdateQuery() {
  console.log(`🚀 Ejecutando script de actualización de RD en DynamoDB (${tableName} @ ${isAws ? 'AWS Cloud' : (clientConfig.endpoint || 'Local')})...\n`);

  let lastEvaluatedKey;
  let totalScanned = 0;
  let totalUpdated = 0;

  do {
    const scanCommand = new ScanCommand({
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const response = await client.send(scanCommand);
    const items = (response.Items || []).map(item => unmarshall(item));
    totalScanned += items.length;

    for (const obra of items) {
      if (!obra.sk || !obra.sk.startsWith('obra#')) continue;

      const cleanPoblacion = (obra.poblacion || '').replace(/\s*municipio\s+de\s+.*$/i, '').trim();
      const cleanRd = (obra.rd || '').replace(/\s*municipio\s+de\s+.*$/i, '').trim();
      const poblacionToUse = cleanPoblacion || cleanRd;
      const nombre = (obra.nombreSolicitante || '').trim();

      const desiredRd = [poblacionToUse, nombre].filter(Boolean).join(' ') || cleanRd || obra.rd || '';

      const needsRdUpdate = desiredRd && obra.rd !== desiredRd;
      const needsPoblacionUpdate = obra.poblacion && obra.poblacion !== cleanPoblacion;

      if (needsRdUpdate || needsPoblacionUpdate) {
        const updateCmd = new UpdateItemCommand({
          TableName: tableName,
          Key: marshall({ pk: obra.pk, sk: obra.sk }),
          UpdateExpression: 'SET #rd = :rdVal, #poblacion = :pobVal',
          ExpressionAttributeNames: {
            '#rd': 'rd',
            '#poblacion': 'poblacion',
          },
          ExpressionAttributeValues: marshall({
            ':rdVal': desiredRd,
            ':pobVal': cleanPoblacion || obra.poblacion || '',
          }),
        });

        await client.send(updateCmd);
        totalUpdated++;
        console.log(`  [UPDATED] ${obra.sk}: rd='${obra.rd}' -> '${desiredRd}'`);
      }
    }

    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  console.log(`\n✅ Proceso completado. Escaneados: ${totalScanned} registros | Actualizados: ${totalUpdated} registros.`);
}

runUpdateQuery().catch(err => {
  console.error('❌ Error en script de actualización de RD:', err);
  process.exit(1);
});
