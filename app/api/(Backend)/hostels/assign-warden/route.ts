import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/checkRole";

// POST: Assign a warden to a hostel
export async function POST(request: NextRequest) {
  const auth = await checkRole();
  if (!auth.success || !["ADMIN"].includes(auth.user?.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { hostelId, wardenId, action } = await request.json(); // action: "assign" | "unassign"

    if (!hostelId) {
      return NextResponse.json({ error: "hostelId is required" }, { status: 400 });
    }

    if (action === "unassign") {
      // Clear the manager assignment and remove hostelId from warden
      await prisma.hostel.update({
        where: { id: hostelId },
        data: { managerId: null },
      });
      // Remove hostelId from the warden user
      if (wardenId) {
        await prisma.user.update({
          where: { id: wardenId },
          data: { hostelId: null },
        });
      }
      return NextResponse.json({ success: true, message: "Warden unassigned" });
    }

    // action === "assign"
    if (!wardenId) {
      return NextResponse.json({ error: "wardenId is required" }, { status: 400 });
    }

    // Verify warden exists and belongs to this tenant
    const warden = await prisma.user.findFirst({
      where: { id: wardenId, role: "WARDEN" },
    });
    if (!warden) {
      return NextResponse.json({ error: "Warden not found" }, { status: 404 });
    }

    // Update hostel manager and warden's assigned hostel
    await Promise.all([
      prisma.hostel.update({
        where: { id: hostelId },
        data: { managerId: wardenId },
      }),
      prisma.user.update({
        where: { id: wardenId },
        data: { hostelId },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Warden assigned successfully" });
  } catch (error: any) {
    console.error("[Assign Warden]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
