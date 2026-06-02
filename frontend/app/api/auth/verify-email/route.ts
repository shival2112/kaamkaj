import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=invalid_token`);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
      select: { id: true, verificationExpiry: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=invalid_token`);
    }

    if (user.emailVerified) {
      return NextResponse.redirect(`${origin}/login?verified=already`);
    }

    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      return NextResponse.redirect(`${origin}/login?error=token_expired`);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    return NextResponse.redirect(`${origin}/login?verified=true`);
  } catch (error) {
    console.error('[GET /api/auth/verify-email]', error);
    return NextResponse.redirect(`${origin}/login?error=server_error`);
  }
}
