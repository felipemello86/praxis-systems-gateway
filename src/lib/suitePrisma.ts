import { SuiteCorePrismaClient } from "@operacao-hoteleira/suite-core";

// Singleton (mesmo padrão usado em housekeeping/booking-reviews/maintenance)
// pra não abrir uma conexão nova a cada hot-reload em dev.
const globalForPrisma = globalThis as unknown as {
  suitePrisma: SuiteCorePrismaClient | undefined;
};

export const suitePrisma =
  globalForPrisma.suitePrisma ?? new SuiteCorePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.suitePrisma = suitePrisma;
}
