// app/api/auth/signup/route.ts
//commit1: API route for user signup
// This file handles user registration and creates a new user in the database
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // Basic validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check for existing user (with error handling)
    const existingUser = await prisma.user.findUnique({
      where: { email }
    }).catch(err => {
      console.error('Database error:', err);
      throw new Error('Database operation failed');
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const hashedPassword = await hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
        // createdAt and updatedAt will be handled automatically if defined in schema
      }
    });

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        message: 'Signup failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}