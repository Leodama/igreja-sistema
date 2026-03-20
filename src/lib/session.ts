import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export type Papel = "ADMINISTRADOR" | "OPERADOR" | "VISUALIZADOR";
const HIERARQUIA: Papel[] = ["VISUALIZADOR", "OPERADOR", "ADMINISTRADOR"];

export async function getAuthToken(req: NextRequest) {
  return getToken({ req, secret: process.env.NEXTAUTH_SECRET });
}

export async function getUserId(req: NextRequest): Promise<string | null> {
  const token = await getAuthToken(req);
  return (token?.id as string) ?? (token?.sub as string) ?? null;
}

export async function getUserPapel(req: NextRequest): Promise<Papel> {
  const token = await getAuthToken(req);
  return (token?.papel as Papel) ?? "VISUALIZADOR";
}

/**
 * Returns a 401/403 NextResponse if the user doesn't meet the required role,
 * or null if access is granted.
 */
export async function checkRole(
  req: NextRequest,
  minPapel: Papel
): Promise<NextResponse | null> {
  const token = await getAuthToken(req);
  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const papel = (token.papel as Papel) ?? "VISUALIZADOR";
  if (HIERARQUIA.indexOf(papel) < HIERARQUIA.indexOf(minPapel)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  return null;
}
