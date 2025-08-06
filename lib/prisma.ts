// Only import PrismaClient at runtime, not during build
let prisma: any = null;

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: any;
}

// Create Prisma client only when needed (runtime)
const getPrismaClient = () => {
  if (prisma) return prisma;
  
  // Only create client if we're not in build mode and DATABASE_URL exists
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not available, skipping Prisma client creation');
    return null;
  }
  
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not available, skipping Prisma client creation');
    return null;
  }
  
  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    
    if (process.env.NODE_ENV !== 'production') {
      global.prisma = prisma;
    }
    
    return prisma;
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    return null;
  }
};

// Export a function that returns the client
export const getPrisma = () => getPrismaClient();

// For backward compatibility, export a default that might be null
export default getPrismaClient();