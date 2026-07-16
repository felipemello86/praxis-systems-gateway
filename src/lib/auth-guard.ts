import { NextResponse } from "next/server";
import type { SuiteSessionPayload } from "./suiteSession";

// Mesma regra usada em housekeeping (ver src/lib/auth-guard.ts lá): gerenciar
// usuários (criar, editar cargo/acesso, excluir) fica restrito a
// MASTER/GERENTE. Cadastro único agora vive só aqui no gateway — ver
// src/app/[cliente]/configuracoes/usuarios/.
const ROLES_PODEM_GERENCIAR_USUARIOS = ["MASTER", "GERENTE"];

export function podeGerenciarUsuarios(role: string | undefined | null): boolean {
  return !!role && ROLES_PODEM_GERENCIAR_USUARIOS.includes(role);
}

/** Retorna 403 se a sessão não puder gerenciar usuários (ou não existir). */
export function bloqueadoParaGerenciarUsuarios(session: SuiteSessionPayload | null) {
  if (!session || !podeGerenciarUsuarios(session.role)) {
    return NextResponse.json({ error: "Seu perfil não pode gerenciar usuários." }, { status: 403 });
  }
  return null;
}
