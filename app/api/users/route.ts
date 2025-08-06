import { NextResponse } from 'next/server';

export async function GET() {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }

  const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations'];
  const statuses = ['checked-in', 'checked-out', 'absent'];
  const laptopBrands = ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus'];

  const mockUsers = Array.from({ length: 25 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      id: `user-${i + 1}`,
      name: `User ${i + 1}`,
      userId: `ID${String(i + 1).padStart(3, '0')}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      laptopBrand: laptopBrands[Math.floor(Math.random() * laptopBrands.length)],
      inTime: status === 'checked-in' ? new Date().toISOString() : undefined,
      outTime: status === 'checked-out' ? new Date().toISOString() : undefined,
    };
  });

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(mockUsers);
}