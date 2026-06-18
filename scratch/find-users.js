const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      tenant: { select: { slug: true } }
    }
  });
  console.log("All users in DB:", JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
