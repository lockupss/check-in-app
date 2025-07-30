// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "nineninekome@gmail.com";
  const password = await bcrypt.hash("berehanu123tolosa", 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Berehanu Tolosa",
      password,
      role: "ADMIN",
    },
  });

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });