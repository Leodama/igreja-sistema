import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      papel: string;
      name?: string | null;
      email?: string | null;
    };
  }
}

// ─── API response types ────────────────────────────────────────────────────────

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: "ADMINISTRADOR" | "OPERADOR" | "VISUALIZADOR";
  ativo: boolean;
  criadoEm: string;
}

export interface Categoria {
  id: string;
  nome: string;
  tipo: "MANTIMENTO" | "UTENSILIO" | "OUTRO";
}

export interface Localizacao {
  id: string;
  nome: string;
  descricao?: string | null;
  ativo: boolean;
}

export interface Item {
  id: string;
  nome: string;
  descricao?: string | null;
  unidade: string;
  quantidade: number;
  quantidadeMinima: number;
  ativo: boolean;
  categoriaId: string | null;
  localizacaoId: string | null;
  categoria: Categoria | null;
  localizacao: Localizacao | null;
  criadoEm: string;
}

export interface Movimentacao {
  id: string;
  tipo: "ENTRADA" | "SAIDA";
  quantidade: number;
  observacao?: string | null;
  criadoEm: string;
  item: { id: string; nome: string; unidade: string };
  usuario: { id: string; nome: string };
}

export interface Patrimonio {
  id: string;
  nome: string;
  descricao?: string | null;
  numeroSerie?: string | null;
  valorAquisicao?: number | null;
  dataAquisicao?: string | null;
  status: "ATIVO" | "INATIVO" | "EM_MANUTENCAO" | "DESCARTADO";
  localizacaoId: string | null;
  localizacao: Localizacao | null;
  criadoEm: string;
}

export interface Doacao {
  id: string;
  doador?: string | null;
  contato?: string | null;
  descricao: string;
  quantidade?: number | null;
  unidade?: string | null;
  valorEstimado?: number | null;
  dataDoacao: string;
  observacoes?: string | null;
  usuario?: { nome: string } | null;
  criadoEm: string;
}

export interface DashboardStats {
  totalItens: number;
  totalPatrimonios: number;
  totalDoacoes: number;
  itensBaixoEstoque: Item[];
  ultimasMovimentacoes: Movimentacao[];
  doacoesMes: number;
  valorTotalPatrimonios: number;
}
