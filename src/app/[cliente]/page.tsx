import { notFound } from "next/navigation";
import { suitePrisma } from "@/lib/suitePrisma";
import { moduleToSlug, MODULE_LABELS, SuiteModule } from "@/lib/addressing";
import { getSuiteSession } from "@/lib/suiteSession";
import { logoutAction } from "./actions";
import { LoginForm } from "./LoginForm";
import { LockBodyScroll } from "./LockBodyScroll";
import { IconBed, IconWrench, IconStar, IconGear } from "@/lib/icons";
import styles from "./page.module.css";

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
    <main className={styles.main}>
      <LockBodyScroll />
      <div className={styles.header}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/praxis-logo.png" alt="Praxis" className={styles.logo} />
        <h1 className={styles.title}>{tenant.name}</h1>
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
        <div className={styles.buttonArea}>
          <div className={styles.grid}>
            {tenant.modules.map((m) => {
              const slug = moduleToSlug(m.module);
              const Icon = MODULE_ICON[m.module];
              return (
                // <a> pura de propósito, não <Link> do Next.js: /{modulo} é
                // servido por um app Next.js DIFERENTE (build/bundle próprio)
                // por trás do rewrite. Navegação client-side (soft) tenta
                // reconciliar a resposta com o manifesto de chunks DESTE app
                // e quebra (ChunkLoadError). Precisa ser um reload completo.
                <a key={m.id} href={`/${tenant.slug}/${slug}`} className={styles.tile}>
                  <Icon />
                  <span className={styles.tileLabel}>{MODULE_LABELS[m.module]}</span>
                </a>
              );
            })}

            <a href={`/${tenant.slug}/configuracoes`} className={`${styles.tile} ${styles.tileConfig}`}>
              <IconGear />
              <span className={styles.tileLabel}>Configurações</span>
            </a>
          </div>
        </div>
      )}

      {session && (
        <form action={boundLogout} className={styles.footer}>
          <span>
            {session.nome} · {ROLE_LABEL[session.role] ?? session.role}
          </span>
          <span>·</span>
          <button type="submit" className={styles.logoutBtn}>
            Sair
          </button>
        </form>
      )}
    </main>
  );
}
