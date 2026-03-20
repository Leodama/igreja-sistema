# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup (first time)
npm install
cp .env.example .env          # já configurado para SQLite

# Database
npm run db:migrate            # cria o arquivo dev.db com as tabelas
npm run db:seed               # popula usuário admin e dados iniciais
npm run db:studio             # abre o Prisma Studio (editor visual)

# Development
npm run dev                   # inicia em http://localhost:3000

# Build
npm run build && npm start
```

Default login after seed: `admin@igreja.com` / `admin123`

**Banco de dados:** SQLite — arquivo gerado em `prisma/dev.db` (criado automaticamente pelo migrate).

## Architecture

Full-stack Next.js 14 App Router. No separate backend process — API routes in `src/app/api/` serve as the backend.

**Auth flow:** NextAuth v4 with JWT strategy. `authOptions` is the single source of truth in `src/lib/auth.ts`. All API routes call `getServerSession(authOptions)`. Middleware (`middleware.ts` at root) uses `withAuth` from `next-auth/middleware` to protect all routes except `/login` and `/api/auth`.

**Route groups:**
- `src/app/(protected)/` — all authenticated pages (dashboard, itens, estoque, patrimônio, localizações, doações, histórico) share a layout with the sidebar
- `src/app/login/` — public login page

**Database:** Prisma + PostgreSQL. Schema in `prisma/schema.prisma`. All tables use `@@map()` for snake_case PostgreSQL names. Prisma `Decimal` fields must be converted to `Number` before returning JSON from API routes.

**Stock updates are atomic:** `POST /api/movimentacoes` uses `prisma.$transaction` to create the movement record and update `Item.quantidade` in a single transaction. Never update item quantity outside this transaction.

**Key files:**
- `src/lib/auth.ts` — NextAuth config (authOptions)
- `src/lib/prisma.ts` — Prisma singleton (prevents connection leaks in dev)
- `src/lib/session.ts` — `getSession()` and `getUserId()` helpers for server-side use
- `src/types/index.ts` — TypeScript types + NextAuth session augmentation

## Pages → API mapping

| Page | API routes used |
|---|---|
| `/dashboard` | `GET /api/dashboard` |
| `/itens` | `GET/POST /api/itens`, `PUT/DELETE /api/itens/[id]`, `GET /api/categorias`, `GET /api/localizacoes` |
| `/estoque` | `GET /api/itens`, `GET/POST /api/movimentacoes` |
| `/patrimonio` | `GET/POST /api/patrimonio`, `PUT/DELETE /api/patrimonio/[id]`, `GET /api/localizacoes` |
| `/localizacoes` | `GET/POST /api/localizacoes`, `PUT/DELETE /api/localizacoes/[id]` |
| `/doacoes` | `GET/POST /api/doacoes`, `PUT/DELETE /api/doacoes/[id]` |
| `/historico` | `GET /api/movimentacoes` (with query params: busca, tipo, dataInicio, dataFim) |
