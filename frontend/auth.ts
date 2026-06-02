import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const credentialsSchema = z.object({
  phone: z.string().length(10),
  otp:   z.string(),
  role:  z.enum(['CANDIDATE', 'EMPLOYER']),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt', maxAge: 7200 }, // 2-hour inactivity expiry; not persisted across dev restarts
  providers: [
    Credentials({
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        otp:   { label: 'OTP',   type: 'text' },
        role:  { label: 'Role',  type: 'text' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // Fixed demo OTP
        if (parsed.data.otp !== '123456') return null;

        let user = await prisma.phoneUser.findFirst({
          where: { phone: parsed.data.phone },
          include: { employer: true, candidate: true },
        });

        // Auto-create on first login — any phone + 123456 always works
        if (!user) {
          user = await prisma.phoneUser.create({
            data: {
              name:  parsed.data.phone, // user can update from profile
              phone: parsed.data.phone,
              role:  parsed.data.role,
              ...(parsed.data.role === 'CANDIDATE' && { candidate: { create: {} } }),
              ...(parsed.data.role === 'EMPLOYER'  && {
                employer: {
                  create: {
                    companyName: 'My Company',
                    industry:    'Technology',
                    location:    'India',
                  },
                },
              }),
            },
            include: { employer: true, candidate: true },
          });
        }

        return {
          id:          user.id,
          name:        user.name,
          email:       user.phone, // NextAuth requires email field; we use phone
          phone:       user.phone,
          role:        user.role,
          companyName: user.employer?.companyName ?? null,
          industry:    user.employer?.industry    ?? null,
          location:    user.employer?.location    ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id          = user.id;
        token.name        = user.name; // explicit — default next-auth propagation is unreliable in v5 beta
        token.phone       = (user as Record<string, unknown>).phone as string;
        token.role        = (user as Record<string, unknown>).role  as string;
        token.companyName = (user as Record<string, unknown>).companyName as string | null;
        token.industry    = (user as Record<string, unknown>).industry    as string | null;
        token.location    = (user as Record<string, unknown>).location    as string | null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id          = token.id          as string;
      session.user.name        = token.name        as string; // carry stored name into session
      session.user.phone       = token.phone       as string;
      session.user.role        = token.role        as string;
      session.user.companyName = token.companyName as string | null;
      session.user.industry    = token.industry    as string | null;
      session.user.location    = token.location    as string | null;
      return session;
    },
  },
  pages: { signIn: '/' },
});
