import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id: string;
      email: string;
      name: string;
      role: string;
    };

    const { id, email, name, role } = body;

    if (!id || !email || !name) {
      return NextResponse.json(
        { error: 'id, email and name are required' },
        { status: 400 }
      );
    }

    const normalizedRole = role?.toUpperCase() as Role;
    const validRoles: Role[] = [Role.CANDIDATE, Role.EMPLOYER, Role.ADMIN];
    const userRole = validRoles.includes(normalizedRole)
      ? normalizedRole
      : Role.CANDIDATE;

    const user = await prisma.user.upsert({
      where: { id },
      update: { name, role: userRole },
      create: { id, email, name, role: userRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('[POST /api/auth/signup]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
