# Frontend Deploy Guide - Vercel

## ✅ Frontend Configurado para Vercel

### 1. **Configurações Realizadas**

**frontend/src/api/client.ts:**
- ✅ Atualizado para usar `VITE_BACKEND_URL` environment variable
- ✅ Backend URL padrão: `https://autoshorts-backend-v2.onrender.com`
- ✅ API calls agora usam o backend do Render

**frontend/vercel.json:**
- ✅ Configurado `VITE_BACKEND_URL` com URL do Render
- ✅ Security headers adicionados
- ✅ Build command configurado

**backend/src/server.ts:**
- ✅ CORS configurado para aceitar domínios da Vercel
- ✅ Adicionado `https://autoshorts-ai.vercel.app`
- ✅ Adicionado `https://*.vercel.app` para flexibilidade

### 2. **Deploy na Vercel**

#### Passo 1: Conectar Repositório

1. Acesse https://vercel.com
2. Clique em "Add New Project"
3. Conecte sua conta do GitHub
4. Selecione o repositório `lucasalles01/autosharts-ai`

#### Passo 2: Configurar Deploy

**Framework Preset:** Vite

**Root Directory:** `frontend`

**Environment Variables:**
```
VITE_BACKEND_URL = https://autoshorts-backend-v2.onrender.com
```

**Build Command:** `npm run build`

**Output Directory:** `dist`

#### Passo 3: Deploy

1. Clique em "Deploy"
2. Aguarde o build (deve levar ~1-2 minutos)
3. Após sucesso, você receberá uma URL como:
   - `https://autoshorts-ai.vercel.app`
   - ou `https://autoshorts-ai-[hash].vercel.app`

### 3. **Após Deploy**

#### Atualizar CORS no Backend (se necessário)

Se a URL da Vercel for diferente de `autoshorts-ai.vercel.app`:

1. Adicione a URL real em `backend/src/server.ts`:
```typescript
const allowedOrigins = [
  // ... existing origins
  'https://sua-url-real.vercel.app' // Adicione aqui
].filter(Boolean);
```

2. Commit e push para atualizar o backend

#### Testar Integração

1. Acesse o frontend na Vercel
2. Teste endpoints do backend:
   - Health check
   - Upload de vídeos
   - Processamento
   - OAuth

### 4. **Variáveis de Ambiente da Vercel**

O `vercel.json` já configura automaticamente:
```json
{
  "env": {
    "VITE_BACKEND_URL": {
      "value": "https://autoshorts-backend-v2.onrender.com"
    }
  }
}
```

### 5. **Domínio Personalizado (Opcional)**

Se quiser usar um domínio personalizado:

1. Vercel Dashboard → Project → Settings → Domains
2. Adicione seu domínio
3. Configure DNS (CNAME ou A record)
4. Atualize CORS no backend com o novo domínio

## 🎯 Arquitetura Final

```
Frontend (Vercel)
    ↓ HTTPS
Backend (Render)
    ↓
Database (Supabase)
```

## 📋 Checklist

- ✅ Frontend configurado para Vercel
- ✅ Backend URL configurada
- ✅ CORS configurado para Vercel
- ✅ Code pushado para GitHub
- ⏳ Deploy na Vercel
- ⏳ Testar integração
- ⏳ Configurar domínio (opcional)

## 🚀 Próximo Passo

Agora faça o deploy na Vercel seguindo os passos acima!

Após o deploy, me avise a URL da Vercel para podermos testar a integração completa. 🎉
