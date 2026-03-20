import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole, getAuthToken, getUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  if (!await getAuthToken(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const itemId = searchParams.get("itemId");

  const emprestimos = await prisma.emprestimo.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(itemId ? { itemId } : {}),
    },
    include: {
      item: { select: { id: true, nome: true, unidade: true } },
      usuario: { select: { id: true, nome: true } },
    },
    orderBy: { dataSaida: "desc" },
  });

  return NextResponse.json(emprestimos);
}

export async function POST(req: NextRequest) {
  const err = await checkRole(req, "OPERADOR");
  if (err) return err;

  const usuarioId = await getUserId(req);
  if (!usuarioId) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  const body = await req.json();
  const { itemId, quantidade, responsavel, evento, observacao, dataSaida, dataRetornoPrevisto } = body;
  const qtd = Number(quantidade) || 1;

  if (!itemId || !responsavel) {
    return NextResponse.json({ error: "Item e responsável são obrigatórios" }, { status: 400 });
  }

  // Check availability
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) {
    return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
  }

  const emprestimosAtivos = await prisma.emprestimo.aggregate({
    where: { itemId, status: "EM_USO" },
    _sum: { quantidade: true },
  });

  const emUso = emprestimosAtivos._sum.quantidade ?? 0;
  const disponivel = item.quantidade - emUso;

  if (qtd > disponivel) {
    return NextResponse.json(
      { error: `Quantidade indisponível. Disponível: ${disponivel} ${item.unidade}` },
      { status: 400 }
    );
  }

  const emprestimo = await prisma.emprestimo.create({
    data: {
      itemId,
      quantidade: qtd,
      responsavel,
      evento: evento || null,
      observacao: observacao || null,
      dataSaida: dataSaida ? new Date(dataSaida) : new Date(),
      dataRetornoPrevisto: dataRetornoPrevisto ? new Date(dataRetornoPrevisto) : null,
      usuarioId,
    },
    include: {
      item: { select: { id: true, nome: true, unidade: true } },
      usuario: { select: { id: true, nome: true } },
    },
  });

  return NextResponse.json(emprestimo, { status: 201 });
}
