#!/usr/bin/env node
const path = require('path');
const cwd = path.resolve(__dirname, '..');
process.chdir(cwd);

async function main() {
  try {
    const bcrypt = require('bcryptjs');
    const { getPrisma } = require('../lib/prisma');

    const prisma = getPrisma();
    if (!prisma) {
      console.error('Prisma client not available. Ensure DATABASE_URL is set and run `npx prisma generate` and `npx prisma db push` if needed.');
      process.exitCode = 2;
      return;
    }

    const email = 'nineninekome@gmail.com';
    const rawPassword = 'berehanu123tolosa';
    const hashed = await bcrypt.hash(rawPassword, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashed, role: 'admin', name: email.split('@')[0] },
      create: { email, password: hashed, role: 'admin', name: email.split('@')[0] },
    });

    console.log('Upserted admin user:', { id: user.id, email: user.email, role: user.role });
    process.exitCode = 0;
  } catch (err) {
    console.error('Failed to create admin user:', err && (err.stack || err.message || err));
    process.exitCode = 1;
  }
}

main();
