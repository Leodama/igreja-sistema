import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/session";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const err = await checkRole(req, "OPERADOR");
  if (err) return err;

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
  const err = await checkRole(req, "ADMINISTRADOR");
  if (err) return err;

  await prisma.localizacao.update({
    where: { id: params.id },
    data: { ativo: false },
  });

  return NextResponse.json({ success: true });
}
