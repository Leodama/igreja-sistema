import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const err = await checkRole(req, "ADMINISTRADOR");
  if (err) return err;

  const usuarios = await prisma.usuario.findMany({
    select: { id: true, nome: true, email: true, papel: true, ativo: true, criadoEm: true },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(usuarios);
}

export async function POST(req: NextRequest) {
  const err = await checkRole(req, "ADMINISTRADOR");
  if (err) return err;

  const { nome, email, senha, papel } = await req.json();

  if (!nome || !email || !senha || !papel) {
    return NextResponse.json({ error: "Campos obrigatórios: nome, email, senha, papel" }, { status: 400 });
  }

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) {
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.usuario.create({
    data: { nome, email, senha: senhaHash, papel },
    select: { id: true, nome: true, email: true, papel: true, ativo: true, criadoEm: true },
  });

  return NextResponse.json(usuario, { status: 201 });
}
