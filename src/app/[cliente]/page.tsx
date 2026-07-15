import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { suitePrisma } from "@/lib/suitePrisma";
import { moduleToSlug, MODULE_LABELS, SuiteModule } from "@/lib/addressing";
import { getSuiteSession, verifySuiteSession, SUITE_SESSION_COOKIE } from "@/lib/suiteSession";
import { logoutAction } from "./actions";
import { IconBed, IconWrench, IconStar, IconGear } from "@/lib/icons";

const MODULE_ICON: Record<SuiteModule, (props: { size?: number }) => JSX.Element> = {
  HOUSEKEEPING: IconBed,
  MAINTENANCE: IconWrench,
  BOOKING_REVIEWS: IconStar,
};

const ROLE_LABEL: Record<string, string> = {
  MASTER: "Master",
  GERENTE: "Gerente",
  GOVERNANTA: "Governanta",
  CAMAREIRA: "Camareira",
  LAVANDERIA: "Lavanderia",
  MANUTENCAO: "Manutenção",
  ATENDIMENTO: "Atendimento",
};

export default async function ClienteHub({
  params,
  searchParams,
}: {
  params: { cliente: string };
  searchParams: { debug?: string };
}) {
  const tenant = await suitePrisma.tenant.findUnique({
    where: { slug: params.cliente },
    include: { modules: { where: { enabled: true } } },
  });

  if (!tenant) notFound();

  const session = await getSuiteSession();
  const boundLogout = logoutAction.bind(null, tenant.slug);

  // Diagnóstico temporário — acessível só com ?debug=1 na URL, pra
  // investigar por que o rodapé de usuário/sair não estava aparecendo pra
  // gente logado. Remover depois de resolver.
  let debugInfo: string | null = null;
  if (searchParams?.debug === "1") {
    const raw = (await cookies()).get(SUITE_SESSION_COOKIE)?.value;
    if (!raw) {
      debugInfo = "Cookie praxis_session: AUSENTE (não foi setado ou o navegador não guardou)";
    } else {
      const verified = await verifySuiteSession(raw);
      debugInfo = verified
        ? `Cookie presente e válido. userId=${verified.userId} nome=${verified.nome} role=${verified.role}`
        : `Cookie presente (${raw.length} chars) mas FALHOU na verificação (secret errado ou token corrompido/expirado). Início: ${raw.slice(0, 20)}...`;
    }
  }

  return (
    <main
      style={{
        height: "100svh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "16px 20px 14px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 14, flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/praxis-logo.png"
          alt="Praxis"
          style={{ height: 30, width: "auto", display: "inline-block" }}
        />
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "6px 0 0", color: "#1d1d1f" }}>
          {tenant.name}
        </h1>
      </div>

      {tenant.modules.length === 0 ? (
        <p style={{ color: "#6e6e73", textAlign: "center" }}>
          Nenhum módulo habilitado para este cliente ainda.
        </p>
      ) : (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 14,
            width: "100%",
            maxWidth: 420,
            margin: "0 auto",
          }}
        >
          {tenant.modules.map((m) => {
            const slug = moduleToSlug(m.module);
            const Icon = MODULE_ICON[m.module];
            return (
              // <a> pura de propósito, não <Link> do Next.js: /{modulo} é
              // servido por um app Next.js DIFERENTE (build/bundle próprio)
              // por trás do rewrite. Navegação client-side (soft) tenta
              // reconciliar a resposta com o manifesto de chunks DESTE app
              // e quebra (ChunkLoadError). Precisa ser um reload completo.
              <a
                key={m.id}
                href={`/${tenant.slug}/${slug}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  borderRadius: 20,
                  background: "#fff",
                  color: "#1d1d1f",
                  textDecoration: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                  minHeight: 0,
                }}
              >
                <Icon size={26} />
                <span style={{ fontSize: 16, fontWeight: 700, textAlign: "center" }}>
                  {MODULE_LABELS[m.module]}
                </span>
              </a>
            );
          })}

          <a
            href={`/${tenant.slug}/configuracoes`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderRadius: 20,
              background: "#e8e8ed",
              color: "#1d1d1f",
              textDecoration: "none",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              minHeight: 0,
            }}
          >
            <IconGear size={26} />
            <span style={{ fontSize: 16, fontWeight: 700, textAlign: "center" }}>Configurações</span>
          </a>
        </div>
      )}

      {debugInfo && (
        <p
          style={{
            flexShrink: 0,
            marginTop: 10,
            padding: 10,
            background: "#fff3cd",
            borderRadius: 10,
            fontSize: 11,
            color: "#1d1d1f",
            wordBreak: "break-all",
            maxHeight: 70,
            overflow: "auto",
          }}
        >
          DEBUG: {debugInfo}
        </p>
      )}

      {session && (
        <form
          action={boundLogout}
          style={{
            flexShrink: 0,
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontSize: 13,
            color: "#86868b",
          }}
        >
          <span>
            {session.nome} · {ROLE_LABEL[session.role] ?? session.role}
          </span>
          <span>·</span>
          <button
            type="submit"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "#86868b",
              fontSize: 13,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </form>
      )}
    </main>
  );
}
