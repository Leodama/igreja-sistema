import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthToken } from "@/lib/session";

export async function GET(req: NextRequest) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const itens = await prisma.item.findMany({
    where: { ativo: true },
    include: { categoria: true, localizacao: true },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(itens);
}

export async function POST(req: NextRequest) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const {
    nome,
    descricao,
    unidade,
    quantidade,
    quantidadeMinima,
    categoriaId,
    localizacaoId,
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
    },
    include: { categoria: true, localizacao: true },
  });

  return NextResponse.json(item, { status: 201 });
}
