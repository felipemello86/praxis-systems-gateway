import { notFound, redirect } from "next/navigation";
import { suitePrisma } from "@/lib/suitePrisma";
import { moduleSlugToModule, MODULE_LABELS } from "@operacao-hoteleira/suite-core";

export default async function ClienteModulo({
  params,
}: {
  params: { cliente: string; modulo: string };
}) {
  const module = moduleSlugToModule(params.modulo);
  if (!module) notFound();

  const tenant = await suitePrisma.tenant.findUnique({
    where: { slug: params.cliente },
  });
  if (!tenant) notFound();

  const tenantModule = await suitePrisma.tenantModule.findUnique({
    where: { tenantId_module: { tenantId: tenant.id, module } },
  });

  if (!tenantModule || !tenantModule.enabled) {
    return (
      <main
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          textAlign: "center",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>
          {tenant.name} não tem {MODULE_LABELS[module]} habilitado
        </h1>
        <p style={{ color: "#6e6e73" }}>
          Fale com o time comercial da Praxis Systems pra ativar este módulo.
        </p>
      </main>
    );
  }

  // Módulo licenciado: encaminha pro app real. Hoje isso é um redirect pra
  // /{modulo} no próprio domínio do gateway — esse caminho, por sua vez, é
  // espelhado (rewrite, sem trocar a URL) pro deploy real do app (ver
  // next.config.js). O tenant não viaja na URL a partir daqui porque cada
  // app já resolve o tenant sozinho, pelo login (accountId/tenantId na
  // sessão) — não pela URL.
  redirect(`/${params.modulo}`);
}
