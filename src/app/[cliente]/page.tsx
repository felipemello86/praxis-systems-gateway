import { notFound } from "next/navigation";
import { suitePrisma } from "@/lib/suitePrisma";
import { moduleToSlug, MODULE_LABELS } from "@/lib/addressing";

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

  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#6e6e73", margin: 0, fontSize: 14 }}>Praxis</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "4px 0 0" }}>
          {tenant.name}
        </h1>
      </div>

      {tenant.modules.length === 0 ? (
        <p style={{ color: "#6e6e73" }}>
          Nenhum módulo habilitado para este cliente ainda.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: "100%",
            maxWidth: 340,
          }}
        >
          {tenant.modules.map((m) => {
            const slug = moduleToSlug(m.module);
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
                  display: "block",
                  padding: "14px 18px",
                  borderRadius: 14,
                  background: "#fff",
                  color: "#1d1d1f",
                  textDecoration: "none",
                  fontWeight: 600,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                }}
              >
                {MODULE_LABELS[m.module]}
              </a>
            );
          })}
        </div>
      )}
    </main>
  );
}
