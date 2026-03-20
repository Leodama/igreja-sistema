import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole, getAuthToken } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const err = await checkRole(req, "ADMINISTRADOR");
  if (err) return err;

  const token = await getAuthToken(req);
  const myId = (token?.id as string) ?? (token?.sub as string);

  const alvo = await prisma.usuario.findUnique({ where: { id: params.id } });
  if (!alvo) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // admin@igreja.com cannot have its role or status changed
  if (alvo.email === "admin@igreja.com") {
    return NextResponse.json({ error: "O administrador principal não pode ser alterado" }, { status: 403 });
  }

  const { nome, email, senha, papel, ativo } = await req.json();

  const data: Record<string, unknown> = {};
  if (nome) data.nome = nome;
  if (email) {
    const existe = await prisma.usuario.findFirst({ where: { email, NOT: { id: params.id } } });
    if (existe) return NextResponse.json({ error: "Email já em uso" }, { status: 409 });
    data.email = email;
  }
  if (senha) data.senha = await bcrypt.hash(senha, 10);
  if (papel) data.papel = papel;
  if (typeof ativo === "boolean") {
    // Can't deactivate yourself
    if (params.id === myId && ativo === false) {
      return NextResponse.json({ error: "Você não pode se desativar" }, { status: 403 });
    }
    data.ativo = ativo;
  }

  const usuario = await prisma.usuario.update({
    where: { id: params.id },
    data,
    select: { id: true, nome: true, email: true, papel: true, ativo: true, criadoEm: true },
  });

  return NextResponse.json(usuario);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const err = await checkRole(req, "ADMINISTRADOR");
  if (err) return err;

  const token = await getAuthToken(req);
  const myId = (token?.id as string) ?? (token?.sub as string);

  if (params.id === myId) {
    return NextResponse.json({ error: "Você não pode excluir sua própria conta" }, { status: 403 });
  }

  const alvo = await prisma.usuario.findUnique({ where: { id: params.id } });
  if (!alvo) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }
  if (alvo.email === "admin@igreja.com") {
    return NextResponse.json({ error: "O administrador principal não pode ser excluído" }, { status: 403 });
  }

  await prisma.usuario.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
