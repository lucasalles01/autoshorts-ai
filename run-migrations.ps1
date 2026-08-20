# Script para rodar migrations do Prisma no Supabase

# Execute este script no PowerShell na pasta backend

cd C:\Users\lukas\.gemini\antigravity\scratch\autoshorts-ai\backend

# Configurar DATABASE_URL
$env:DATABASE_URL = "postgresql://postgres.rsmfccivskwwfbazqxdg:Jamaicanos157%40@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

# Instalar dependências
Write-Host "Instalando dependências..." -ForegroundColor Yellow
npm install

# Gerar Prisma Client
Write-Host "Gerando Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# Rodar migrations (push schema)
Write-Host "Enviando schema para Supabase..." -ForegroundColor Yellow
npx prisma db push

Write-Host "Migrations concluídas com sucesso!" -ForegroundColor Green
