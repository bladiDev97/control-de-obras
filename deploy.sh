#!/usr/bin/env bash
set -e

echo "=========================================="
echo "🚀 INICIANDO DESPLIEGUE EN AWS"
echo "=========================================="

# 1. Verificar credenciales AWS
echo "🔍 1. Verificando credenciales de AWS..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ ERROR: No se detectaron credenciales válidas de AWS."
    echo "Por favor ejecuta 'aws configure' o exporta las variables:"
    echo "  export AWS_ACCESS_KEY_ID=tu_access_key"
    echo "  export AWS_SECRET_ACCESS_KEY=tu_secret_key"
    echo "  export AWS_DEFAULT_REGION=us-east-1"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=${AWS_DEFAULT_REGION:-us-east-1}
echo "✅ Conectado a AWS Cuenta: $ACCOUNT_ID en región: $REGION"

# 2. Compilar y Desplegar Backend NestJS (Lambda + API Gateway)
echo ""
echo "📦 2. Compilando Backend NestJS..."
cd backend
npm run build

echo "⚡ Desplegando Backend con Serverless Framework en AWS Lambda..."
DEPLOY_OUTPUT=$(npx serverless@3 deploy --stage prod)
echo "$DEPLOY_OUTPUT"

# Extraer URL del HTTP API Endpoint
API_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^ ]*\.amazonaws\.com[^ ]*' | head -n 1)

if [ -z "$API_URL" ]; then
    echo "⚠️ ADVERTENCIA: No se pudo extraer automáticamente la URL de API Gateway del output."
    echo "Por favor verifica la consola de AWS o el output arriba."
else
    echo "✅ Backend desplegado exitosamente!"
    echo "🔗 API Gateway URL: $API_URL"
fi

cd ..

# 3. Base de Datos DynamoDB Cloud (Preservar datos vivos de producción)
echo ""
echo "🗄️ 3. Base de datos AWS DynamoDB (Tabla: ControlDeObras) activa. Preservando datos de producción..."

# 4. Configurar y Compilar Frontend React
echo ""
echo "🎨 4. Configurando y Compilando Frontend SPA..."
if [ -n "$API_URL" ]; then
    echo "VITE_API_URL=$API_URL" > frontend/.env.production
    echo "📄 Creado frontend/.env.production con VITE_API_URL=$API_URL"
fi

cd frontend
npm run build
cd ..

# 5. Desplegar Frontend SPA a AWS S3 Bucket
echo ""
echo "🌐 5. Desplegando Frontend SPA a AWS S3 Website..."
BUCKET_NAME="control-de-obras-frontend-$ACCOUNT_ID"
aws s3 sync frontend/dist/ "s3://$BUCKET_NAME/"

FRONTEND_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo ""
echo "=========================================="
echo "🎉 ¡DESPLIEGUE EN AWS COMPLETADO CON ÉXITO!"
echo "=========================================="
echo "1. Frontend Web App: $FRONTEND_URL"
echo "2. Backend API Gateway: $API_URL"
echo "3. Base de datos DynamoDB Cloud: ControlDeObras ($REGION)"
echo "=========================================="
