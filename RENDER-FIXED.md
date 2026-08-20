# Render Deployment - Fixed Configuration

## ✅ Correções Realizadas

### 1. Build Script (backend/package.json)
**Problema:** O script `build` não incluía `prisma generate`
**Solução:** Alterado para `"build": "prisma generate && tsc"`

### 2. Prisma como Dependência
**Problema:** Prisma estava em devDependencies
**Solução:** Movido para dependencies (necessário em produção)

### 3. render.yaml na Raiz
**Problema:** Render não encontrava o schema Prisma
**Solução:** Criado `render.yaml` na raiz com `rootDir: backend`

### 4. DATABASE_URL Configurada
**Solução:** Adicionada a DATABASE_URL do Supabase no render.yaml

## 🚀 Configuração do Render

### Opção A: Usar render.yaml (Automático)

1. No Render Dashboard, crie um "New Web Service"
2. Conecte o GitHub
3. Selecione o repositório `lucasalles01/autosharts-ai`
4. O Render detectará automaticamente o `render.yaml`
5. Clique em "Create Web Service"

### Opção B: Configuração Manual

Se o render.yaml não for detectado, configure manualmente:

**Name:** autosharts-backend
**Root Directory:** backend
**Build Command:** `npm install && npm run build`
**Start Command:** `node dist/server.js`

**Environment Variables:**
```
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://postgres.rsmfccivskwwfbazqxdg:Jamaicanos157%40@aws-0-us-west-2.pooler.supabase.com:6543/postgres
JWT_SECRET=gerar-um-aleatorio-32-caracteres
ENCRYPTION_KEY=gerar-um-aleatorio-32-hex-chars
PUBLIC_BASE_URL=https://autosharts-backend.onrender.com
```

## 🔐 Gerar Secrets

### JWT_SECRET (32+ caracteres)
```bash
# Opção 1: Online
https://www.uuidgenerator.net/

# Opção 2: OpenSSL (se tiver)
openssl rand -base64 32

# Exemplo:
abc123def456ghi789jkl012mno345pqr
```

### ENCRYPTION_KEY (32 hex chars)
```bash
# Opção 1: Online
https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new

# Opção 2: OpenSSL (se tiver)
openssl rand -hex 16

# Exemplo:
1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d
```

## 📋 Estrutura do Projeto

```
autosharts-ai/
├── render.yaml (na raiz - aponta para backend)
├── backend/
│   ├── package.json (com prisma em dependencies)
│   ├── prisma/
│   │   └── schema.prisma (PostgreSQL)
│   ├── src/
│   │   └── server.ts
│   └── dist/ (gerado pelo build)
└── frontend/
```

## ✅ Verificação

Após o deploy, teste:

```bash
curl https://autosharts-backend.onrender.com/api/analytics
```

Ou acesse no navegador:
```
https://autosharts-backend.onrender.com/api/analytics
```

## 🐛 Troubleshooting

### Erro: "Could not find Prisma Schema"
**Solução:** Verifique se `rootDir: backend` está no render.yaml

### Erro: "Missing script: build"
**Solução:** Verifique se `build: "prisma generate && tsc"` está no package.json

### Erro: "prisma not found"
**Solução:** Verifique se `prisma` está em dependencies (não devDependencies)

### Erro: "Database connection failed"
**Solução:** Verifique se DATABASE_URL está correta e o Supabase está acessível

## 🔄 Re-deploy

Se fizer alterações, o Render fará re-deploy automático ao detectar novos commits.

Para forçar re-deploy manual:
1. Vá no Dashboard do Render
2. Clique em "Manual Deploy"
3. Clique em "Deploy latest commit"

## 📝 Checklist

- [ ] render.yaml criado na raiz
- [ ] package.json atualizado com prisma em dependencies
- [ ] build script inclui prisma generate
- [ ] DATABASE_URL configurada
- [ ] JWT_SECRET gerado
- [ ] ENCRYPTION_KEY gerado
- [ ] PUBLIC_BASE_URL configurado
- [ ] Deploy concluído
- [ ] Backend acessível

## 🎯 Próximo Passo

Após o backend estar rodando, faremos o deploy do frontend na Vercel.

A URL do backend será usada no `PUBLIC_BASE_URL` e no frontend.
