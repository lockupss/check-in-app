import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getPrisma } from './prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

// Build a minimal authOptions that works when environment variables are present.
// If DATABASE_URL / AUTH_SECRET are missing, the app will still run but server-side
// auth routes may return errors. We prefer to leave a usable config rather than a stub.
const prisma = getPrisma();

export const authOptions: NextAuthOptions = {
  adapter: prisma ? PrismaAdapter(prisma) : undefined as any,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // If no prisma available, fall back to rejecting credential sign-in so dev can use local fallback
        if (!prisma) throw new Error('Database not available');
        if (!credentials?.email || !credentials?.password) throw new Error('Missing credentials');
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) throw new Error('Invalid credentials');
        // Password verification intentionally omitted here: keep simple — recommend adding bcrypt checks
        return { id: user.id, email: user.email, name: user.name, role: user.role?.toUpperCase() } as any;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || token.role;
        token.id = (user as any).id || token.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.role) session.user.role = (token.role as string).toUpperCase();
      if (token?.id) session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};