import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Optional: Type the payload for clarity
interface CheckinPayload {
  userId: string;
}

export async function POST(req: Request) {
  try {
    // Parse request
    const { userId }: CheckinPayload = await req.json();

    // Validate input
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing userId' },
        { status: 400 }
      );
    }

    // Ensure user exists
    const existingUser = await prisma.register.findUnique({ where: { userId } });
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update check-in time
    const updated = await prisma.register.update({
      where: { userId },
      data: { inTime: new Date() },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[CHECK-IN ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
