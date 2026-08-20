# Ajuste DATABASE_URL Local e Rodar Prisma DB Push

## 🔧 Passo 1: Ajustar DATABASE_URL Local

### No arquivo backend/.env
Adicione ou atualize a seguinte linha:

```
DATABASE_URL=postgresql://postgres:Jamaicanos157%40@db.rsmfccivskwwfbazqxdg.supabase.co:5432/postgres
```

## 🔧 Passo 2: Rodar Prisma DB Push

Execute os seguintes comandos no terminal, na pasta backend:

```bash
cd backend
npx prisma db push
```

Isso vai:
1. Conectar ao novo projeto Supabase
2. Criar todas as tabelas necessárias
3. Configurar o schema do banco de dados

## 🔧 Passo 3: Atualizar Render

Após o sucesso local, atualize a DATABASE_URL no backend/render.yaml no Render para usar o mesmo formato direto.