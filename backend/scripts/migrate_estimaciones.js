const { DynamoDBClient, ScanCommand, UpdateItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });

async function run() {
  console.log('1. Escaneando la tabla ControlDeObras...');
  let items = [];
  let lastEvaluatedKey;
  do {
    const res = await client.send(new ScanCommand({
      TableName: 'ControlDeObras',
      ExclusiveStartKey: lastEvaluatedKey
    }));
    items.push(...res.Items.map(i => unmarshall(i)));
    lastEvaluatedKey = res.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  const estimaciones = items.filter(i => i.__en === 'Estimacion' || (i.sk && i.sk.startsWith('estimacion#')));
  const obras = items.filter(i => i.__en === 'Obra');

  console.log('Total estimaciones encontradas:', estimaciones.length);
  console.log('Total obras encontradas:', obras.length);

  const obraByAt = new Map(obras.map(o => [(o.at || '').trim().toUpperCase(), o]));
  const obraByObra = new Map(obras.map(o => [(o.obra || '').trim().toUpperCase(), o]));

  let matched = 0;
  let unMatched = [];
  const estByObra = new Map();

  for (const e of estimaciones) {
    const atKey = (e.at || '').trim().toUpperCase();
    const obraKey = (e.obra || '').trim().toUpperCase();
    const match = obraByAt.get(atKey) || obraByObra.get(obraKey);

    if (match) {
      matched++;
      if (!estByObra.has(match.sk)) {
        estByObra.set(match.sk, { obra: match, estimaciones: [] });
      }
      estByObra.get(match.sk).estimaciones.push({
        id: (e.at || match.at || '') + '#' + (e.numeroEstimacion || ''),
        numeroEstimacion: e.numeroEstimacion || '',
        numeroContrato: e.numeroContrato || match.contrato || '',
        at: e.at || match.at || '',
        obra: e.obra || match.obra || '',
        conceptos: e.conceptos || {},
        compSind: typeof e.compSind === 'number' ? e.compSind : 0,
        retenerIva: Boolean(e.retenerIva),
        avanceMvmo: e.avanceMvmo || '',
        bitacoraSupervision: e.bitacoraSupervision || '',
        bitacoraAutorizacion: e.bitacoraAutorizacion || ''
      });
    } else {
      unMatched.push(e);
    }
  }

  console.log('Estimaciones que coinciden con una Obra:', matched);
  console.log('Estimaciones sin coincidencia:', unMatched.length);

  if (unMatched.length > 0) {
    console.error('ERROR: Hay estimaciones sin obra maestra. Abortando.');
    return;
  }

  console.log('2. Guardando estimaciones consolidadas en las obras maestras...');
  let updatedObras = 0;
  for (const [sk, { obra, estimaciones: estList }] of estByObra.entries()) {
    // Ordenar estimaciones por numeroEstimacion
    estList.sort((a, b) => {
      const numA = parseInt(a.numeroEstimacion, 10) || 0;
      const numB = parseInt(b.numeroEstimacion, 10) || 0;
      return numA - numB;
    });

    const marshalledEst = marshall(estList);

    await client.send(new UpdateItemCommand({
      TableName: 'ControlDeObras',
      Key: {
        pk: { S: obra.pk },
        sk: { S: obra.sk }
      },
      UpdateExpression: 'SET #estimaciones = :estimaciones',
      ExpressionAttributeNames: {
        '#estimaciones': 'estimaciones'
      },
      ExpressionAttributeValues: {
        ':estimaciones': { L: marshalledEst }
      }
    }));
    updatedObras++;
  }
  console.log('✅ ' + updatedObras + ' obras actualizadas con sus estimaciones integradas.');

  console.log('3. Eliminando los 96 registros redundantes estimacion#...');
  let deleted = 0;
  for (const e of estimaciones) {
    await client.send(new DeleteItemCommand({
      TableName: 'ControlDeObras',
      Key: {
        pk: { S: e.pk },
        sk: { S: e.sk }
      }
    }));
    deleted++;
  }
  console.log('✅ ' + deleted + ' registros de estimacion# eliminados con éxito de DynamoDB.');
}

run().catch(console.error);
