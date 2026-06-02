import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const candidateSchema = z.object({
  name:  z.string().min(2, 'Name required'),
  phone: z.string().length(10, 'Enter valid 10-digit phone'),
  role:  z.literal('CANDIDATE'),
});

const employerSchema = z.object({
  name:        z.string().min(2, 'Name required'),
  phone:       z.string().length(10, 'Enter valid 10-digit phone'),
  role:        z.literal('EMPLOYER'),
  companyName: z.string().min(2, 'Company name required'),
  industry:    z.string().min(1, 'Industry required'),
  location:    z.string().min(2, 'Location required'),
});

const schema = z.discriminatedUnion('role', [candidateSchema, employerSchema]);

export async function POST(req: Request) {
  try {
    const body = await req.json() as unknown;
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { error: first?.message ?? 'Invalid data' },
        { status: 400 }
      );
    }

    const existing = await prisma.phoneUser.findUnique({
      where: { phone: parsed.data.phone },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const data = parsed.data;

    await prisma.phoneUser.create({
      data: {
        name:  data.name,
        phone: data.phone,
        role:  data.role,
        ...(data.role === 'CANDIDATE' && {
          candidate: { create: {} },
        }),
        ...(data.role === 'EMPLOYER' && {
          employer: {
            create: {
              companyName: (data as { companyName: string }).companyName,
              industry:    (data as { industry: string }).industry,
              location:    (data as { location: string }).location,
            },
          },
        }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[POST /api/auth/phone-register]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
