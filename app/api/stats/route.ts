// app/api/stats/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
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
    
    const checkedInToday = await prisma.attendance.count({
      where: {
        checkIn: {
          gte: startDate,
          lte: adjustedEndDate
        }
      }
    });

    const checkedOutToday = await prisma.attendance.count({
      where: {
        checkOut: {
          gte: startDate,
          lte: adjustedEndDate
        }
      }
    });

    // Get chart data (daily activity)
    const dailyActivity = await prisma.$queryRaw`
      SELECT 
        DATE(checkIn) as date,
        COUNT(CASE WHEN checkIn IS NOT NULL THEN 1 END) as checkIns,
        COUNT(CASE WHEN checkOut IS NOT NULL THEN 1 END) as checkOuts
      FROM Attendance
      WHERE checkIn >= ${startDate} AND checkIn <= ${adjustedEndDate}
      GROUP BY DATE(checkIn)
      ORDER BY DATE(checkIn)
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