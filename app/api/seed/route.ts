import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-utils';

export async function GET() {
  // Block in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Seed endpoint disabled in production' },
      { status: 403 }
    );
  }

  try {
    // Admin users to seed
    const adminUsers = [
      {
        email: 'nineninekome@gmail.com',
        password: 'berehanu123tolosa', // Change to a secure password
        name: 'Admin One',
        role: 'ADMIN'
      },
      {
        email: 'berehanutolosa@gmail.com',
        password: 'berehanu123tolosa', // Change to a secure password
        name: 'Admin Two',
        role: 'ADMIN'
      }
    ];

    // Seed each admin user
    const results = await Promise.all(
      adminUsers.map(async (user) => {
        const hashedPassword = await hashPassword(user.password);
        
        return prisma.user.upsert({
          where: { email: user.email },
          update: {
            role: user.role as 'ADMIN' | 'USER',
            password: hashedPassword
          },
          create: {
            email: user.email,
            name: user.name,
            password: hashedPassword,
            role: user.role as 'ADMIN' | 'USER'
          }
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Admin users seeded successfully',
      users: results.map(u => ({
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt
      }))
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed admin users',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}