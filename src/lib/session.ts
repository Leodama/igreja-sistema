import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

/**
 * Verifica autenticação em Route Handlers do App Router.
 * getServerSession() não funciona de forma confiável em Route Handlers
 * com NextAuth v4 + Next.js 14 — getToken() lê o JWT direto do cookie.
 */
export async function getAuthToken(req: NextRequest) {
  return getToken({ req, secret: process.env.NEXTAUTH_SECRET });
}

export async function getUserId(req: NextRequest): Promise<string | null> {
  const token = await getAuthToken(req);
  return (token?.id as string) ?? (token?.sub as string) ?? null;
}
