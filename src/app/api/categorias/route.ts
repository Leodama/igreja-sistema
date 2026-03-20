import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthToken } from "@/lib/session";

export async function GET(req: NextRequest) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const categorias = await prisma.categoria.findMany({
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(categorias);
}

export async function POST(req: NextRequest) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { nome, tipo } = await req.json();

  const categoria = await prisma.categoria.create({
    data: { nome, tipo },
  });

  return NextResponse.json(categoria, { status: 201 });
}
