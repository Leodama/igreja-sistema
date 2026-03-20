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
  const { doador, contato, descricao, quantidade, unidade, valorEstimado, dataDoacao, observacoes } = body;

  const doacao = await prisma.doacao.update({
    where: { id: params.id },
    data: {
      doador: doador || null,
      contato: contato || null,
      descricao,
      quantidade: quantidade ? Number(quantidade) : null,
      unidade: unidade || null,
      valorEstimado: valorEstimado ? Number(valorEstimado) : null,
      dataDoacao: new Date(dataDoacao),
      observacoes: observacoes || null,
    },
    include: { usuario: { select: { nome: true } } },
  });

  return NextResponse.json(doacao);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await prisma.doacao.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
