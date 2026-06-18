import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkRole } from "@/lib/checkRole";
import { getCurrentTenantId } from "@/lib/tenant";

const rawPrisma = new PrismaClient();

export async function GET() {
  const auth = await checkRole();
  if (!auth.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tenantId = await getCurrentTenantId();

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const [tenant, subscription, counts] = await Promise.all([
      rawPrisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true, name: true, slug: true, plan: true, isActive: true, createdAt: true },
      }),
      rawPrisma.subscription.findUnique({ where: { tenantId } }),
      Promise.all([
        rawPrisma.room.count({ where: { tenantId } }),
        rawPrisma.hostel.count({ where: { tenantId } }),
        rawPrisma.user.count({ where: { tenantId, isActive: true } }),
        rawPrisma.booking.count({ where: { tenantId } }),
      ]),
    ]);

    const [rooms, hostels, users, bookings] = counts;

    return NextResponse.json({
      success: true,
      tenant,
      subscription,
      usage: { rooms, hostels, users, bookings },
    });
  } catch (error: any) {
    console.error("[Tenant Subscription]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
