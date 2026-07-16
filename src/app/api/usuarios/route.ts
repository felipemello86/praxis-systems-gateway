import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { suitePrisma } from "@/lib/suitePrisma";
import { getSuiteSession } from "@/lib/suiteSession";
import { bloqueadoParaGerenciarUsuarios } from "@/lib/auth-guard";

// Cadastro único (suite_core.User) — fonte única de gestão de usuários da
// suíte inteira, movida pra cá (ver src/app/[cliente]/configuracoes/usuarios/).
// Antes isso vivia só dentro de apps/housekeeping (api/usuarios/route.ts) —
// mesmo contrato de request/response reaproveitado aqui, só trocando a
// sessão NextAuth local por getSuiteSession() (cookie compartilhado) e
// escopando por tenantId em vez de hotelId.

export async function GET() {
  const session = await getSuiteSession();
  if (!session) return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });

  const users = await suitePrisma.user.findMany({
    where: { tenantId: session.tenantId, ativo: true },
    orderBy: [{ role: "asc" }, { nome: "asc" }],
    include: { moduleAccess: { where: { enabled: true }, select: { module: true } } },
  });

  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      role: u.role,
      telegramChatId: u.telegramChatId,
      ativo: u.ativo,
      modules: u.moduleAccess.map((m) => m.module),
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getSuiteSession();
  const bloqueado = bloqueadoParaGerenciarUsuarios(session);
  if (bloqueado) return bloqueado;

  const { nome, email, role, telegramChatId, password, modules } = await req.json();
  if (!nome || !role || !email || !password) {
    return NextResponse.json({ error: "Nome, email, cargo e senha são obrigatórios" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const moduleList: string[] = Array.isArray(modules) && modules.length > 0 ? modules : [];

  try {
    const user = await suitePrisma.user.create({
      data: {
        tenantId: session!.tenantId,
        nome,
        email: String(email).trim().toLowerCase(),
        role,
        telegramChatId: telegramChatId || null,
        passwordHash,
        moduleAccess: {
          create: moduleList.map((module) => ({ module: module as any, enabled: true })),
        },
      },
      select: { id: true, nome: true, email: true, role: true, telegramChatId: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Este e-mail já está cadastrado para outro usuário" }, { status: 409 });
    }
    return NextResponse.json({ error: e.message || "Erro ao criar usuário" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSuiteSession();
  const bloqueado = bloqueadoParaGerenciarUsuarios(session);
  if (bloqueado) return bloqueado;

  const { id } = await req.json();
  await suitePrisma.user.update({
    where: { id },
    data: { ativo: false },
  });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  const session = await getSuiteSession();
  const bloqueado = bloqueadoParaGerenciarUsuarios(session);
  if (bloqueado) return bloqueado;

  const { id, nome, email, role, telegramChatId, password, ativo, modules } = await req.json();
  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

  if (Array.isArray(modules)) {
    // Substitui o checklist de acesso por módulo dessa pessoa.
    await suitePrisma.userModuleAccess.deleteMany({ where: { userId: id } });
    if (modules.length > 0) {
      await suitePrisma.userModuleAccess.createMany({
        data: modules.map((module: string) => ({ userId: id, module: module as any, enabled: true })),
      });
    }
  }

  const user = await suitePrisma.user.update({
    where: { id },
    data: {
      nome,
      email: email ? String(email).trim().toLowerCase() : undefined,
      role,
      telegramChatId,
      ativo,
      ...(passwordHash ? { passwordHash } : {}),
    },
    select: { id: true, nome: true, email: true, role: true, telegramChatId: true, ativo: true },
  });
  return NextResponse.json(user);
}
