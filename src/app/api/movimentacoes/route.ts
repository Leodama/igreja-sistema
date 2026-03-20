import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole, getAuthToken, getUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const busca = searchParams.get("busca");
  const tipo = searchParams.get("tipo") as "ENTRADA" | "SAIDA" | null;
  const dataInicio = searchParams.get("dataInicio");
  const dataFim = searchParams.get("dataFim");
  const limit = Number(searchParams.get("limit")) || 100;

  const movimentacoes = await prisma.movimentacao.findMany({
    where: {
      ...(tipo ? { tipo } : {}),
      ...(dataInicio || dataFim
        ? {
            criadoEm: {
              ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
              ...(dataFim ? { lte: new Date(dataFim + "T23:59:59") } : {}),
            },
          }
        : {}),
      ...(busca
        ? { item: { nome: { contains: busca } } }
        : {}),
    },
    include: {
      item: { select: { id: true, nome: true, unidade: true } },
      usuario: { select: { id: true, nome: true } },
    },
    orderBy: { criadoEm: "desc" },
    take: limit,
  });

  return NextResponse.json(movimentacoes);
}

export async function POST(req: NextRequest) {
  const err = await checkRole(req, "OPERADOR");
  if (err) return err;

  const usuarioId = await getUserId(req);
  if (!usuarioId) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  const body = await req.json();
  const { itemId, tipo, quantidade, observacao, destinatario, dataMovimentacao } = body;
  const qtd = Number(quantidade);

  if (!itemId || !tipo || !qtd || qtd <= 0) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  if (tipo === "SAIDA") {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
    }
    if (item.quantidade < qtd) {
      return NextResponse.json(
        { error: `Estoque insuficiente. Disponível: ${item.quantidade} ${item.unidade}` },
        { status: 400 }
      );
    }
  }

  const [movimentacao] = await prisma.$transaction([
    prisma.movimentacao.create({
      data: {
        itemId,
        tipo,
        quantidade: qtd,
        observacao: observacao || null,
        destinatario: destinatario || null,
        dataMovimentacao: dataMovimentacao ? new Date(dataMovimentacao) : null,
        usuarioId,
      },
      include: {
        item: { select: { id: true, nome: true, unidade: true } },
        usuario: { select: { id: true, nome: true } },
      },
    }),
    prisma.item.update({
      where: { id: itemId },
      data: {
        quantidade:
          tipo === "ENTRADA" ? { increment: qtd } : { decrement: qtd },
      },
    }),
  ]);

  return NextResponse.json(movimentacao, { status: 201 });
}
