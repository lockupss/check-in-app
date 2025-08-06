// app/api/stats/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('start') || '');
    const endDate = new Date(searchParams.get('end') || '');

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Adjust end date to include the entire day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    // Get stats
    const totalUsers = await prisma.user.count();
    
    const checkedInToday = await prisma.register.count({
      where: {
        inTime: {
          gte: startDate,
          lte: adjustedEndDate
        }
      }
    });

    const checkedOutToday = await prisma.register.count({
      where: {
        outTime: {
          gte: startDate,
          lte: adjustedEndDate
        }
      }
    });

    // Get chart data (daily activity)
    const dailyActivity = await prisma.$queryRaw`
      SELECT 
        DATE("inTime") as date,
        COUNT(CASE WHEN "inTime" IS NOT NULL THEN 1 END) as checkIns,
        COUNT(CASE WHEN "outTime" IS NOT NULL THEN 1 END) as checkOuts
      FROM "Register"
      WHERE "inTime" >= ${startDate} AND "inTime" <= ${adjustedEndDate}
      GROUP BY DATE("inTime")
      ORDER BY DATE("inTime")
    `;

    return NextResponse.json({
      stats: {
        total: totalUsers,
        checkedInToday,
        checkedOutToday
      },
      chartData: dailyActivity
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}