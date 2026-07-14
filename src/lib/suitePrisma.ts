// Client gerado localmente (../../prisma/schema.prisma), não mais importado
// de @operacao-hoteleira/suite-core — ver comentário em prisma/schema.prisma.
import { PrismaClient } from "../../generated";

// Singleton (mesmo padrão usado em housekeeping/booking-reviews/maintenance)
// pra não abrir uma conexão nova a cada hot-reload em dev.
const globalForPrisma = globalThis as unknown as {
  suitePrisma: PrismaClient | undefined;
};

export const suitePrisma =
  globalForPrisma.suitePrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.suitePrisma = suitePrisma;
}
