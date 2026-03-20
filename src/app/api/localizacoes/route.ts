import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthToken } from "@/lib/session";

export async function GET(req: NextRequest) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const localizacoes = await prisma.localizacao.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(localizacoes);
}

export async function POST(req: NextRequest) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { nome, descricao } = await req.json();

  const localizacao = await prisma.localizacao.create({
    data: { nome, descricao: descricao || null },
  });

  return NextResponse.json(localizacao, { status: 201 });
}
