import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const rawPrisma = new PrismaClient();

function checkSuperAdmin(request: NextRequest): boolean {
  const key = request.headers.get("x-super-admin-key");
  return key === process.env.SUPER_ADMIN_KEY;
}

// PATCH: Update subscription (activate, expire, change plan, toggle tenant active, update custom limits)
export async function PATCH(request: NextRequest) {
  if (!checkSuperAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      tenantId,
      action,
      plan,
      paidUntilDays,
      paidUntilDate,
      isActive,
      maxRoomsOverride,
      maxUsersOverride,
      maxHostelsOverride,
      aiFeatureBypass,
      smtpFeatureBypass,
      status,
    } = body;

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
    }

    const tenant = await rawPrisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    if (action === "activate") {
      // Activate subscription for N days or custom date
      let paidUntil: Date;
      if (paidUntilDate) {
        paidUntil = new Date(paidUntilDate);
      } else {
        const days = paidUntilDays || 30;
        paidUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }
      const updatedPlan = plan || tenant.plan;

      await rawPrisma.$transaction([
        rawPrisma.tenant.update({
          where: { id: tenantId },
          data: { plan: updatedPlan, isActive: true },
        }),
        rawPrisma.subscription.upsert({
          where: { tenantId },
          update: { status: "active", paidUntil, plan: updatedPlan },
          create: { tenantId, plan: updatedPlan, status: "active", paidUntil },
        }),
      ]);

      return NextResponse.json({ success: true, message: `Subscription activated until ${paidUntil.toLocaleDateString()}.` });
    }

    if (action === "update") {
      const updateData: any = {};
      if (plan) updateData.plan = plan;
      if (status) updateData.status = status;
      if (paidUntilDate) updateData.paidUntil = new Date(paidUntilDate);
      
      updateData.maxRoomsOverride = maxRoomsOverride === null || maxRoomsOverride === "" ? null : Number(maxRoomsOverride);
      updateData.maxUsersOverride = maxUsersOverride === null || maxUsersOverride === "" ? null : Number(maxUsersOverride);
      updateData.maxHostelsOverride = maxHostelsOverride === null || maxHostelsOverride === "" ? null : Number(maxHostelsOverride);
      
      if (aiFeatureBypass !== undefined) updateData.aiFeatureBypass = Boolean(aiFeatureBypass);
      if (smtpFeatureBypass !== undefined) updateData.smtpFeatureBypass = Boolean(smtpFeatureBypass);

      const tenantData: any = {};
      if (plan) tenantData.plan = plan;
      if (isActive !== undefined) tenantData.isActive = Boolean(isActive);

      await rawPrisma.$transaction([
        rawPrisma.tenant.update({
          where: { id: tenantId },
          data: tenantData,
        }),
        rawPrisma.subscription.upsert({
          where: { tenantId },
          update: { ...updateData },
          create: {
            tenantId,
            plan: plan || tenant.plan,
            status: status || "active",
            paidUntil: paidUntilDate ? new Date(paidUntilDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            ...updateData,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: "Tenant configuration and limits updated successfully." });
    }

    if (action === "expire") {
      await rawPrisma.subscription.update({
        where: { tenantId },
        data: { status: "expired", paidUntil: new Date() },
      });
      return NextResponse.json({ success: true, message: "Subscription expired." });
    }

    if (action === "toggle_active") {
      await rawPrisma.tenant.update({
        where: { id: tenantId },
        data: { isActive: isActive ?? !tenant.isActive },
      });
      return NextResponse.json({ success: true, message: "Tenant status updated." });
    }

    if (action === "change_plan") {
      if (!plan) return NextResponse.json({ error: "plan is required" }, { status: 400 });
      await rawPrisma.$transaction([
        rawPrisma.tenant.update({ where: { id: tenantId }, data: { plan } }),
        rawPrisma.subscription.update({ where: { tenantId }, data: { plan } }),
      ]);
      return NextResponse.json({ success: true, message: `Plan changed to ${plan}.` });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("[SuperAdmin/Subscription PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
