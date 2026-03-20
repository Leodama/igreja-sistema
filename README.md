# Igreja Sistema

Sistema web para controle de mantimentos, utensílios e patrimônio de igrejas.

## Tecnologias

- **Next.js 14** (App Router, full-stack)
- **Prisma** + **SQLite**
- **NextAuth v4** (autenticação com JWT)
- **Tailwind CSS**
- **TypeScript**

## Requisitos

- Node.js 18+

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Criar as tabelas (gera o arquivo prisma/dev.db)
npm run db:migrate

# 3. Popular dados iniciais
npm run db:seed

# 4. Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

**Login padrão:** `admin@igreja.com` / `admin123`

## Funcionalidades

- **Dashboard** — visão geral com alertas de itens com estoque abaixo do mínimo
- **Itens** — cadastro de mantimentos e utensílios com categoria, unidade e quantidade mínima
- **Estoque** — registro de entradas e saídas com histórico recente
- **Patrimônio** — controle de bens e equipamentos com status, número de série e valor de aquisição
- **Localizações** — cadastro de locais de armazenamento (almoxarifado, cozinha, etc.)
- **Doações** — registro de doações recebidas com doador, contato e valor estimado
- **Histórico** — todas as movimentações filtráveis por item, tipo e período

## Comandos úteis

```bash
npm run dev          # desenvolvimento
npm run build        # build de produção
npm start            # inicia servidor de produção
npm run db:migrate   # aplica migrações do banco
npm run db:seed      # popula dados iniciais
npm run db:studio    # abre o Prisma Studio (visualizador do banco)
```
