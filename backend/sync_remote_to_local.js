const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { marshall } = require('@aws-sdk/util-dynamodb');
const { execSync } = require('child_process');

const REMOTE_API_URL = process.env.REMOTE_API_URL || 'https://0jlijx0hc6.execute-api.us-east-1.amazonaws.com';
const DEFAULT_PK = 'YmxhZGkuUGlnZW9uU2F2ZUBnbWFpbC5jb20=';

async function fetchEntity(endpoint, entityName, getSk) {
  try {
    console.log(`📥 Descargando ${entityName} desde ${REMOTE_API_URL}${endpoint}...`);
    const response = await axios.get(`${REMOTE_API_URL}${endpoint}`);
    const rawData = response.data?.data || response.data || [];
    const list = Array.isArray(rawData) ? rawData : [rawData];

    const items = [];
    for (const item of list) {
      if (!item || typeof item !== 'object') continue;

      const obj = { ...item };
      obj.pk = obj.pk || DEFAULT_PK;
      
      const skVal = getSk(obj);
      if (!skVal) continue;

      const prefix = entityName.toLowerCase() + '#';
      obj.sk = String(skVal).startsWith(prefix) ? String(skVal) : `${prefix}${skVal}`;
      obj.__en = entityName;

      // Remove undefined values
      for (const k of Object.keys(obj)) {
        if (obj[k] === undefined) delete obj[k];
      }

      items.push(marshall(obj, { removeUndefinedValues: true }));
    }

    console.log(`✅ ${entityName}: ${items.length} registros procesados.`);
    return items;
  } catch (err) {
    console.error(`❌ Error descargando ${entityName} (${endpoint}):`, err.message);
    return [];
  }
}

async function main() {
  console.log(`🚀 Iniciando Sincronización Remota -> Local (API: ${REMOTE_API_URL})\n`);

  const obras = await fetchEntity('/obras', 'Obra', (o) => o.sk || o.solicitudPo || o.id);
  const contratos = await fetchEntity('/contratos', 'Contrato', (c) => c.sk || c.numeroContrato || c.id);
  const personal = await fetchEntity('/personal', 'Personal', (p) => p.sk || p.rpe || p.id);
  const zonas = await fetchEntity('/zonas', 'Zona', (z) => z.sk || z.id || z.nombreZona || 'PATZCUARO');

  const allItems = [...obras, ...contratos, ...personal, ...zonas];

  console.log(`\n📦 Total de registros recopilados: ${allItems.length}`);

  const seedFilePath = path.join(__dirname, 'seed_data.json');
  fs.writeFileSync(seedFilePath, JSON.stringify(allItems, null, 2), 'utf8');
  console.log(`💾 Guardado archivo local '${seedFilePath}' (${allItems.length} registros).`);

  console.log(`\n⚡ Poblando la base de datos local DynamoDB (seed_db.js)...`);
  execSync('node seed_db.js', { stdio: 'inherit', cwd: __dirname });
}

main().catch((err) => {
  console.error('❌ Error general en la sincronización:', err);
  process.exit(1);
});
