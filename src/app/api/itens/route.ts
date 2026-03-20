import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole, getAuthToken } from "@/lib/session";

export async function GET(req: NextRequest) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const itens = await prisma.item.findMany({
    where: { ativo: true },
    include: { categoria: true, localizacao: true },
    orderBy: { nome: "asc" },
  });

  // Compute quantidadeDisponivel (quantidade - empréstimos ativos)
  const emprestimosAtivos = await prisma.emprestimo.groupBy({
    by: ["itemId"],
    where: { status: "EM_USO" },
    _sum: { quantidade: true },
  });

  const emUsoMap = new Map(
    emprestimosAtivos.map((e) => [e.itemId, e._sum.quantidade ?? 0])
  );

  const itensComDisponivel = itens.map((item) => ({
    ...item,
    quantidadeDisponivel: item.quantidade - (emUsoMap.get(item.id) ?? 0),
  }));

  return NextResponse.json(itensComDisponivel);
}

export async function POST(req: NextRequest) {
  const err = await checkRole(req, "OPERADOR");
  if (err) return err;

  const body = await req.json();
  const {
    nome,
    descricao,
    unidade,
    quantidade,
    quantidadeMinima,
    categoriaId,
    localizacaoId,
    status,
    numeroSerie,
    valorAquisicao,
    dataAquisicao,
    origem,
    nomeDoador,
    valorCompra,
    fornecedor,
    numeroNfe,
  } = body;

  const item = await prisma.item.create({
    data: {
      nome,
      descricao: descricao || null,
      unidade,
      quantidade: Number(quantidade) || 0,
      quantidadeMinima: Number(quantidadeMinima) || 0,
      categoriaId: categoriaId || null,
      localizacaoId: localizacaoId || null,
      status: status || "ATIVO",
      numeroSerie: numeroSerie || null,
      valorAquisicao: valorAquisicao ? Number(valorAquisicao) : null,
      dataAquisicao: dataAquisicao ? new Date(dataAquisicao) : null,
      origem: origem || null,
      nomeDoador: origem === "DOACAO" ? (nomeDoador || null) : null,
      valorCompra: origem === "COMPRA" && valorCompra ? Number(valorCompra) : null,
      fornecedor: origem === "COMPRA" ? (fornecedor || null) : null,
      numeroNfe: origem === "COMPRA" ? (numeroNfe || null) : null,
    },
    include: { categoria: true, localizacao: true },
  });

  return NextResponse.json(item, { status: 201 });
}
