const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const slug = "janat";
  console.log(`Resolving slug "${slug}"...`);
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  });
  if (!tenant) {
    console.error("Tenant not found in DB");
    return;
  }
  const tenantId = tenant.id;
  console.log(`Tenant ID: ${tenantId}`);

  console.log("Fetching subscription and counts...");
  const [tenantInfo, subscription, counts] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, slug: true, plan: true, isActive: true, createdAt: true },
    }),
    prisma.subscription.findUnique({ where: { tenantId } }),
    Promise.all([
      prisma.room.count({ where: { tenantId } }),
      prisma.hostel.count({ where: { tenantId } }),
      prisma.user.count({ where: { tenantId, isActive: true } }),
      prisma.booking.count({ where: { tenantId } }),
    ]),
  ]);

  console.log("Tenant info:", tenantInfo);
  console.log("Subscription:", subscription);
  console.log("Counts:", counts);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
