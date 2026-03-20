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
  const {
    nome, descricao, unidade, quantidadeMinima, categoriaId, localizacaoId,
    status, numeroSerie, valorAquisicao, dataAquisicao,
    origem, nomeDoador, valorCompra, fornecedor, numeroNfe,
  } = body;

  const item = await prisma.item.update({
    where: { id: params.id },
    data: {
      nome,
      descricao: descricao || null,
      unidade,
      quantidadeMinima: Number(quantidadeMinima) || 0,
      categoriaId: categoriaId || null,
      localizacaoId: localizacaoId || null,
      status: status || "ATIVO",
      numeroSerie: numeroSerie || null,
      valorAquisicao: valorAquisicao ? Number(valorAquisicao) : null,
      dataAquisicao: dataAquisicao ? new Date(dataAquisicao) : null,
      origem: origem || null,
      nomeDoador: origem === "DOACAO" ? (nomeDoador || null) : null,
      valorCompra: origem === "COMPRA" && valorCompra ? Number(valorCompra) : null,
      fornecedor: origem === "COMPRA" ? (fornecedor || null) : null,
      numeroNfe: origem === "COMPRA" ? (numeroNfe || null) : null,
    },
    include: { categoria: true, localizacao: true },
  });

  return NextResponse.json(item);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const err = await checkRole(req, "ADMINISTRADOR");
  if (err) return err;

  await prisma.item.update({
    where: { id: params.id },
    data: { ativo: false },
  });

  return NextResponse.json({ success: true });
}
