import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthToken, getUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const doacoes = await prisma.doacao.findMany({
    include: { usuario: { select: { nome: true } } },
    orderBy: { dataDoacao: "desc" },
  });

  return NextResponse.json(doacoes);
}

export async function POST(req: NextRequest) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const usuarioId = await getUserId(req);
  const body = await req.json();
  const { doador, contato, descricao, quantidade, unidade, valorEstimado, dataDoacao, observacoes } = body;

  const doacao = await prisma.doacao.create({
    data: {
      doador: doador || null,
      contato: contato || null,
      descricao,
      quantidade: quantidade ? Number(quantidade) : null,
      unidade: unidade || null,
      valorEstimado: valorEstimado ? Number(valorEstimado) : null,
      dataDoacao: new Date(dataDoacao),
      observacoes: observacoes || null,
      usuarioId: usuarioId || null,
    },
    include: { usuario: { select: { nome: true } } },
  });

  return NextResponse.json(doacao, { status: 201 });
}
