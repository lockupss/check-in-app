// Conditional import to handle build-time issues
let PrismaClient: any;
try {
  const prismaModule = require('@prisma/client');
  PrismaClient = prismaModule.PrismaClient;
} catch (error) {
  console.warn('Prisma client not available during build');
  PrismaClient = null;
}

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: any;
}

// Create a mock Prisma client for build time
const createMockPrismaClient = () => {
  return {
    user: {
      findUnique: async () => null,
      findMany: async () => [],
      create: async () => ({}),
      update: async () => ({}),
      upsert: async () => ({}),
      count: async () => 0,
    },
    register: {
      findUnique: async () => null,
      findMany: async () => [],
      create: async () => ({}),
      update: async () => ({}),
      count: async () => 0,
    },
    $queryRaw: async () => [],
    $disconnect: async () => {},
  } as any;
};

// Only create real Prisma client if DATABASE_URL is available and we're not in build mode
const createPrismaClient = () => {
  // If PrismaClient is not available, return mock client
  if (!PrismaClient) {
    console.warn('PrismaClient not available, using mock client');
    return createMockPrismaClient();
  }
  
  // During build time, return mock client
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found during build, using mock Prisma client');
    return createMockPrismaClient();
  }
  
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found, using mock Prisma client');
    return createMockPrismaClient();
  }
  
  try {
    return new PrismaClient();
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    return createMockPrismaClient();
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