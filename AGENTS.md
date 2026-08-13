# AutoShorts AI - Informações para Desenvolvedores

## 🚀 Inicialização Rápida

### Script Automático (Windows)
```bash
# Execute o arquivo na raiz do projeto
Iniciar-AutoShorts-AI.bat
```

### Inicialização Manual
```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

## 🔧 Configuração de Ambiente

### Problema: Node.js não encontrado no PATH
No Windows, adicione ao PATH temporariamente:
```powershell
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
```

### Verificar dependências
```bash
# Backend
cd backend
npm.cmd list

# Frontend  
cd frontend
npm.cmd list

# Shared
cd shared
npm.cmd list
```

## 🗄️ Banco de Dados

### Reset do Banco de Dados
```bash
cd backend
npx prisma db push --force-reset
```

### Ver Schema
```bash
cd backend
npx prisma studio
```

## 🎥 Sistema de Vídeos

### Storage Local
Os vídeos são armazenados em:
```
backend/storage/
├── originals/     # Vídeos originais enviados
├── clips/         # Cortes renderizados (9:16)
├── thumbnails/    # Miniaturas dos cortes
├── subtitles/     # Arquivos de legendas (.ass)
├── audio/         # Áudio extraído
└── tmp/           # Arquivos temporários
```

### Testar Processamento
```bash
# Criar projeto e vídeo de teste via API
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","description":"Teste"}'

# Pegue o ID do projeto e crie vídeo demo
curl -X POST http://localhost:3001/api/projects/{PROJECT_ID}/demo \
  -H "Content-Type: application/json" \
  -d '{"name":"Video Teste","duration":60}'
```

## 🔍 Debug e Troubleshooting

### Verificar Status do Backend
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/health
```

### Verificar Jobs de Processamento
```bash
curl http://localhost:3001/api/jobs
curl http://localhost:3001/api/jobs/{JOB_ID}
```

### Verificar Clips Gerados
```bash
curl http://localhost:3001/api/clips
curl http://localhost:3001/api/projects/{PROJECT_ID}/clips
```

### Limpar Processos Node.js
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

## 🎨 Frontend

### Proxy de API
O Vite está configurado para proxyar requisições `/api` para `http://localhost:3001`

### Estado Global (Zustand)
O estado da aplicação é gerenciado em `frontend/src/store/useAppStore.ts`

### Páginas Principais
- `Dashboard.tsx` - Visão geral e KPIs
- `NewProjectWizard.tsx` - Wizard de criação de projetos
- `ClipReviewEditor.tsx` - Editor de cortes
- `SocialAccountsPage.tsx` - Gerenciamento de contas sociais
- `PublishingQueue.tsx` - Fila de publicação

## 🔒 Segurança

### Usuário Demo
- Email: `demo@autoshorts.ai`
- Senha: `demo123`

### Criptografia
Tokens OAuth2 são criptografados com AES-256-GCM usando a `ENCRYPTION_KEY` do .env

## 📊 API Endpoints Principais

### Projetos
- `POST /api/projects` - Criar projeto
- `GET /api/projects` - Listar projetos
- `GET /api/projects/:id` - Detalhes do projeto
- `DELETE /api/projects/:id` - Deletar projeto

### Upload
- `POST /api/projects/:id/upload` - Upload de vídeo
- `POST /api/projects/:id/demo` - Criar vídeo de teste

### Clips
- `GET /api/clips` - Listar todos os clips
- `GET /api/projects/:id/clips` - Clips do projeto
- `PATCH /api/clips/:id` - Atualizar clip
- `POST /api/clips/:id/approve` - Aprovar clip
- `POST /api/clips/:id/reject` - Rejeitar clip

### Social
- `GET /api/social/accounts` - Listar contas
- `POST /api/social/accounts` - Adicionar conta
- `DELETE /api/social/accounts/:id` - Remover conta

### Publicação
- `POST /api/posts/schedule` - Agendar post
- `POST /api/posts/auto-schedule` - Agendamento em lote
- `GET /api/posts` - Listar posts
- `POST /api/posts/:id/publish` - Publicar agora

## 🐛 Problemas Conhecidos

### Porta já em uso
```powershell
# Mate todos os processos node
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### FFmpeg não disponível
O backend verifica automaticamente o FFmpeg. Se não estiver disponível, configure:
```env
FFMPEG_PATH=caminho\para\ffmpeg.exe
FFPROBE_PATH=caminho\para\ffprobe.exe
```

### Transcrição desativada
Por padrão, a transcrição usa provider "NONE". Para habilitar:
```env
OPENAI_API_KEY=sua_chave_api
TRANSCRIPTION_LANGUAGE=pt
```

## 📈 Monitoramento

### Logs do Backend
O backend usa Fastify com logger integrado. Os logs aparecem no terminal.

### Progresso de Jobs
Use o endpoint `/api/jobs/:id` para monitorar o progresso do processamento.

## 🎯 Fluxo Completo de Uso

1. **Criar Projeto**: Dashboard → Novo Projeto
2. **Upload/Demo**: Enviar vídeo ou usar vídeo de teste
3. **Processamento**: IA gera cortes automaticamente
4. **Revisão**: Aprovar/rejeitar cortes no editor
5. **Agendar**: Configurar publicação automática
6. **Publicar**: Monitorar fila de publicação

## 🔧 Desenvolvimento

### Adicionar Nova Página
1. Criar arquivo em `frontend/src/pages/`
2. Adicionar rota em `App.tsx`
3. Adicionar item de navegação em `Navigation.tsx`

### Modificar API
1. Adicionar endpoint em `backend/src/server.ts`
2. Adicionar schema em `shared/src/` se necessário
3. Atualizar `frontend/src/api/client.ts`

### Modificar Banco de Dados
1. Editar `backend/prisma/schema.prisma`
2. Rodar `npx prisma db push`
3. Regenerar client se necessário: `npx prisma generate`