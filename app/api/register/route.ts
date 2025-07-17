import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { name, userId, laptopBrand } = body;

  if (!name || !userId || !laptopBrand) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }

  const exists = await prisma.register.findUnique({ where: { userId } });
  if (exists) {
    return NextResponse.json({ error: 'User ID already exists' }, { status: 400 });
  }

  const reg = await prisma.register.create({ data: { name, userId, laptopBrand } });
  return NextResponse.json(reg);
}
