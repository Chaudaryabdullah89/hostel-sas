const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      tenant: true
    }
  });
  console.log('Total Users:', users.length);
  for (const u of users) {
    console.log(`User: ${u.name}, Email: ${u.email}, Role: ${u.role}, Tenant: ${u.tenant.name} (${u.tenant.slug})`);
    const match = await bcrypt.compare('password123', u.password);
    console.log(`  Password 'password123' match:`, match);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
