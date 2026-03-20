import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("admin123", 10);

  await prisma.usuario.upsert({
    where: { email: "admin@igreja.com" },
    update: { papel: "ADMINISTRADOR" },
    create: {
      nome: "Administrador",
      email: "admin@igreja.com",
      senha: senhaHash,
      papel: "ADMINISTRADOR",
    },
  });

  const categorias = await Promise.all([
    prisma.categoria.upsert({
      where: { nome: "Alimentos" },
      update: {},
      create: { nome: "Alimentos", tipo: "MANTIMENTO" },
    }),
    prisma.categoria.upsert({
      where: { nome: "Limpeza" },
      update: {},
      create: { nome: "Limpeza", tipo: "MANTIMENTO" },
    }),
    prisma.categoria.upsert({
      where: { nome: "Higiene" },
      update: {},
      create: { nome: "Higiene", tipo: "MANTIMENTO" },
    }),
    prisma.categoria.upsert({
      where: { nome: "Eletrônicos" },
      update: {},
      create: { nome: "Eletrônicos", tipo: "UTENSILIO" },
    }),
    prisma.categoria.upsert({
      where: { nome: "Móveis" },
      update: {},
      create: { nome: "Móveis", tipo: "UTENSILIO" },
    }),
    prisma.categoria.upsert({
      where: { nome: "Utensílios de Cozinha" },
      update: {},
      create: { nome: "Utensílios de Cozinha", tipo: "UTENSILIO" },
    }),
  ]);

  const localizacoes = await Promise.all([
    prisma.localizacao.upsert({
      where: { nome: "Almoxarifado" },
      update: {},
      create: { nome: "Almoxarifado", descricao: "Depósito principal de mantimentos" },
    }),
    prisma.localizacao.upsert({
      where: { nome: "Cozinha" },
      update: {},
      create: { nome: "Cozinha", descricao: "Cozinha da igreja" },
    }),
    prisma.localizacao.upsert({
      where: { nome: "Salão Principal" },
      update: {},
      create: { nome: "Salão Principal", descricao: "Salão de reuniões e cultos" },
    }),
    prisma.localizacao.upsert({
      where: { nome: "Escritório" },
      update: {},
      create: { nome: "Escritório", descricao: "Escritório administrativo" },
    }),
  ]);

  const catAlimentos = categorias[0];
  const catLimpeza = categorias[1];
  const catEletronicos = categorias[3];
  const locAlmox = localizacoes[0];
  const locSalao = localizacoes[2];

  await prisma.item.upsert({
    where: { id: "seed-item-1" },
    update: {},
    create: {
      id: "seed-item-1",
      nome: "Arroz",
      descricao: "Arroz tipo 1",
      unidade: "kg",
      quantidade: 50,
      quantidadeMinima: 10,
      categoriaId: catAlimentos.id,
      localizacaoId: locAlmox.id,
    },
  });

  await prisma.item.upsert({
    where: { id: "seed-item-2" },
    update: {},
    create: {
      id: "seed-item-2",
      nome: "Feijão",
      descricao: "Feijão carioca",
      unidade: "kg",
      quantidade: 30,
      quantidadeMinima: 10,
      categoriaId: catAlimentos.id,
      localizacaoId: locAlmox.id,
    },
  });

  await prisma.item.upsert({
    where: { id: "seed-item-3" },
    update: {},
    create: {
      id: "seed-item-3",
      nome: "Detergente",
      unidade: "un",
      quantidade: 5,
      quantidadeMinima: 10,
      categoriaId: catLimpeza.id,
      localizacaoId: locAlmox.id,
    },
  });

  await prisma.item.upsert({
    where: { id: "seed-item-4" },
    update: {},
    create: {
      id: "seed-item-4",
      nome: "Projetor Epson",
      descricao: "Projetor para apresentações",
      unidade: "un",
      quantidade: 1,
      quantidadeMinima: 0,
      status: "ATIVO",
      numeroSerie: "EPS-2024-001",
      valorAquisicao: 2500,
      dataAquisicao: new Date("2024-01-15"),
      categoriaId: catEletronicos.id,
      localizacaoId: locSalao.id,
    },
  });

  console.log("✅ Seed executado com sucesso!");
  console.log("📧 Login: admin@igreja.com");
  console.log("🔑 Senha: admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
