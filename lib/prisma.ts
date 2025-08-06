import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Only create Prisma client if DATABASE_URL is available
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found, skipping Prisma client creation');
    return null;
  }
  
  try {
    return new PrismaClient();
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    return null;
  }
};

const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Named export
export { prisma };

// Default export (for compatibility)
export default prisma;