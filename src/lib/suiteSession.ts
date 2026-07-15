/**
 * Sessão compartilhada entre os módulos — mesmo cookie "praxis_session"
 * descrito em apps/housekeeping/src/lib/suiteSession.ts (ver lá pro
 * raciocínio completo do SSO).
 *
 * O gateway agora é a ÚNICA porta de entrada de login (login centralizado):
 * ele EMITE a sessão compartilhada (signSuiteSession/setSuiteSessionCookie),
 * os 3 módulos só a LEEM na ponte /api/auth/silent. Antes era o contrário
 * (cada módulo emitia, o gateway só lia) — mudou porque o requisito passou a
 * ser "só é possível logar pela tela inicial do hub".
 *
 * MESMO código (secret, nome do cookie, formato do payload) existe em
 * apps/housekeeping, apps/maintenance e apps/booking-reviews — se mudar
 * aqui, mudar lá também. `SUITE_SESSION_SECRET` precisa ser IGUAL nos 4
 * projetos na Vercel.
 */
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SuiteModule } from "./addressing";

const secret = new TextEncoder().encode(
  process.env.SUITE_SESSION_SECRET || "dev-secret-change-in-production"
);

export const SUITE_SESSION_COOKIE = "praxis_session";
const SUITE_SESSION_TTL = "30d";

export interface SuiteSessionPayload {
  userId: string;
  tenantId: string;
  nome: string;
  email: string;
  role: string;
  modules: SuiteModule[];
}

export async function signSuiteSession(payload: SuiteSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SUITE_SESSION_TTL)
    .sign(secret);
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

export async function setSuiteSessionCookie(payload: SuiteSessionPayload) {
  const token = await signSuiteSession(payload);
  (await cookies()).set(SUITE_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSuiteSessionCookie() {
  (await cookies()).delete({ path: "/", name: SUITE_SESSION_COOKIE });
}
