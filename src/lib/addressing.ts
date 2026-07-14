// Cópia local (não importa de @operacao-hoteleira/suite-core): o gateway
// virou um repositório git separado (deploy independente na Vercel), então
// não tem acesso ao caminho relativo "../../packages/suite-core" que o
// pacote usa via `file:` dependency — isso só existe dentro do monorepo
// "Operacao Hoteleira Integrada" completo. Mantém a mesma lógica/nomes do
// packages/suite-core/src/addressing.ts — se mudar um lado, mudar o outro.

export type SuiteModule = "BOOKING_REVIEWS" | "HOUSEKEEPING" | "MAINTENANCE";

export const MODULE_SLUGS: Record<SuiteModule, string> = {
  HOUSEKEEPING: "governance",
  BOOKING_REVIEWS: "reviews",
  MAINTENANCE: "upkeep",
};

export const MODULE_LABELS: Record<SuiteModule, string> = {
  HOUSEKEEPING: "Governança (Housekeeping)",
  BOOKING_REVIEWS: "Reviews",
  MAINTENANCE: "Upkeep (Manutenção)",
};

const SLUG_TO_MODULE: Record<string, SuiteModule> = Object.entries(
  MODULE_SLUGS,
).reduce((acc, [module, slug]) => {
  acc[slug] = module as SuiteModule;
  return acc;
}, {} as Record<string, SuiteModule>);

export function moduleSlugToModule(slug: string): SuiteModule | undefined {
  return SLUG_TO_MODULE[slug];
}

export function moduleToSlug(module: SuiteModule): string {
  return MODULE_SLUGS[module];
}
