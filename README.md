# Igreja Sistema

Sistema de controle de mantimentos e patrimônio para igrejas.

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

- **Dashboard** — visão geral com alertas de estoque baixo
- **Itens** — cadastro de mantimentos e utensílios por categoria
- **Estoque** — registro de entradas e saídas com controle de quantidade mínima
- **Patrimônio** — controle de bens com status e valor de aquisição
- **Localizações** — cadastro de locais de armazenamento
- **Doações** — registro de doações recebidas com doador e valor
- **Histórico** — todas as movimentações com filtros por item, tipo e data
