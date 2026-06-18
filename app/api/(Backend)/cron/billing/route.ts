import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/apiResponse";
import { isServiceEnabled } from "@/lib/permissions"; // Assuming it checks SystemSettings

export async function GET(request: NextRequest) {
    // ── 1. Secure the Cron Route ─────────────────────────────────────────
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return errorResponse("Unauthorized cron trigger", 401);
    }

    // ── 2. Check System Settings ─────────────────────────────────────────
    const autoGenerateRentInvoices = await isServiceEnabled("autoGenerateRentInvoices");
    if (!autoGenerateRentInvoices) {
        return successResponse({ message: "Automated billing is disabled in System Settings. Skipping." });
    }

    try {
        const currentDate = new Date();
        const monthIndex = currentDate.getMonth(); // 0 = Jan, 1 = Feb
        const year = currentDate.getFullYear();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const currentMonthName = monthNames[monthIndex];

        // ── 3. Find Active Bookings (queries globally since no x-tenant-id header in cron context) ──
        const activeBookings = await prisma.booking.findMany({
            where: {
                status: { in: ["CONFIRMED", "CHECKED_IN"] },
                monthlyRent: { gt: 0 }
            },
            include: { User: true }
        });

        // Group bookings by tenantId
        const bookingsByTenant: Record<string, typeof activeBookings> = {};
        for (const booking of activeBookings) {
            if (!bookingsByTenant[booking.tenantId]) {
                bookingsByTenant[booking.tenantId] = [];
            }
            bookingsByTenant[booking.tenantId].push(booking);
        }

        let totalGeneratedCount = 0;

        // ── 4. Generate Invoices per Tenant ─────────────────────────────────────
        for (const [tenantId, tenantBookings] of Object.entries(bookingsByTenant)) {
            const logs: any[] = [];
            let generatedCount = 0;

            for (const booking of tenantBookings) {
                // Check if payment already exists for this month/year to prevent duplicates
                const existingPayment = await prisma.payment.findFirst({
                    where: {
                        tenantId: tenantId,
                        userId: booking.userId,
                        bookingId: booking.id,
                        type: "MONTHLY_RENT",
                        month: currentMonthName,
                        year: year
                    }
                });

                if (!existingPayment) {
                    // Calculate due date (10th of the current month)
                    const dueDate = new Date(year, monthIndex, 10);

                    await prisma.payment.create({
                        data: {
                            tenantId: tenantId,
                            userId: booking.userId,
                            bookingId: booking.id,
                            amount: booking.monthlyRent || 0,
                            type: "MONTHLY_RENT",
                            status: "PENDING",
                            month: currentMonthName,
                            year: year,
                            dueDate: dueDate,
                            notes: `Automated rent generation for ${currentMonthName} ${year}`
                        }
                    });

                    logs.push({ userId: booking.userId, email: booking.User.email, amount: booking.monthlyRent });
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
                        type: "MONTHLY_RENT",
                        status: "SUCCESS",
                        logs: JSON.stringify({ generatedCount, details: logs })
                    }
                });
            }
        }

        return successResponse({
            message: `Successfully generated ${totalGeneratedCount} rent invoices for ${currentMonthName} ${year}`,
            generatedCount: totalGeneratedCount
        });

    } catch (error: any) {
        console.error("[CRON] /api/cron/billing - Error:", error);

        // Fetch all active tenants to log the failure if possible
        try {
            const tenants = await prisma.tenant.findMany({ where: { isActive: true } });
            for (const t of tenants) {
                await prisma.billingLog.create({
                    data: {
                        tenantId: t.id,
                        month: new Date().getMonth() + 1,
                        year: new Date().getFullYear(),
                        type: "MONTHLY_RENT",
                        status: "FAILED",
                        logs: JSON.stringify({ error: error.message || "Unknown error" })
                    }
                });
            }
        } catch (dbErr) {
            console.error("[CRON] /api/cron/billing - Failed to write error billing logs:", dbErr);
        }

        return errorResponse("Failed to run automated billing.", 500);
    }
}
