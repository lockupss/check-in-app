import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  try {
    await prisma.register.delete({
      where: { userId },
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    return new NextResponse('Error deleting record', { status: 500 });
  }
}
