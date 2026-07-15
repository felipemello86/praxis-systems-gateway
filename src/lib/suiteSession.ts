/**
 * Leitura do cookie de sessão compartilhado entre os 3 módulos (mesmo
 * cookie "praxis_session" descrito em apps/housekeeping/src/lib/suiteSession.ts
 * — ver comentário lá pro raciocínio completo do SSO).
 *
 * O gateway só LÊ e LIMPA esse cookie (pra mostrar "quem está logado" no hub
 * e oferecer "Sair") — ele nunca EMITE sessão, isso é feito pelos 3 apps no
 * momento do login de verdade. `SUITE_SESSION_SECRET` precisa ser IGUAL nos
 * 4 projetos na Vercel (gateway + os 3 módulos).
 */
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.SUITE_SESSION_SECRET || "dev-secret-change-in-production"
);

export const SUITE_SESSION_COOKIE = "praxis_session";

export interface SuiteSessionPayload {
  userId: string;
  tenantId: string;
  nome: string;
  email: string;
  role: string;
  modules: string[];
}

export async function verifySuiteSession(token: string): Promise<SuiteSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SuiteSessionPayload;
  } catch {
    return null;
  }
}

export async function getSuiteSession(): Promise<SuiteSessionPayload | null> {
  const token = (await cookies()).get(SUITE_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySuiteSession(token);
}

export async function clearSuiteSessionCookie() {
  (await cookies()).delete({ path: "/", name: SUITE_SESSION_COOKIE });
}
