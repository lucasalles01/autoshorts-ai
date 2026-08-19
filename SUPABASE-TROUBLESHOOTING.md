# Como Verificar e Corrigir Configuração do Supabase

## 🔍 Passo 1: Acessar Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Procure o projeto relacionado ao AutoShorts AI

## 🔍 Passo 2: Verificar Status do Projeto

### Se o projeto estiver listado:
1. Clique no projeto
2. Verifique se está marcado como "Active"
3. Vá em Settings → General
4. Copie o **Project URL** (algo como `https://xyzxyz.supabase.co`)
5. Vá em Settings → API
6. Copie o **anon public key**

### Se o projeto não estiver listado ou estiver inativo:
1. Crie um novo projeto
2. Configure Database PostgreSQL
3. Configure Authentication (Email/Password e Google OAuth)
4. Obtenha as credenciais do novo projeto

## 🔧 Passo 3: Atualizar Credenciais

### Na Vercel:
1. Vá para Settings → Environment Variables
2. Atualize:
   ```
   VITE_SUPABASE_URL = [URL do projeto do dashboard]
   VITE_SUPABASE_ANON_KEY = [anon public key do dashboard]
   ```
3. Marque como Production
4. Redeploy

### No Código (se necessário):
Se as variáveis da Vercel não funcionarem, podemos atualizar o código com as credenciais corretas.

## ⚠️ Importante

- A URL `duaifeizjnonvzbxcpmib.supabase.co` parece estar incorreta ou o projeto foi deletado
- Você precisa fornecer a URL correta do projeto ativo
- A chave anon também deve ser atualizada

## 📋 Informações Necessárias

Por favor, forneça após verificar o dashboard:
1. **Project URL** correta (ex: `https://xyzxyz.supabase.co`)
2. **Anon public key** correta
3. Status do projeto (ativo/inativo)

Com essas informações, posso atualizar o código para resolver o ERR_NAME_NOT_RESOLVED.