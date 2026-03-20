import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/session";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const err = await checkRole(req, "OPERADOR");
  if (err) return err;

  const body = await req.json();
  const { nome, descricao, numeroSerie, valorAquisicao, dataAquisicao, status, localizacaoId } = body;

  const patrimonio = await prisma.patrimonio.update({
    where: { id: params.id },
    data: {
      nome,
      descricao: descricao || null,
      numeroSerie: numeroSerie || null,
      valorAquisicao: valorAquisicao ? Number(valorAquisicao) : null,
      dataAquisicao: dataAquisicao ? new Date(dataAquisicao) : null,
      status,
      localizacaoId: localizacaoId || null,
    },
    include: { localizacao: true },
  });

  return NextResponse.json(patrimonio);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const err = await checkRole(req, "ADMINISTRADOR");
  if (err) return err;

  await prisma.patrimonio.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
