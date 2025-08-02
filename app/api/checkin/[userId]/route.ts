import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(_: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;

    const user = await prisma.register.findUnique({ where: { userId } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.register.delete({ where: { userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
