import { prisma } from "./prisma";
import { hashPassword } from "./auth-utils";

const ADMIN_USERS = [
  {
    email: "nineninekome@gmail.com",
    password: "berehanu123tolosa",
    // Use uppercase role
    role: "ADMIN",
    name: "Admin One"
  },
  {
    email: "berehanutolosa@gmail.com",
    password: "berehanu123tolosa",
    // Use uppercase role
    role: "ADMIN",
    name: "Admin Two"
  },
  {
    email: "nati@gmail.com",
    password: "12345678",
    role: "ADMIN",
    name:"admin three"
  }

];

export async function seedAdminUsers() {
  for (const user of ADMIN_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        // Ensure uppercase role
        role: user.role,
        password: await hashPassword(user.password)
      },
      create: {
        email: user.email,
        name: user.name,
        password: await hashPassword(user.password),
        // Ensure uppercase role
        role: user.role
      }
    });
  }
}