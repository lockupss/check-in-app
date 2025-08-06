import { getPrisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { userId } = await req.json();
  
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  const reg = await prisma.register.update({
    where: { userId },
    data: { outTime: new Date() },
  });
  return NextResponse.json(reg);
}
