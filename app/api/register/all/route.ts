import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const all = await prisma.register.findMany();
  return NextResponse.json(all);
}
