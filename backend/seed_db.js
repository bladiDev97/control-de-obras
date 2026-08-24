const { 
  DynamoDBClient, 
  CreateTableCommand, 
  DescribeTableCommand, 
  PutItemCommand 
} = require('@aws-sdk/client-dynamodb');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

let endpoint = process.env.DYNAMO_ENDPOINT || process.env.DYNAMODB_ENDPOINT;
if (process.env.NODE_ENV === 'production') {
  endpoint = undefined;
  if (process.env.AWS_ACCESS_KEY_ID === 'local' || process.env.AWS_ACCESS_KEY_ID === 'fake') {
    delete process.env.AWS_ACCESS_KEY_ID;
  }
  if (process.env.AWS_SECRET_ACCESS_KEY === 'local' || process.env.AWS_SECRET_ACCESS_KEY === 'fake') {
    delete process.env.AWS_SECRET_ACCESS_KEY;
  }
}
const tableName = process.env.DYNAMO_TABLE_NAME || process.env.DYNAMODB_TABLE_NAME || 'ControlDeObras';
const region = process.env.DYNAMO_REGION || process.env.AWS_REGION || 'us-east-1';

const clientConfig = { region };

// Solo incluir endpoint y credenciales dummy para DynamoDB Local
if (endpoint && endpoint.trim() !== '') {
  clientConfig.endpoint = endpoint;
  clientConfig.credentials = {
    accessKeyId: process.env.DYNAMO_ACCESS_KEY || 'local',
    secretAccessKey: process.env.DYNAMO_SECRET_KEY || 'local'
  };
}

const client = new DynamoDBClient(clientConfig);

async function ensureTableExists() {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`✅ La tabla DynamoDB "${tableName}" ya existe.`);
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') {
      console.log(`🔨 Creando la tabla DynamoDB "${tableName}"...`);
      await client.send(new CreateTableCommand({
        TableName: tableName,
        KeySchema: [
          { AttributeName: 'pk', KeyType: 'HASH' },
          { AttributeName: 'sk', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
          { AttributeName: 'pk', AttributeType: 'S' },
          { AttributeName: 'sk', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'GSI1',
            KeySchema: [
              { AttributeName: 'sk', KeyType: 'HASH' },
              { AttributeName: 'pk', KeyType: 'RANGE' }
            ],
            Projection: { ProjectionType: 'ALL' },
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
          }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }));
      console.log(`⏳ Esperando a que la tabla "${tableName}" esté en estado ACTIVE...`);
      let active = false;
      while (!active) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const describeRes = await client.send(new DescribeTableCommand({ TableName: tableName }));
        if (describeRes.Table && describeRes.Table.TableStatus === 'ACTIVE') {
          active = true;
        }
      }
      console.log(`✅ Tabla "${tableName}" creada y activa exitosamente.`);
    } else {
      throw err;
    }
  }
}

async function seedDatabase() {
  console.log(`🚀 Iniciando el proceso de Seed / Restauración en (${tableName})...\n`);

  await ensureTableExists();

  const seedFile = path.join(__dirname, 'seed_data.json');
  if (!fs.existsSync(seedFile)) {
    console.error(`❌ Archivo de seed no encontrado: ${seedFile}`);
    process.exit(1);
  }

  const items = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
  console.log(`📦 Insertando ${items.length} registros en la base de datos (${endpoint ? 'Desarrollo/Local' : 'Producción/AWS Cloud'})...`);

  let count = 0;
  for (const item of items) {
    await client.send(new PutItemCommand({
      TableName: tableName,
      Item: item
    }));
    count++;
    if (count % 25 === 0 || count === items.length) {
      console.log(`   Progreso: ${count}/${items.length} registros procesados.`);
    }
  }

  console.log(`\n🎉 Seed/Restauración completada exitosamente con ${count} registros en la tabla "${tableName}".`);
}

seedDatabase().catch(err => {
  console.error('❌ Error ejecutando el seed:', err);
  process.exit(1);
});
