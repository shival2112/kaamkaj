import { PrismaClient, Prisma } from '@prisma/client';

// The Supabase pooler (Supavisor/PgBouncer) drops idle connections after a
// while; Prisma's engine doesn't validate a pooled connection before reuse,
// so the next query fails with P1017 ("Server has closed the connection") or
// P1001 even though the DB itself is healthy. Retrying once recovers cleanly
// since the engine reconnects on the next attempt.
const RETRYABLE_CODES = new Set(['P1017', 'P1001']);
const MAX_ATTEMPTS = 3;

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

  // middleware.ts runs in the Edge Runtime, where @prisma/client substitutes
  // a stub whose proxy throws on ANY property access — including `$use`
  // itself. Accessing it here would crash every request through middleware,
  // so the retry middleware must only be attached outside edge.
  if (process.env.NEXT_RUNTIME === 'edge') return client;

  // $use (rather than $extends) keeps the client's TypeScript surface as a
  // plain PrismaClient, since $extends produces a derived type whose
  // overload sets don't line up with PrismaClient's for some methods
  // (e.g. groupBy), breaking callers across the codebase.
  client.$use(async (params, next) => {
    for (let attempt = 1; ; attempt++) {
      try {
        return await next(params);
      } catch (error) {
        const retryable =
          error instanceof Prisma.PrismaClientInitializationError ||
          (error instanceof Prisma.PrismaClientKnownRequestError &&
            RETRYABLE_CODES.has(error.code));
        if (!retryable || attempt >= MAX_ATTEMPTS) throw error;
        await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
      }
    }
  });

  return client;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Prevent multiple instances in dev due to HMR
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
