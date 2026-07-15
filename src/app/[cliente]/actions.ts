"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { suitePrisma } from "@/lib/suitePrisma";
import { getSuiteSession, clearSuiteSessionCookie } from "@/lib/suiteSession";

// Limpa só o cookie compartilhado (praxis_session). Não invalida sessões já
// abertas dentro de cada módulo individualmente — isso exigiria alcançar o
// cookie próprio de cada app (NextAuth em housekeeping/maintenance, cookie
// "session" custom no booking-reviews), o que o hub não tem como fazer sem
// duplicar a lógica de sessão de cada um. Na prática: sai do "login
// automático entre módulos", mas quem já estava logado dentro de um módulo
// específico continua até a sessão dele vencer ou a pessoa sair de lá.
export async function logoutAction(clienteSlug: string) {
  await clearSuiteSessionCookie();
  redirect(`/${clienteSlug}`);
}

export type ChangePasswordResult = { ok: true } | { ok: false; error: string };

export async function changePasswordAction(
  _prevState: ChangePasswordResult | null,
  formData: FormData
): Promise<ChangePasswordResult> {
  const session = await getSuiteSession();
  if (!session) return { ok: false, error: "Sessão expirada. Entre em um dos módulos de novo." };

  const senhaAtual = String(formData.get("senhaAtual") ?? "");
  const novaSenha = String(formData.get("novaSenha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");

  if (novaSenha.length < 6) {
    return { ok: false, error: "A nova senha precisa ter pelo menos 6 caracteres." };
  }
  if (novaSenha !== confirmacao) {
    return { ok: false, error: "A confirmação não bate com a nova senha." };
  }

  const user = await suitePrisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { ok: false, error: "Usuário não encontrado." };

  if (user.passwordHash) {
    const confere = await bcrypt.compare(senhaAtual, user.passwordHash);
    if (!confere) return { ok: false, error: "Senha atual incorreta." };
  }

  const novoHash = await bcrypt.hash(novaSenha, 10);
  await suitePrisma.user.update({ where: { id: user.id }, data: { passwordHash: novoHash } });

  return { ok: true };
}
