import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthToken } from "@/lib/session";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { nome, descricao, unidade, quantidadeMinima, categoriaId, localizacaoId } = body;

  const item = await prisma.item.update({
    where: { id: params.id },
    data: {
      nome,
      descricao: descricao || null,
      unidade,
      quantidadeMinima: Number(quantidadeMinima) || 0,
      categoriaId: categoriaId || null,
      localizacaoId: localizacaoId || null,
    },
    include: { categoria: true, localizacao: true },
  });

  return NextResponse.json(item);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await prisma.item.update({
    where: { id: params.id },
    data: { ativo: false },
  });

  return NextResponse.json({ success: true });
}
