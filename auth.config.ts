import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [],
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
    async jwt({ token, user }) {
      if (user) {
        // Ensure uppercase role
        token.role = user.role?.toUpperCase() || "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        // Ensure session role is uppercase
        session.user.role = token.role.toUpperCase();
      }
      return session;
    },
  },
} satisfies NextAuthConfig;