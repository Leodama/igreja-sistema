import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthToken } from "@/lib/session";

export async function GET(req: NextRequest) {
  const token = await getAuthToken(req);
  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const [
      totalItens,
      totalPatrimonios,
      totalDoacoes,
      doacoesMes,
      allItens,
      ultimasMovimentacoes,
      patrimoniosAtivos,
    ] = await Promise.all([
      prisma.item.count({ where: { ativo: true } }),
      prisma.patrimonio.count(),
      prisma.doacao.count(),
      prisma.doacao.count({ where: { dataDoacao: { gte: inicioMes } } }),
      prisma.item.findMany({
        where: { ativo: true },
        include: { categoria: true, localizacao: true },
      }),
      prisma.movimentacao.findMany({
        take: 10,
        orderBy: { criadoEm: "desc" },
        include: {
          item: { select: { id: true, nome: true, unidade: true } },
          usuario: { select: { id: true, nome: true } },
        },
      }),
      prisma.patrimonio.findMany({
        where: { status: "ATIVO" },
        select: { valorAquisicao: true },
      }),
    ]);

    const itensBaixoEstoque = allItens.filter(
      (i) => i.quantidadeMinima > 0 && i.quantidade < i.quantidadeMinima
    );

    const valorTotalPatrimonios = patrimoniosAtivos.reduce(
      (acc, p) => acc + (p.valorAquisicao ?? 0),
      0
    );

    return NextResponse.json({
      totalItens,
      totalPatrimonios,
      totalDoacoes,
      doacoesMes,
      itensBaixoEstoque,
      ultimasMovimentacoes,
      valorTotalPatrimonios,
    });
  } catch (e) {
    console.error("[dashboard] erro:", e);
    return NextResponse.json(
      { error: "Erro interno ao carregar dados" },
      { status: 500 }
    );
  }
}
