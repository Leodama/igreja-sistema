import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthToken } from "@/lib/session";

export async function GET(req: NextRequest) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const patrimonios = await prisma.patrimonio.findMany({
    include: { localizacao: true },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(patrimonios);
}

export async function POST(req: NextRequest) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { nome, descricao, numeroSerie, valorAquisicao, dataAquisicao, status, localizacaoId } = body;

  const patrimonio = await prisma.patrimonio.create({
    data: {
      nome,
      descricao: descricao || null,
      numeroSerie: numeroSerie || null,
      valorAquisicao: valorAquisicao ? Number(valorAquisicao) : null,
      dataAquisicao: dataAquisicao ? new Date(dataAquisicao) : null,
      status: status || "ATIVO",
      localizacaoId: localizacaoId || null,
    },
    include: { localizacao: true },
  });

  return NextResponse.json(patrimonio, { status: 201 });
}
