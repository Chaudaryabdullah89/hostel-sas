import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const rawPrisma = new PrismaClient();

// Super Admin auth check — uses env var secret key
function checkSuperAdmin(request: NextRequest): boolean {
  const key = request.headers.get("x-super-admin-key");
  return key === process.env.SUPER_ADMIN_KEY;
}

export async function GET(request: NextRequest) {
  if (!checkSuperAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all tenants with their subscription and usage stats
    const tenants = await rawPrisma.tenant.findMany({
      include: {
        subscriptions: true,
        _count: {
          select: {
            users: true,
            hostels: true,
            rooms: true,
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = tenants.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      plan: t.plan,
      isActive: t.isActive,
      createdAt: t.createdAt,
      subscription: t.subscriptions?.length > 0
        ? {
            status: t.subscriptions[0].status,
            paidUntil: t.subscriptions[0].paidUntil,
            plan: t.subscriptions[0].plan,
          }
        : null,
      stats: {
        users: t._count.users,
        hostels: t._count.hostels,
        rooms: t._count.rooms,
        bookings: t._count.bookings,
      },
    }));

    return NextResponse.json({ success: true, tenants: data });
  } catch (error: any) {
    console.error("[SuperAdmin/Tenants GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
