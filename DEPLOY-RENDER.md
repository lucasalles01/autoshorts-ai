# Deploy do Backend no Render - AutoShorts AI

## ✅ Status Atual

- ✅ Repositório GitHub criado: https://github.com/lucasalles01/autoshorts-ai
- ✅ Prisma schema atualizado para PostgreSQL
- ✅ DATABASE_URL do Supabase: `postgresql://postgres.rsmfccivskwwfbazqxdg:Jamaicanos157%40@aws-0-us-west-2.pooler.supabase.com:6543/postgres`
- ✅ Supabase URL: https://rsmfccivskwwfbazqxdg.supabase.co

## 🚀 Passo 1: Rodar Migrations no Supabase

### Opção A: Via Supabase Dashboard (Recomendado)

1. Acesse https://supabase.com/dashboard/project/rsmfccivskwwfbazqxdg
2. Vá em "SQL Editor"
3. Clique em "New Query"
4. Cole o schema Prisma (de `backend/prisma/schema.prisma`)
5. Ou execute: `npx prisma db push` localmente com o script `run-migrations.ps1`

### Opção B: Via Terminal Local

Execute o script:

```powershell
cd C:\Users\lukas\.gemini\antigravity\scratch\autoshorts-ai
powershell -ExecutionPolicy Bypass -File .\run-migrations.ps1
```

## 🚀 Passo 2: Deploy no Render

1. Acesse https://dashboard.render.com
2. Clique em "New" → "Web Service"
3. Conecte seu GitHub
4. Selecione o repositório `lucasalles01/autoshorts-ai`
5. Configuração:

```
Name: autosharts-backend
Root Directory: backend
Region: Oregon (US West)
Instance Type: Free
```

6. Build & Deploy:

```
Build Command: npm install && npm run build
Start Command: node dist/server.js
```

7. Environment Variables (CRUCIAL):

```
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://postgres.rsmfccivskwwfbazqxdg:Jamaicanos157%40@aws-0-us-west-2.pooler.supabase.com:6543/postgres
JWT_SECRET=gerar-um-aleatorio-32-caracteres-minimo
ENCRYPTION_KEY=gerar-um-aleatorio-32-hex-chars-minimo
PUBLIC_BASE_URL=https://autosharts-backend.onrender.com
```

8. Clique em "Create Web Service"
9. Aguarde o deploy (5-10 minutos)

## 🔐 Gerar Secrets

Para JWT_SECRET e ENCRYPTION_KEY, gere strings aleatórias:

**JWT_SECRET (32+ caracteres):**
```
Gerar em: https://www.uuidgenerator.net/
Ou: openssl rand -base64 32
```

**ENCRYPTION_KEY (32 hex chars):**
```
Gerar em: https://www.random.org/strings/
Ou: openssl rand -hex 16
```

## 🌐 URL do Backend

Após o deploy, a URL será algo como:
```
https://autosharts-backend.onrender.com
```

## ✅ Verificação

Teste o backend:
```bash
curl https://autosharts-backend.onrender.com/api/analytics
```

Ou acesse no navegador:
```
https://autosharts-backend.onrender.com/api/analytics
```

## 📝 Checklist Render

- [ ] Repositório conectado
- [ ] Root Directory: backend
- [ ] Build Command configurado
- [ ] Start Command configurado
- [ ] DATABASE_URL configurada
- [ ] JWT_SECRET gerado e configurado
- [ ] ENCRYPTION_KEY gerado e configurado
- [ ] PUBLIC_BASE_URL configurado
- [ ] Deploy concluído
- [ ] Backend acessível

## 🔄 Próximo Passo

Após o backend estar rodando, vamos fazer o deploy do frontend na Vercel.

O backend URL será usado no `PUBLIC_BASE_URL` e no frontend.
