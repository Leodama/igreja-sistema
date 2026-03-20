import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/session";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const err = await checkRole(req, "OPERADOR");
  if (err) return err;

  const emprestimo = await prisma.emprestimo.findUnique({
    where: { id: params.id },
  });

  if (!emprestimo) {
    return NextResponse.json({ error: "Empréstimo não encontrado" }, { status: 404 });
  }

  if (emprestimo.status === "RETORNADO") {
    return NextResponse.json({ error: "Empréstimo já foi devolvido" }, { status: 400 });
  }

  const body = await req.json();
  const { dataRetorno, observacao } = body;

  const updated = await prisma.emprestimo.update({
    where: { id: params.id },
    data: {
      status: "RETORNADO",
      dataRetorno: dataRetorno ? new Date(dataRetorno) : new Date(),
      ...(observacao !== undefined ? { observacao } : {}),
    },
    include: {
      item: { select: { id: true, nome: true, unidade: true } },
      usuario: { select: { id: true, nome: true } },
    },
  });

  return NextResponse.json(updated);
}
