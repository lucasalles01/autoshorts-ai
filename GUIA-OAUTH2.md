# Guia Completo de Autenticação OAuth2 Real

## ⚠️ IMPORTANTE: HTTPS Obrigatório para OAuth2

As APIs do **TikTok, Google e Meta exigem HTTPS** para autorizações OAuth2. O sistema está rodando em `http://localhost:3000`, que não funciona com OAuth2.

### � Solução: Usar ngrok para HTTPS em Desenvolvimento

Para contornar isso em desenvolvimento, use o **ngrok** para criar um túnel HTTPS seguro apontando para seu servidor local.

## 🚀 Como Configurar ngrok

### Passo 1: Instalar ngrok

1. Acesse [ngrok.com](https://ngrok.com/)
2. Crie uma conta gratuita
3. Baixe o ngrok para Windows
4. Extraia e coloque no PATH ou use diretamente

### Passo 2: Iniciar ngrok

Abra um terminal e execute:

```bash
ngrok http 3000
```

Isso criará um túnel HTTPS apontando para seu frontend em `http://localhost:3000`.

O ngrok vai mostrar algo como:

```
Forwarding  https://xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:3000
```

### Passo 3: Configurar FRONTEND (.env)

Edite `frontend/.env` e adicione:

```env
VITE_BASE_URL=https://xxxx-xxxx-xxxx.ngrok-free.app
```

Substitua `xxxx-xxxx-xxxx` pela URL real mostrada pelo ngrok.

### Passo 4: Configurar BACKEND (.env)

Edite `backend/.env` e atualize:

```env
# URL Pública (OBRIGATÓRIO PARA OAuth2)
# Use a URL do ngrok abaixo
PUBLIC_BASE_URL=https://xxxx-xxxx-xxxx.ngrok-free.app
```

### Passo 5: Configurar Redirect URIs nos Painéis

**IMPORTANTE**: As plataformas exigem que você configure a URL HTTPS nos painéis delas.

#### TikTok for Developers:
- Configure redirect URI: `https://xxxx-xxxx-xxxx.ngrok-free.app/oauth/callback`

#### Google Cloud Console:
- Configure redirect URI: `https://xxxx-xxxx-xxxx.ngrok-free.app/oauth/callback`

#### Meta for Developers:
- Configure redirect URI: `https://xxxx-xxxx-xxxx.ngrok-free.app/oauth/callback`

### Passo 6: Reiniciar Servidores

```bash
# Backend
cd backend
npm run dev

# Frontend (em outro terminal)
cd frontend
npm run dev
```

### Passo 7: Acessar Aplicação

Agora acesse via URL do ngrok:

```
https://xxxx-xxxx-xxxx.ngrok-free.app
```

O OAuth2 vai funcionar corretamente!

## �🔥 Novo: Login OAuth2 Real com PKCE e Instagram

AutoShorts AI agora implementa **OAuth2 real** com PKCE para TikTok e suporte oficial para Instagram!

### ✅ O que foi implementado:

1. **PKCE para TikTok**: Code challenge/code verifier para segurança máxima
2. **Instagram OAuth2**: Login oficial via Meta/Facebook
3. **YouTube OAuth2**: Login oficial via Google
4. **Suporte a 2FA**: Autenticação de dois fatores em todas as plataformas
5. **Suporte HTTPS**: Configuração para usar URLs ngrok

## 🚀 Como Usar o Login OAuth2 Real

### Passo 1: Configurar Credenciais (Obrigatório)

Edite o arquivo `backend/.env` e adicione as credenciais:

```env
# URL Pública do ngrok (substitua pela sua URL real)
PUBLIC_BASE_URL=https://xxxx-xxxx-xxxx.ngrok-free.app

# Credenciais OAuth2 (obrigatório para login real)
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
TIKTOK_CLIENT_KEY=seu_tiktok_app_key
TIKTOK_CLIENT_SECRET=seu_tiktok_app_secret
INSTAGRAM_APP_ID=seu_instagram_app_id
INSTAGRAM_APP_SECRET=seu_instagram_app_secret
```

### Passo 2: Obter Credenciais

#### TikTok (TikTok for Developers) - COM PKCE

1. Acesse [TikTok for Developers](https://developers.tiktok.com/)
2. Registre como desenvolvedor (pode levar dias)
3. Crie um aplicativo
4. Configure redirect URI: `https://xxxx-xxxx-xxxx.ngrok-free.app/oauth/callback`
5. Copie **App Key** e **App Secret**
6. Adicione ao `.env` como `TIKTOK_CLIENT_KEY` e `TIKTOK_CLIENT_SECRET`

**Importante**: O sistema usa PKCE (Proof Key for Code Exchange) para TikTok, que é mais seguro e exigido pela v2 da API.

#### YouTube (Google Cloud Console)

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto
3. Habilite **YouTube Data API v3**
4. Crie **OAuth client ID** (Web application)
5. Configure redirect URI: `https://xxxx-xxxx-xxxx.ngrok-free.app/oauth/callback`
6. Copie **Client ID** e **Client Secret**
7. Adicione ao `.env` como `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`

#### Instagram (Meta for Developers)

1. Acesse [Meta for Developers](https://developers.facebook.com/)
2. Crie um aplicativo Business
3. Configure **Instagram Basic Display** e **Instagram Graph API**
4. Configure redirect URI: `https://xxxx-xxxx-xxxx.ngrok-free.app/oauth/callback`
5. Copie **App ID** e **App Secret**
6. Adicione ao `.env` como `INSTAGRAM_APP_ID` e `INSTAGRAM_APP_SECRET`

### Passo 3: Reiniciar o Backend

```bash
cd backend
npm run dev
```

### Passo 4: Usar o Login

1. Acesse via ngrok: `https://xxxx-xxxx-xxxx.ngrok-free.app`
2. Vá em **Minhas Contas**
3. Clique em **Adicionar Conta**
4. Escolha uma das 3 opções:
   - **"Entrar com TikTok via Google (PKCE)"**
   - **"Entrar com YouTube via Google (OAuth2)"**
   - **"Entrar com Instagram (Meta)"**
5. Popup abre com login oficial
6. Faça login com sua conta (suporta 2FA)
7. Autorize o aplicativo
8. Conta conectada automaticamente!

## 🔧 Como Funciona o Fluxo OAuth2

### TikTok com PKCE:

```
1. Frontend → Backend: GET /api/auth/tiktok/authorize
2. Backend: Gera code_verifier e code_challenge (SHA-256)
3. Backend: Salva code_verifier temporariamente
4. Backend → Frontend: { authUrl com code_challenge }
5. Frontend: window.open(authUrl)
6. Usuário: Login no TikTok via Google + 2FA
7. TikTok: Redireciona com code
8. Frontend: Envia código para backend
9. Backend: Usa code_verifier para trocar código por token
10. TikTok API: Retorna access_token e refresh_token
11. Backend: Salva tokens criptografados
```

### Instagram (Meta):

```
1. Frontend → Backend: GET /api/auth/instagram/authorize
2. Backend → Frontend: { authUrl Meta/Facebook }
3. Frontend: window.open(authUrl)
4. Usuário: Login no Facebook/Instagram + 2FA
5. Meta: Redireciona com code
6. Frontend: Envia código para backend
7. Backend: Troca código por token
8. Meta API: Retorna access_token
9. Backend: Salva token criptografado
```

### YouTube (Google):

```
1. Frontend → Backend: GET /api/auth/youtube/authorize
2. Backend → Frontend: { authUrl Google OAuth2 }
3. Frontend: window.open(authUrl)
4. Usuário: Login no Google + 2FA
5. Google: Redireciona com code
6. Frontend: Envia código para backend
7. Backend: Troca código por token
8. Google API: Retorna access_token e refresh_token
9. Backend: Salva tokens criptografados
```

## 📋 Endpoints Backend

### TikTok (com PKCE)

- **Autorização**: `GET /api/auth/tiktok/authorize`
  - Gera `code_verifier` e `code_challenge`
  - Retorna URL com `code_challenge` e `code_challenge_method=S256`
  - Salva `code_verifier` temporariamente

- **Callback**: `GET /api/auth/tiktok/callback`
  - Recebe código do TikTok
  - Usa `code_verifier` para trocar código por token
  - Envia `code_verifier` para API do TikTok
  - Obtém informações do usuário
  - Salva tokens criptografados

### Instagram (Meta)

- **Autorização**: `GET /api/auth/instagram/authorize`
  - Retorna URL oficial do Facebook/Instagram
  - Scopes: `instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement`

- **Callback**: `GET /api/auth/instagram/callback`
  - Recebe código do Facebook
  - Troca código por token na Graph API
  - Troca por long-lived token
  - Obtém informações do usuário
  - Salva token criptografado

### YouTube (Google)

- **Autorização**: `GET /api/auth/youtube/authorize`
  - Retorna URL do Google OAuth2
  - Scope: `youtube.upload`

- **Callback**: `GET /api/auth/youtube/callback`
  - Recebe código do Google
  - Troca código por token
  - Obtém informações do usuário
  - Salva tokens criptografados

## 🎯 Experiência do Usuário

### Botão 1: TikTok via Google (PKCE)

1. Usuário clica em "Entrar com TikTok via Google (PKCE)"
2. Popup abre com tela de login do TikTok
3. Usuário clica em "Continuar com Google"
4. Usuário seleciona conta Google
5. **Google solicita 2FA** (se ativado)
6. Usuário insere código 2FA
7. TikTok autoriza aplicativo
8. Popup fecha automaticamente
9. Mensagem: "Conta do TikTok conectada com sucesso!"

### Botão 2: YouTube via Google (OAuth2)

1. Usuário clica em "Entrar com YouTube via Google (OAuth2)"
2. Popup abre com tela de login do Google
3. Usuário seleciona conta Google
4. **Google solicita 2FA** (se ativado)
5. Usuário insere código 2FA
6. Google autoriza aplicativo
7. Popup fecha automaticamente
8. Mensagem: "Conta do YouTube conectada com sucesso!"

### Botão 3: Instagram (Meta)

1. Usuário clica em "Entrar com Instagram (Meta)"
2. Popup abre com tela de login do Facebook/Instagram
3. Usuário faz login com e-mail/senha
4. **Meta solicita 2FA** (se ativado)
5. Usuário insere código 2FA
6. Meta autoriza aplicativo
7. Popup fecha automaticamente
8. Mensagem: "Conta do Instagram conectada com sucesso!"

## ⚠️ Requisitos Importantes

### Para Uso Real:

1. **HTTPS Obrigatório**: TikTok, Google e Meta exigem HTTPS para OAuth2
2. **ngrok para Desenvolvimento**: Use ngrok para criar túnel HTTPS
3. **Credenciais Obrigatórias**: Configure as credenciais no `.env`
4. **Redirect URI HTTPS**: Configure as URIs HTTPS nos painéis
5. **URL ngrok nos dois .env**: FRONTEND e BACKEND
6. **Aprovação TikTok**: TikTok requer aprovação de desenvolvedor (pode levar dias)
7. **Conta Instagram Profissional**: Instagram requer conta Business ou Creator

### PKCE para TikTok:

- O sistema gera automaticamente `code_verifier` e `code_challenge`
- `code_verifier` é salvo temporariamente em memória
- No callback, `code_verifier` é usado para trocar código por token
- Isso é exigido pela v2 da API do TikTok
- Mais seguro que OAuth2 tradicional

## 🛠️ Troubleshooting

### Erro: "redirect_uri_mismatch"

**Solução**: Configure a URL HTTPS do ngrok nos painéis das plataformas:
- TikTok: `https://xxxx-xxxx-xxxx.ngrok-free.app/oauth/callback`
- Google: `https://xxxx-xxxx-xxxx.ngrok-free.app/oauth/callback`
- Meta: `https://xxxx-xxxx-xxxx.ngrok-free.app/oauth/callback`

### Erro: "TIKTOK_CLIENT_KEY não configurado"

**Solução**: Adicione `TIKTOK_CLIENT_KEY` e `TIKTOK_CLIENT_SECRET` no `backend/.env`

### Erro: "INSTAGRAM_APP_ID não configurado"

**Solução**: Adicione `INSTAGRAM_APP_ID` e `INSTAGRAM_APP_SECRET` no `backend/.env`

### Erro: "GOOGLE_CLIENT_ID não configurado"

**Solução**: Adicione `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no `backend/.env`

### Erro: "code_challenge obrigatório"

**Solução**: O sistema já implementa PKCE automaticamente. Verifique se o backend está atualizado.

### Erro: "Redirect URI inválido"

**Solução**: Configure a URL HTTPS do ngrok no painel da plataforma

### Erro: "Popup bloqueado"

**Solução**: Desative o bloqueador de popups para a URL do ngrok

### Erro: "Code verifier expirado"

**Solução**: O code_verifier expira em 10 minutos. Tente novamente.

### Erro: "ngrok não está rodando"

**Solução**: Inicie o ngrok antes de usar o sistema:
```bash
ngrok http 3000
```

## 🔒 Segurança

### Boas Práticas:

1. ✅ PKCE para TikTok (mais seguro)
2. ✅ Tokens criptografados com AES-256-GCM
3. ✅ Popup isolado (não compartilha sessão)
4. ✅ Códigos de uso único
5. ✅ Redirect URIs validados
6. ✅ Suporte a 2FA
7. ✅ Refresh tokens automáticos
8. ✅ Code_verifier temporário (expira em 10 min)
9. ✅ HTTPS obrigatório para OAuth2

### Credenciais:

- Nunca commitar o `.env` com credenciais reais
- Nunca compartilhar suas credenciais OAuth2
- Usar variáveis de ambiente em produção
- Renovar tokens regularmente
- Não use ngrok em produção (use domínio próprio com HTTPS)

## 📚 Referências

- [TikTok OAuth2 with PKCE](https://developers.tiktok.com/docs/login-kit/tiktok-login-kit/)
- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Meta Graph API](https://developers.facebook.com/docs/graph-api/)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api/)
- [ngrok Documentation](https://ngrok.com/docs)

## 💡 Dicas

### Para Desenvolvimento com ngrok:

1. Inicie ngrok: `ngrok http 3000`
2. Copie a URL HTTPS mostrada
3. Configure FRONTEND/.env: `VITE_BASE_URL=https://xxxx.ngrok-free.app`
4. Configure BACKEND/.env: `PUBLIC_BASE_URL=https://xxxx.ngrok-free.app`
5. Configure redirect URIs nos painéis com a URL do ngrok
6. Acesse a aplicação via URL do ngrok
7. Reinicie os servidores após mudar os .env

### Para Produção:

- Configure um domínio próprio
- Use HTTPS obrigatório com certificado SSL válido
- Configure Webhooks para renovação de tokens
- Monitorar expiração de tokens
- Use Redis para armazenar code_verifiers (em vez de memória)
- Não use ngrok em produção

## 🆘 Suporte

Se tiver problemas:
1. Verifique se o ngrok está rodando
2. Verifique se a URL do ngrok está nos dois arquivos .env
3. Verifique se as credenciais no `.env` estão corretas
4. Verifique se as redirect URIs estão configuradas nos painéis (HTTPS)
5. Verifique o console do navegador para erros
6. Verifique os logs do backend
7. Consulte a documentação oficial de cada plataforma

---

**Nota**: Este sistema agora suporta HTTPS via ngrok para OAuth2 real com PKCE para TikTok e suporte oficial para Instagram/Facebook com login e 2FA.
