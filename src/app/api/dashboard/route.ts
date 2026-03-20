import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthToken } from "@/lib/session";

export async function GET(req: NextRequest) {
  const token = await getAuthToken(req);
  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const agora = new Date();

    const [totalItens, emprestimosEmUso, allItens, ultimasMovimentacoes] =
      await Promise.all([
        prisma.item.count({ where: { ativo: true } }),
        prisma.emprestimo.count({ where: { status: "EM_USO" } }),
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
      ]);

    const emprestimosEmAtraso = await prisma.emprestimo.count({
      where: {
        status: "EM_USO",
        dataRetornoPrevisto: { lt: agora },
      },
    });

    const itensBaixoEstoque = allItens.filter(
      (i) => i.quantidadeMinima > 0 && i.quantidade < i.quantidadeMinima
    );

    return NextResponse.json({
      totalItens,
      emprestimosEmUso,
      emprestimosEmAtraso,
      itensBaixoEstoque,
      ultimasMovimentacoes,
    });
  } catch (e) {
    console.error("[dashboard] erro:", e);
    return NextResponse.json(
      { error: "Erro interno ao carregar dados" },
      { status: 500 }
    );
  }
}
