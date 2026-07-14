/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Rewrites estáticos: cada módulo mora num deploy próprio (Vercel/Render),
  // com basePath fixo batendo o slug (ver docs/ARCHITECTURE.md). O gateway
  // só espelha a URL — quem serve o conteúdo de fato é o app real.
  //
  // *_APP_URL fica vazio até o app correspondente ter um deploy com o
  // basePath configurado (ver task "basePath por módulo nos 3 apps"). Até lá
  // a regra correspondente é omitida pra não gerar um rewrite quebrado.
  async rewrites() {
    const rules = [];

    if (process.env.GOVERNANCE_APP_URL) {
      rules.push(
        { source: "/governance", destination: `${process.env.GOVERNANCE_APP_URL}/governance` },
        { source: "/governance/:path*", destination: `${process.env.GOVERNANCE_APP_URL}/governance/:path*` },
      );
    }
    if (process.env.REVIEWS_APP_URL) {
      rules.push(
        { source: "/reviews", destination: `${process.env.REVIEWS_APP_URL}/reviews` },
        { source: "/reviews/:path*", destination: `${process.env.REVIEWS_APP_URL}/reviews/:path*` },
      );
    }
    if (process.env.UPKEEP_APP_URL) {
      rules.push(
        { source: "/upkeep", destination: `${process.env.UPKEEP_APP_URL}/upkeep` },
        { source: "/upkeep/:path*", destination: `${process.env.UPKEEP_APP_URL}/upkeep/:path*` },
      );
    }

    return rules;
  },
};

module.exports = nextConfig;
