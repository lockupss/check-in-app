import { getPrisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request, {
  params,
}: {
  params: { userId: string };
}) {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }

  const reg = await prisma.register.delete({
    where: { userId: params.userId },
  });
  return NextResponse.json(reg);
}
