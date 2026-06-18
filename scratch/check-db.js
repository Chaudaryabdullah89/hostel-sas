const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching tenants...");
  const tenants = await prisma.tenant.findMany({
    include: {
      subscriptions: true,
      users: {
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
        }
      }
    }
  });
  console.log(JSON.stringify(tenants, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
