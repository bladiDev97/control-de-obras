const { DynamoDBClient, ScanCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const fs = require('fs');
const path = require('path');

// Configure DynamoDB Client
const endpoint = process.env.DYNAMO_ENDPOINT || process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';
const tableName = process.env.DYNAMO_TABLE_NAME || process.env.DYNAMODB_TABLE_NAME || 'ControlDeObras';
const region = process.env.DYNAMO_REGION || process.env.AWS_REGION || 'us-east-1';

const client = new DynamoDBClient({
  region,
  endpoint,
  credentials: {
    accessKeyId: process.env.DYNAMO_ACCESS_KEY || 'local',
    secretAccessKey: process.env.DYNAMO_SECRET_KEY || 'local'
  }
});

async function updateObrasFromExcel() {
  console.log(`🚀 Iniciando actualización de Obras en DynamoDB (Tabla: ${tableName})...\n`);

  // Load extracted Excel data
  const jsonPath = path.join(__dirname, 'obras_excel_data.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ No se encontró el archivo de datos: ${jsonPath}`);
    return;
  }
  const excelRecords = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // 1. Obtain all Obras from DB
  const scanRes = await client.send(new ScanCommand({ TableName: tableName }));
  const dbObras = scanRes.Items.filter(item => item.sk?.S?.startsWith('obra#'));

  console.log(`📊 Obras en base de datos: ${dbObras.length}`);
  console.log(`📊 Registros en Excel: ${excelRecords.length}\n`);

  // Map DB items for fast lookup by obra number
  const allDbObras = dbObras.map(o => ({
    pk: o.pk.S,
    sk: o.sk.S,
    obra: (o.obra?.S || '').trim(),
    solicitudPo: (o.solicitudPo?.S || '').trim(),
    currentAt: o.at?.S || '',
    currentOficio: o.oficio?.S || ''
  }));

  let updatedCount = 0;
  let notFoundCount = 0;
  let unchangedCount = 0;

  const notFoundList = [];
  const updatedList = [];

  for (let i = 0; i < excelRecords.length; i++) {
    const rec = excelRecords[i];
    const exObra = rec.obra.trim();
    const exSol = rec.solicitud.trim();
    const newAt = rec.at.trim();
    const newOficio = rec.oficio.trim();

    // Matching logic
    let dbItem = allDbObras.find(d => d.obra === exObra);

    // Padding match (e.g. E033 -> E0033)
    if (!dbItem && exObra.startsWith('E')) {
      const numPart = exObra.slice(1);
      const padded4 = 'E' + numPart.padStart(4, '0');
      dbItem = allDbObras.find(d => d.obra === padded4);
    }

    // Solicitud match fallback
    if (!dbItem && exSol) {
      dbItem = allDbObras.find(d => {
        const solDigits = d.solicitudPo.replace(/\D/g, '');
        const skDigits = d.sk.replace(/\D/g, '');
        return (solDigits && parseInt(solDigits, 10) === parseInt(exSol, 10)) ||
               (skDigits && parseInt(skDigits, 10) === parseInt(exSol, 10));
      });
    }

    if (!dbItem) {
      notFoundCount++;
      notFoundList.push({ fila: i + 2, obra: exObra, solicitud: exSol, at: newAt, oficio: newOficio });
      continue;
    }

    // Check if values actually changed
    if (dbItem.currentAt === newAt && dbItem.currentOficio === newOficio) {
      unchangedCount++;
      continue;
    }

    // Update DynamoDB item
    const updateExpression = 'SET #at = :atVal, #oficio = :oficioVal';
    const expressionAttributeNames = {
      '#at': 'at',
      '#oficio': 'oficio'
    };
    const expressionAttributeValues = {
      ':atVal': { S: newAt },
      ':oficioVal': { S: newOficio }
    };

    await client.send(new UpdateItemCommand({
      TableName: tableName,
      Key: {
        pk: { S: dbItem.pk },
        sk: { S: dbItem.sk }
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }));

    updatedCount++;
    updatedList.push({
      obra: dbItem.obra,
      sk: dbItem.sk,
      at: newAt,
      oficio: newOficio
    });
  }

  console.log(`\n================ RESULTADOS ================`);
  console.log(`✅ Obras actualizadas exitosamente: ${updatedCount}`);
  console.log(`ℹ️  Obras sin cambios (ya tenían los valores correctos): ${unchangedCount}`);
  console.log(`⚠️  Obras no encontradas en DB: ${notFoundCount}`);
  console.log(`============================================\n`);

  if (updatedList.length > 0) {
    console.log('Muestra de obras actualizadas:');
    console.table(updatedList.slice(0, 10));
  }

  if (notFoundList.length > 0) {
    console.log('\nListado de obras del Excel no encontradas en DB:');
    console.table(notFoundList);
  }
}

updateObrasFromExcel().catch(err => {
  console.error('❌ Error al ejecutar actualización:', err);
});
