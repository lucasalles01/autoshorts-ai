# Guia Simplificado de Deploy - AutoShorts AI

## 📋 Pré-requisitos

1. **Instalar Git**: https://git-scm.com/downloads
2. Criar contas gratuitas em:
   - GitHub
   - Vercel
   - Render
   - Supabase

## 🚀 Passo 1: Git (Preparar Código)

```bash
# Abra o terminal na pasta do projeto
cd C:\Users\lukas\.gemini\antigravity\scratch\autoshorts-ai

# Inicializar Git
git init
git add .
git commit -m "Initial commit"
```

## 📦 Passo 2: GitHub (Criar Repositório)

1. Acesse https://github.com/new
2. Nome: `autosharts-ai`
3. Clique em "Create repository"
4. Copie os comandos mostrados e execute no terminal:
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/autosharts-ai.git
   git branch -M main
   git push -u origin main
   ```

## 🗄️ Passo 3: Supabase (Banco de Dados)

1. Acesse https://supabase.com/dashboard
2. Clique em "New Project"
3. Nome: `autosharts-prod`
4. Senha: (crie uma forte e guarde)
5. Região: South America (Brasil)
6. Aguarde 2-3 minutos
7. Vá em "Settings" → "Database"
8. Copie a "Connection String" (URI)
   - Exemplo: `postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`

## 🔧 Passo 4: Render (Backend)

1. Acesse https://dashboard.render.com
2. Clique em "New" → "Web Service"
3. Conecte seu GitHub
4. Selecione o repositório `autosharts-ai`
5. Configuração:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server.js`
   - **Instance Type**: Free
6. Environment Variables:
   ```
   PORT=3001
   NODE_ENV=production
   DATABASE_URL= (cole do Supabase)
   JWT_SECRET=gerar-um-aleatorio-32-caracteres
   ENCRYPTION_KEY=gerar-um-aleatorio-32-caracteres-hex
   PUBLIC_BASE_URL=https://seu-backend.onrender.com
   ```
7. Clique em "Create Web Service"
8. Aguarde o deploy (5-10 minutos)

## 🌐 Passo 5: Vercel (Frontend)

1. Acesse https://vercel.com
2. Clique em "Add New" → "Project"
3. Conecte seu GitHub
4. Selecione o repositório `autosharts-ai`
5. Configuração:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Environment Variables:
   ```
   VITE_BASE_URL=https://seu-dominio.vercel.app
   ```
7. Clique em "Deploy"
8. Aguarde o deploy (2-3 minutos)

## 🔗 URLs de Callback OAuth2

Após o deploy, você terá URLs como:

- **Frontend**: `https://autosharts-ai.vercel.app`
- **Backend**: `https://autosharts-backend.onrender.com`

Configure estas URIs nos painéis:

**TikTok for Developers:**
```
https://autosharts-ai.vercel.app/oauth/callback
```

**Google Cloud Console (YouTube):**
```
https://autosharts-ai.vercel.app/oauth/callback
```

**Meta for Developers (Instagram):**
```
https://autosharts-ai.vercel.app/oauth/callback
```

## ✅ Verificação

1. Teste o backend: `curl https://seu-backend.onrender.com/api/analytics`
2. Teste o frontend: Acesse `https://seu-dominio.vercel.app`
3. Teste OAuth2 em "Minhas Contas"

## 📝 Checklist

- [ ] Git instalado
- [ ] Repositório GitHub criado
- [ ] Código enviado para GitHub
- [ ] Projeto Supabase criado
- [ ] Connection string obtida
- [ ] Backend publicado no Render
- [ ] Environment variables do backend configuradas
- [ ] Frontend publicado na Vercel
- [ ] Environment variables do frontend configuradas
- [ ] Redirect URIs configuradas nos painéis OAuth2
- [ ] Deploy testado

## 💡 Dicas

- Use as plataformas gratuitas (Free tier)
- Os nomes dos serviços serão gerados automaticamente
- Substitua "seu-backend" e "seu-dominio" pelos nomes reais após o deploy
- Guia completo disponível em `GUIA-DEPLOY.md`
