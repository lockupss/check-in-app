import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { userId } = await req.json();
  const reg = await prisma.register.update({
    where: { userId },
    data: { outTime: new Date() },
  });
  return NextResponse.json(reg);
}
