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

  const { nome, descricao } = await req.json();

  const localizacao = await prisma.localizacao.update({
    where: { id: params.id },
    data: { nome, descricao: descricao || null },
  });

  return NextResponse.json(localizacao);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await prisma.localizacao.update({
    where: { id: params.id },
    data: { ativo: false },
  });

  return NextResponse.json({ success: true });
}
