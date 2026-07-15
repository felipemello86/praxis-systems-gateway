import { notFound } from "next/navigation";
import { suitePrisma } from "@/lib/suitePrisma";
import { moduleToSlug, MODULE_LABELS, SuiteModule } from "@/lib/addressing";
import { getSuiteSession } from "@/lib/suiteSession";
import { logoutAction } from "./actions";
import { LoginForm } from "./LoginForm";
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
}: {
  params: { cliente: string };
}) {
  const tenant = await suitePrisma.tenant.findUnique({
    where: { slug: params.cliente },
    include: { modules: { where: { enabled: true } } },
  });

  if (!tenant) notFound();

  const session = await getSuiteSession();
  const boundLogout = logoutAction.bind(null, tenant.slug);

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

      {!session ? (
        <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LoginForm clienteSlug={tenant.slug} />
        </div>
      ) : tenant.modules.length === 0 ? (
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
