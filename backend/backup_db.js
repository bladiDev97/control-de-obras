const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const endpoint = process.env.DYNAMO_ENDPOINT || process.env.DYNAMODB_ENDPOINT;
const tableName = process.env.DYNAMO_TABLE_NAME || process.env.DYNAMODB_TABLE_NAME || 'ControlDeObras';
const region = process.env.DYNAMO_REGION || process.env.AWS_REGION || 'us-east-1';

const clientConfig = {
  region,
  credentials: {
    accessKeyId: process.env.DYNAMO_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: process.env.DYNAMO_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY || 'local'
  }
};

// Solo incluir endpoint si está definido (para DynamoDB Local)
if (endpoint && endpoint.trim() !== '') {
  clientConfig.endpoint = endpoint;
}

const client = new DynamoDBClient(clientConfig);

async function backupDatabase() {
  console.log(`🚀 Iniciando respaldo (Backup) de la base de datos "${tableName}"...\n`);

  let lastEvaluatedKey = undefined;
  const allItems = [];

  do {
    const scanCommand = new ScanCommand({
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey
    });

    const res = await client.send(scanCommand);
    if (res.Items) {
      allItems.push(...res.Items);
    }
    lastEvaluatedKey = res.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  // 1. Guardar en seed_data.json (para usar como seed principal)
  const seedPath = path.join(__dirname, 'seed_data.json');
  fs.writeFileSync(seedPath, JSON.stringify(allItems, null, 2), 'utf8');

  // 2. Guardar también una copia con marca de tiempo en la carpeta backups/
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const timestampPath = path.join(backupDir, `backup_${tableName}_${timestamp}.json`);
  fs.writeFileSync(timestampPath, JSON.stringify(allItems, null, 2), 'utf8');

  console.log(`✅ Respaldo completado exitosamente!`);
  console.log(`📦 Total de registros exportados: ${allItems.length}`);
  console.log(`📁 Guardado en Seed Principal: ${seedPath}`);
  console.log(`📁 Guardado copia con timestamp: ${timestampPath}`);
}

backupDatabase().catch(err => {
  console.error('❌ Error al realizar respaldo:', err);
  process.exit(1);
});
