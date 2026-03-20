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
  quantidadeDisponivel?: number; // quantidade - emprestimos ativos (computed)
  ativo: boolean;
  status: "ATIVO" | "INATIVO" | "EM_MANUTENCAO" | "DESCARTADO";
  numeroSerie?: string | null;
  valorAquisicao?: number | null;
  dataAquisicao?: string | null;
  origem?: string | null;
  nomeDoador?: string | null;
  valorCompra?: number | null;
  fornecedor?: string | null;
  numeroNfe?: string | null;
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
  destinatario?: string | null;
  dataMovimentacao?: string | null;
  criadoEm: string;
  item: { id: string; nome: string; unidade: string };
  usuario: { id: string; nome: string };
}

export interface Emprestimo {
  id: string;
  quantidade: number;
  evento?: string | null;
  responsavel: string;
  observacao?: string | null;
  dataSaida: string;
  dataRetornoPrevisto?: string | null;
  dataRetorno?: string | null;
  status: "EM_USO" | "RETORNADO";
  criadoEm: string;
  item: { id: string; nome: string; unidade: string };
  usuario: { id: string; nome: string };
}

export interface DashboardStats {
  totalItens: number;
  emprestimosEmUso: number;
  emprestimosEmAtraso: number;
  itensBaixoEstoque: Item[];
  ultimasMovimentacoes: Movimentacao[];
}
