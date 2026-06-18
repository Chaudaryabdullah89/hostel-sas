import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/apiResponse";
import { isServiceEnabled } from "@/lib/permissions";

const LATE_FEE_AMOUNT = 500; // Fixed late fee amount. Could be moved to SystemSettings in the future.

export async function GET(request: NextRequest) {
    // ── 1. Secure the Cron Route ─────────────────────────────────────────
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return errorResponse("Unauthorized cron trigger", 401);
    }

    // ── 2. Check System Settings ─────────────────────────────────────────
    const autoGenerateRentInvoices = await isServiceEnabled("autoGenerateRentInvoices");
    if (!autoGenerateRentInvoices) {
        return successResponse({ message: "Automated billing is disabled. Skipping late fees." });
    }

    try {
        const currentDate = new Date();
        const monthIndex = currentDate.getMonth(); 
        const year = currentDate.getFullYear();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const currentMonthName = monthNames[monthIndex];

        // ── 3. Find Overdue Payments (queries globally since no x-tenant-id header in cron context) ──
        const overduePayments = await prisma.payment.findMany({
            where: {
                type: "MONTHLY_RENT",
                status: "PENDING",
                dueDate: { lte: currentDate }, // Due date has passed
                month: currentMonthName,
                year: year
            },
            include: { User: true }
        });

        // Group overdue payments by tenantId
        const paymentsByTenant: Record<string, typeof overduePayments> = {};
        for (const payment of overduePayments) {
            if (!paymentsByTenant[payment.tenantId]) {
                paymentsByTenant[payment.tenantId] = [];
            }
            paymentsByTenant[payment.tenantId].push(payment);
        }

        let totalGeneratedCount = 0;

        // ── 4. Generate Late Fees per Tenant ──────────────────────────────────
        for (const [tenantId, tenantPayments] of Object.entries(paymentsByTenant)) {
            const logs: any[] = [];
            let generatedCount = 0;

            for (const payment of tenantPayments) {
                // Check if a late fee was already generated for this specific rent payment
                const existingLateFee = await prisma.payment.findFirst({
                    where: {
                        tenantId: tenantId,
                        userId: payment.userId,
                        bookingId: payment.bookingId,
                        type: "LATE_FEE",
                        month: currentMonthName,
                        year: year
                    }
                });

                if (!existingLateFee) {
                    // Update original payment status to OVERDUE
                    await prisma.payment.update({
                        where: { id: payment.id },
                        data: { status: "OVERDUE" }
                    });

                    // Create new late fee payment
                    await prisma.payment.create({
                        data: {
                            tenantId: tenantId,
                            userId: payment.userId,
                            bookingId: payment.bookingId,
                            amount: LATE_FEE_AMOUNT,
                            type: "LATE_FEE",
                            status: "PENDING",
                            month: currentMonthName,
                            year: year,
                            notes: `Late fee for overdue ${currentMonthName} ${year} rent`
                        }
                    });

                    logs.push({ userId: payment.userId, email: payment.User.email, originalPaymentId: payment.id });
                    generatedCount++;
                    totalGeneratedCount++;
                }
            }

            // Save Billing Log for this tenant
            if (generatedCount > 0) {
                await prisma.billingLog.create({
                    data: {
                        tenantId: tenantId,
                        month: monthIndex + 1,
                        year: year,
                        type: "LATE_FEES",
                        status: "SUCCESS",
                        logs: JSON.stringify({ generatedCount, details: logs })
                    }
                });
            }
        }

        return successResponse({
            message: `Successfully generated ${totalGeneratedCount} late fees for ${currentMonthName} ${year}`,
            generatedCount: totalGeneratedCount
        });

    } catch (error: any) {
        console.error("[CRON] /api/cron/late-fees - Error:", error);

        // Fetch all active tenants to log the failure if possible
        try {
            const tenants = await prisma.tenant.findMany({ where: { isActive: true } });
            for (const t of tenants) {
                await prisma.billingLog.create({
                    data: {
                        tenantId: t.id,
                        month: new Date().getMonth() + 1,
                        year: new Date().getFullYear(),
                        type: "LATE_FEES",
                        status: "FAILED",
                        logs: JSON.stringify({ error: error.message || "Unknown error" })
                    }
                });
            }
        } catch (dbErr) {
            console.error("[CRON] /api/cron/late-fees - Failed to write error billing logs:", dbErr);
        }

        return errorResponse("Failed to process late fees.", 500);
    }
}
