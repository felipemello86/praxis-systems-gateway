import { NextResponse } from "next/server";

// Diagnóstico temporário: expõe o valor exato (não são secrets, são só URLs)
// que o next.config.js está lendo pra montar os rewrites de cada módulo.
// Existe só pra confirmar o valor real salvo em REVIEWS_APP_URL etc na
// Vercel (o campo é "sensitive", só dá pra sobrescrever, não ver). Remover
// depois de confirmar a causa do bug do módulo Avaliações.
export async function GET() {
  return NextResponse.json({
    GOVERNANCE_APP_URL: process.env.GOVERNANCE_APP_URL ?? null,
    REVIEWS_APP_URL: process.env.REVIEWS_APP_URL ?? null,
    UPKEEP_APP_URL: process.env.UPKEEP_APP_URL ?? null,
    reviewsDestinationExample: process.env.REVIEWS_APP_URL
      ? `${process.env.REVIEWS_APP_URL}/reviews/:path*`
      : null,
  });
}
