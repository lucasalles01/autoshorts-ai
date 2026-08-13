# AutoShorts AI - Aplicação de Edição de Vídeo Automática

Aplicação para editar e publicar vídeos curtos automaticamente em redes sociais.

## 🚀 Deploy em Produção

Para publicar em produção, siga o guia: [GUIA-DEPLOY.md](./GUIA-DEPLOY.md)

### Plataformas Recomendadas

- **Frontend**: Vercel (grátis)
- **Backend**: Render (grátis)
- **Database**: Supabase (grátis)

## � Estrutura do Projeto

```
autoshorts-ai/
├── frontend/          # React + Vite
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js + Fastify
│   ├── src/
│   ├── prisma/
│   └── package.json
└── shared/            # Código compartilhado
```

## 🔧 Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- FFmpeg
- SQLite (desenvolvimento)

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: `http://localhost:3000`

## 🔐 OAuth2 e Redes Sociais

Para configuração OAuth2, consulte: [GUIA-OAUTH2.md](./GUIA-OAUTH2.md)

### Plataformas Suportadas

- TikTok (via Google com PKCE)
- YouTube (Google OAuth2)
- Instagram (Meta Graph API)

## 📚 Documentação

- [GUIA-DEPLOY.md](./GUIA-DEPLOY.md) - Guia completo de deploy
- [GUIA-OAUTH2.md](./GUIA-OAUTH2.md) - Guia de OAuth2
- [AGENTS.md](./AGENTS.md) - Notas para desenvolvedores

## 🛠️ Tecnologias

- **Frontend**: React, TypeScript, Vite, Zustand
- **Backend**: Node.js, Fastify, Prisma, TypeScript
- **Database**: SQLite (dev), PostgreSQL (prod)
- **Video**: FFmpeg
- **Auth**: OAuth2 (PKCE para TikTok)

## � Licença

MIT
