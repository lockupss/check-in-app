// auth.config.ts
//commit1: Configuration for NextAuth authentication

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [],
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth }: { auth: any }) {
      return !!auth?.user;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        // Ensure uppercase role
        token.role = user.role?.toUpperCase() || "USER";
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token.role) {
        // Ensure session role is uppercase
        session.user.role = token.role.toUpperCase();
      }
      return session;
    },
  },
};