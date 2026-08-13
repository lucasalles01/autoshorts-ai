# Guia Completo de Deploy em Produção

Este guia mostra como publicar o AutoShorts AI em produção com HTTPS, banco de dados online e OAuth2 real.

## 🏗️ Arquitetura de Produção

```
Frontend (Vercel)      Backend (Render)        Database (Supabase)
https://dominio.vercel.app  →  https://backend.onrender.com  →  PostgreSQL
         ↓                           ↓                         ↓
    React/Vite                Node.js/Fastify            Supabase/Render Postgres
```

## 📋 Pré-requisitos

1. **GitHub Account** - Para hospedar o código
2. **Vercel Account** - Para frontend (grátis)
3. **Render Account** - Para backend (grátis)
4. **Supabase Account** - Para banco de dados (grátis)
5. **Domínio (opcional)** - Seu próprio domínio

## 🚀 Passo 1: Configurar Banco de Dados (Supabase)

### 1.1 Criar Projeto Supabase

1. Acesse [https://supabase.com](https://supabase.com/)
2. Crie uma conta gratuita
3. Clique em "New Project"
4. Nome: `autoshorts-prod`
5. Senha do banco: (guarde com segurança)
6. Região: Escolha a mais próxima do seu público
7. Clique em "Create new project"

### 1.2 Obter Connection String

1. No projeto Supabase, vá em "Settings" → "Database"
2. Copie a "Connection String" (URI)
3. Deve ser algo como:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
   ```

### 1.3 Criar Tabelas

No Supabase SQL Editor, execute:

```sql
-- Rodar o schema do Prisma
-- O Prisma vai criar as tabelas automaticamente no primeiro deploy
```

## 🚀 Passo 2: Publicar Backend no Render

### 2.1 Preparar Repositório no GitHub

1. Crie um repositório no GitHub
2. Nome: `autoshorts-ai`
3. Clone localmente:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/autoshorts-ai.git
   git push -u origin main
   ```

### 2.2 Conectar GitHub ao Render

1. Acesse [https://render.com](https://render.com/)
2. Crie uma conta gratuita
3. Clique em "New" → "Web Service"
4. Conecte seu GitHub
5. Selecione o repositório `autoshorts-ai`
6. Configuração:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server.js`
   - **Instance Type**: Free

### 2.3 Configurar Environment Variables no Render

No Render, adicione estas variáveis de ambiente:

```
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
JWT_SECRET=seu-jwt-secret-32bytes
ENCRYPTION_KEY=sua-chave-32-hex-chars
PUBLIC_BASE_URL=https://seu-backend.onrender.com
```

### 2.4 Adicionar Credenciais OAuth2 (depois de obter)

```
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
TIKTOK_CLIENT_KEY=seu_tiktok_app_key
TIKTOK_CLIENT_SECRET=seu_tiktok_app_secret
INSTAGRAM_APP_ID=seu_instagram_app_id
INSTAGRAM_APP_SECRET=seu_instagram_app_secret
```

### 2.5 Deploy

Clique em "Create Web Service" e aguarde o deploy.

**URL do Backend será algo como**: `https://autoshorts-backend.onrender.com`

## 🚀 Passo 3: Publicar Frontend na Vercel

### 3.1 Conectar GitHub ao Vercel

1. Acesse [https://vercel.com](https://vercel.com/)
2. Crie uma conta gratuita
3. Clique em "Add New" → "Project"
4. Conecte seu GitHub
5. Selecione o repositório `autoshorts-ai`
6. Configuração:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.2 Configurar Environment Variables na Vercel

Adicione:

```
VITE_BASE_URL=https://seu-dominio.vercel.app
```

### 3.3 Configurar CORS no Backend

No `backend/src/server.ts`, atualize o CORS:

```typescript
await fastify.register(cors, {
  origin: [
    'http://localhost:3000',
    'https://seu-dominio.vercel.app'
  ],
  credentials: true
});
```

### 3.4 Deploy

Clique em "Deploy" e aguarde.

**URL do Frontend será algo como**: `https://autoshorts-ai.vercel.app`

## 🔧 Passo 4: Configurar Redirect URIs para OAuth2

### URLs de Callback de Produção

Após o deploy, você terá URLs como:

**Backend**: `https://autosharts-backend.onrender.com`
**Frontend**: `https://autosharts-ai.vercel.app`

### 4.1 TikTok for Developers

Configure estas redirect URIs:

```
https://autosharts-ai.vercel.app/oauth/callback
```

### 4.2 Google Cloud Console

Configure estas redirect URIs:

```
https://autosharts-ai.vercel.app/oauth/callback
```

### 4.3 Meta for Developers (Instagram)

Configure estas redirect URIs:

```
https://autosharts-ai.vercel.app/oauth/callback
```

## 🔒 Passo 5: Atualizar Variáveis de Produção

### 5.1 Atualizar Backend

No Render, atualize `PUBLIC_BASE_URL`:

```
PUBLIC_BASE_URL=https://autosharts-backend.onrender.com
```

### 5.2 Atualizar Frontend

Na Vercel, atualize `VITE_BASE_URL`:

```
VITE_BASE_URL=https://autosharts-ai.vercel.app
```

### 5.3 Re-deploy

Re-deploy ambos (backend e frontend) para aplicar as mudanças.

## 📊 Passo 6: Rodar Migrations do Banco de Dados

### 6.1 Via Supabase

1. No Supabase, vá em "SQL Editor"
2. Execute o schema do Prisma

### 6.2 Via SSH no Render (opcional)

```bash
npx prisma db push
```

## ✅ Verificação

### Testar Backend

```bash
curl https://autosharts-backend.onrender.com/api/analytics
```

### Testar Frontend

Acesse: `https://autosharts-ai.vercel.app`

### Testar OAuth2

1. Vá em "Minhas Contas"
2. Clique em "Adicionar Conta"
3. Teste TikTok, YouTube ou Instagram

## 📝 Checklist de Deploy

- [ ] Banco de dados Supabase criado
- [ ] Connection string obtida
- [ ] Repositório no GitHub criado
- [ ] Backend publicado no Render
- [ ] Environment variables do backend configuradas
- [ ] Frontend publicado na Vercel
- [ ] Environment variables do frontend configuradas
- [ ] CORS configurado no backend
- [ ] Redirect URIs configuradas nos painéis OAuth2
- [ ] Credenciais OAuth2 adicionadas no Render
- [ ] Migrations do banco de dados rodadas
- [ ] Teste completo realizado

## 🔗 URLs de Callback de Produção

Após o deploy, use estas URLs:

**TikTok**:
```
https://SEU-FRONTEND.vercel.app/oauth/callback
```

**Google/YouTube**:
```
https://SEU-FRONTEND.vercel.app/oauth/callback
```

**Meta/Instagram**:
```
https://SEU-FRONTEND.vercel.app/oauth/callback
```

## 💡 Dicas de Produção

1. **Monitoramento**: Use os dashboards do Render e Vercel
2. **Logs**: Verifique os logs para erros
3. **Backups**: Supabase faz backups automáticos
4. **HTTPS**: Vercel e Render fornecem HTTPS automático
5. **Domínio**: Configure seu domínio personalizado se quiser
6. **Cron Jobs**: Render oferece cron jobs para agendamento
7. **Credenciais**: Nunca commitar secrets no GitHub

## 🛠️ Troubleshooting

### Erro: CORS

Verifique se o CORS no backend inclui a URL do frontend.

### Erro: Database Connection

Verifique se a `DATABASE_URL` está correta no Render.

### Erro: OAuth2 Redirect

Verifique se as redirect URIs nos painéis estão corretas.

### Erro: Build Failed

Verifique os logs de build no Render/Vercel.

## 📚 Referências

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [GUIA-OAUTH2.md](./GUIA-OAUTH2.md)

---

**Nota**: Este guia assume que você vai usar as plataformas gratuitas (Vercel, Render, Supabase). Para produção de alto tráfego, considere planos pagos.
