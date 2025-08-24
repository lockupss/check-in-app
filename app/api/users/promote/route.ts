import { getPrisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });

  try {
    const body = await req.json();
    const { email } = body;
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    // Upsert a user and set role to admin
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: 'admin' },
      create: { email, role: 'admin', name: email.split('@')[0] },
    });

    return NextResponse.json({ ok: true, user });
  } catch (e) {
    console.error('Promote error', e);
    return new NextResponse('Failed to promote user', { status: 500 });
  }
}
