//commit1: NextAuth configuration for authentication
// This file sets up the NextAuth handler for authentication routes
import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };