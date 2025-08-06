import { getPrisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  const all = await prisma.register.findMany();
  return NextResponse.json(all);
}
