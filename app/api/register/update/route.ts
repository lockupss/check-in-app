import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { originalId, id, name, userId, laptopBrand, department } = body;

    const updated = await prisma.register.update({
      where: { id: originalId }, // locate the original row
      data: {
        id, // update the ID to a new value
        name,
        userId,
        laptopBrand,
        department,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Failed to update user', { status: 500 });
  }
}
