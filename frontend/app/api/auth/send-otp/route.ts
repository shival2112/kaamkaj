import { NextResponse } from 'next/server';

// Demo: no real SMS sent. OTP is always 123456.
export async function POST(req: Request) {
  const { phone } = await req.json() as { phone?: string };
  if (!phone || !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }
  console.log(`[Demo OTP] ${phone} → 123456`);
  return NextResponse.json({ ok: true, message: 'OTP sent' });
}
