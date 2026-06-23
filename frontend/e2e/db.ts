import { PrismaClient } from '@prisma/client';

// Dev/CI has no working SMTP relay (Mailtrap free tier rate-limits), so the
// real verification-link flow can't be exercised end-to-end. We have direct
// DB access in this environment, so flip the flag instead of clicking a link
// that was never delivered.
const prisma = new PrismaClient();

export async function markEmailVerified(email: string) {
  await prisma.user.update({ where: { email }, data: { emailVerified: true } });
}

export async function disconnectDb() {
  await prisma.$disconnect();
}
