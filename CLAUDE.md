# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup (first time)
npm install

# Database
npm run db:migrate            # cria o arquivo prisma/dev.db com as tabelas
npm run db:seed               # popula usuário admin e dados iniciais
npm run db:studio             # abre o Prisma Studio (editor visual)

# Development
npm run dev                   # inicia em http://localhost:3000

# Build & production
npm run build
npm start -- -p 3001          # porta 3001 para evitar conflito com dev
```

Default login after seed: `admin@igreja.com` / `admin123`

## Architecture

Full-stack Next.js 14 App Router. No separate backend — API routes in `src/app/api/` serve as the backend.

**Auth flow:** NextAuth v4 with JWT strategy. `authOptions` defined in `src/lib/auth.ts`. All API routes authenticate via `getToken()` from `next-auth/jwt` (not `getServerSession` — that doesn't work in App Router route handlers). The helper is in `src/lib/session.ts`. Middleware (`middleware.ts` at root) uses `withAuth` from `next-auth/middleware` to protect all routes except `/login` and `/api/auth`.

**Route groups:**
- `src/app/(protected)/` — all authenticated pages share a layout with the sidebar
- `src/app/login/` — public login page

**Database:** Prisma + SQLite. Schema in `prisma/schema.prisma`. The db file (`prisma/dev.db`) is gitignored. No enums (SQLite doesn't support them — use `String` fields with string literal values). No `@db.Decimal` annotations (use `Float`). Prisma `Float` values are safe to return directly as JSON.

**Stock updates are atomic:** `POST /api/movimentacoes` uses `prisma.$transaction` to create the movement record and update `Item.quantidade` in a single transaction. Never update item quantity outside this transaction.

**Client-side fetching:** All pages use `fetchJson<T>(url, fallback)` from `src/lib/utils.ts` to load data — never raw `fetch()` without checking `res.ok`. All `handleSubmit` functions check `res.ok` and show an `alert()` on failure.

**Key files:**
- `src/lib/auth.ts` — NextAuth config (authOptions)
- `src/lib/prisma.ts` — Prisma singleton (prevents connection leaks in dev)
- `src/lib/session.ts` — `getAuthToken()` and `getUserId()` helpers using `getToken()` from next-auth/jwt
- `src/lib/utils.ts` — `fetchJson<T>()`, `formatDate()`, `formatCurrency()`
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
| `/historico` | `GET /api/movimentacoes` (query params: busca, tipo, dataInicio, dataFim) |
