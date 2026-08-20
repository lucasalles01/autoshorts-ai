# AutoShorts AI - Aplicação de Edição de Vídeo Automática

Aplicação portuguesa para editar e publicar vídeos curtos automaticamente em redes sociais. Transforme vídeos longos em múltiplos shorts verticais (9:16) com IA, legendas automáticas e publicação programada.

## 🚀 Deploy em Produção

**Status: ✅ Produção Ativa**

- **Frontend**: [Vercel](https://vercel.com) - https://autoshorts-ai.vercel.app
- **Backend**: [Render](https://render.com) - https://autoshorts-backend-v2.onrender.com
- **Database**: [Supabase](https://supabase.com) - PostgreSQL

### Plataformas Configuradas

- ✅ Vercel (Frontend React + Vite)
- ✅ Render (Backend Node.js + Fastify)
- ✅ Supabase (Database + Auth)

## ✨ Funcionalidades Implementadas

### 🎬 Processamento de Vídeo
- ✅ Upload de arquivos locais (MP4, MOV, AVI)
- ✅ Upload via URL do YouTube
- ✅ Vídeos de exemplo para testes
- ✅ Detecção automática de momentos virais
- ✅ Classificação de cortes por score de IA
- ✅ Trimming de linha do tempo
- ✅ Enquadramento inteligente (Face Tracking, Subject Focus, Center Crop)
- ✅ Remoção inteligente de silêncio

### 📝 Transcrição e Legendas
- ✅ Transcrição via OpenAI Whisper API
- ✅ Placeholder transcriptions para testes
- ✅ Legendas sincronizadas word-level
- ✅ 4 estilos de legendas (VIRAL, MODERNO, MINIMAL, PROFISSIONAL)
- ✅ Customização de cores de texto e destaque
- ✅ Preview em tempo real das legendas

### 🎨 Editor de Cortes
- ✅ Preview de vídeo 9:16 (1080x1920)
- ✅ Trimmer de linha do tempo interativo
- ✅ Ajuste de início e fim
- ✅ Modos de enquadramento inteligente
- ✅ Editor de legendas em tempo real
- ✅ Metadados por plataforma (TikTok, Instagram, YouTube)
- ✅ Ações de aprovar/rejeitar cortes

### 🔐 Autenticação
- ✅ Supabase Auth integrado
- ✅ Login com e-mail/senha
- ✅ Login social com Google OAuth
- ✅ Cadastro de usuários
- ✅ Rotas protegidas
- ✅ Gerenciamento de sessão

### 📱 Publicação em Redes Sociais
- ✅ TikTok (OAuth com Google + PKCE)
- ✅ Instagram Reels (Meta Graph API)
- ✅ YouTube Shorts (Google OAuth2)
- ✅ Agendamento automático
- ✅ Seleção de horários de publicação
- ✅ Posts por dia configurável

### 📊 Analytics e Dashboard
- ✅ Dashboard com KPIs em tempo real
- ✅ Calendário de conteúdo
- ✅ Fila de publicação
- ✅ Biblioteca de conteúdo
- ✅ Gerenciamento de contas sociais
- ✅ Analytics por plataforma

## 🔧 Variáveis de Ambiente

### Frontend (Vercel)
```env
VITE_BACKEND_URL=https://autoshorts-backend-v2.onrender.com
VITE_SUPABASE_URL=https://rsmfccivskwwfbazqxdg.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Backend (Render)
```env
DATABASE_URL=postgresql://user:password@host:5432/database
OPENAI_API_KEY=sk-your-openai-api-key
TRANSCRIPTION_LANGUAGE=pt
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-32-char-hex-key
PUBLIC_BASE_URL=https://autoshorts-backend-v2.onrender.com

# OAuth2 Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
INSTAGRAM_APP_ID=your-instagram-app-id
INSTAGRAM_APP_SECRET=your-instagram-app-secret
```

### Supabase
- Project URL configurado
- Auth habilitado
- Google OAuth provider habilitado
- Database PostgreSQL conectado

## 📐 Estrutura do Projeto

```
autoshorts-ai/
├── frontend/              # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/          # Cliente API
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── pages/        # Páginas principais
│   │   ├── store/        # Zustand stores
│   │   └── lib/         # Utilitários (Supabase)
│   ├── public/
│   ├── vercel.json       # Config Vercel
│   └── package.json
├── backend/               # Node.js + Fastify + TypeScript
│   ├── src/
│   │   ├── config/       # Configuração
│   │   ├── services/     # Serviços (FFmpeg, Transcrição, etc)
│   │   ├── workers/      # Workers de processamento
│   │   └── server.ts     # API Fastify
│   ├── prisma/
│   │   └── schema.prisma # Schema do banco
│   ├── render.yaml       # Config Render
│   └── package.json
└── shared/                # Código compartilhado
```

## � Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- FFmpeg
- SQLite (desenvolvimento)
- Supabase CLI (opcional)

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Backend roda em: `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend roda em: `http://localhost:3000`

### Desenvolvimento Simultâneo

```bash
# Na raiz do projeto
npm run dev
```

## 🔐 Configuração OAuth2

Para configurar OAuth2, consulte: [GUIA-OAUTH2.md](./GUIA-OAUTH2.md)

### Plataformas Suportadas

- **TikTok**: OAuth via Google com PKCE
- **YouTube**: Google OAuth2 padrão
- **Instagram**: Meta Graph API

## 📚 Documentação

- [GUIA-DEPLOY.md](./GUIA-DEPLOY.md) - Guia completo de deploy
- [GUIA-OAUTH2.md](./GUIA-OAUTH2.md) - Guia de OAuth2
- [AUTH-IMPLEMENTATION.md](./AUTH-IMPLEMENTATION.md) - Implementação de autenticação
- [UPLOAD-IMPLEMENTATION.md](./UPLOAD-IMPLEMENTATION.md) - Sistema de upload
- [CLIP-EDITOR-IMPLEMENTATION.md](./CLIP-EDITOR-IMPLEMENTATION.md) - Editor de cortes
- [AGENTS.md](./AGENTS.md) - Notas para desenvolvedores

## 🛠️ Tecnologias

### Frontend
- **Framework**: React 18
- **Build**: Vite 5
- **Linguagem**: TypeScript
- **State**: Zustand
- **Routing**: React Router DOM
- **UI**: Tailwind CSS
- **Icons**: Lucide React
- **Auth**: Supabase Auth

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **Linguagem**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Video**: FFmpeg
- **Transcrição**: OpenAI Whisper
- **Auth**: JWT + OAuth2

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase
- **CI/CD**: GitHub Actions

## 🎯 Fluxo de Uso

1. **Login**: Usuário faz login via e-mail/senha ou Google
2. **Upload**: Envia vídeo longo (arquivo ou YouTube URL)
3. **Processamento**: IA detecta momentos virais e gera cortes
4. **Revisão**: Editor de cortes para ajustar legendas e enquadramento
5. **Aprovação**: Aprova cortes selecionados
6. **Agendamento**: Define horários de publicação
7. **Publicação**: Publica automaticamente nas redes configuradas

## 🔄 Pipeline de Processamento

```
Vídeo Longo → Upload → Transcrição → Detecção de Cortes → 
Classificação IA → Editor de Cortes → Renderização 9:16 → 
Legendas → Agendamento → Publicação
```

## 📊 Métricas de Sucesso

- **Vídeos processados**: N/A
- **Cortes gerados**: N/A
- **Publicações agendadas**: N/A
- **Taxa de engajamento**: N/A

## 🚧 Roadmap

- [ ] Analytics de performance de vídeos
- [ ] A/B testing de legendas
- [ ] Integração com mais plataformas
- [ ] Edição colaborativa
- [ ] Templates de legendas
- [ ] Detecção de trends

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

## 📄 Licença

MIT License - veja arquivo LICENSE para detalhes

## 👥 Autores

- **Lucas Alves** - Desenvolvimento principal

---

**AutoShorts AI © 2026 - Transforme vídeos longos em shorts virais automaticamente**
