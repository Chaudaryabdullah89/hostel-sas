import { hostelValidationSchema } from "@/lib/validations/schemas";
import HostelServices from "../../../../../lib/services/hostelservices/hostelservices";
import { checkRole } from "@/lib/checkRole";
import { getCurrentTenantId } from '@/lib/tenant';
import { canAddHostel } from '@/lib/limits';

const { NextResponse } = require("next/server")

export async function POST(req) {
    console.log("[API] POST /api/hostels/createhostel - Request received");

    // 1. RBAC Check
    const auth = await checkRole(['ADMIN']);
    if (!auth.success) {
        return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    try {
        const rawData = await req.json();

        // ── Plan limit check ─────────────────────────────────────────────────
        const tenantId = await getCurrentTenantId();
        if (tenantId) {
            const limitCheck = await canAddHostel(tenantId);
            if (!limitCheck.allowed) {
                return NextResponse.json({
                    success: false,
                    message: `Hostel limit reached. Your ${limitCheck.plan} plan allows up to ${limitCheck.max} hostels (currently ${limitCheck.current}). Please upgrade your plan.`,
                    limitExceeded: true,
                    current: limitCheck.current,
                    max: limitCheck.max,
                    plan: limitCheck.plan,
                }, { status: 403 });
            }
        }
        const validation = hostelValidationSchema.safeParse(rawData);

        if (!validation.success) {
            console.error("[API] POST /api/hostels/createhostel - Validation failed:", validation.error.flatten());
            return NextResponse.json({ success: false, message: "Invalid input data", errors: validation.error.flatten() }, { status: 400 });
        }

        const hostelServices = new HostelServices()
        const response = await hostelServices.createhostel(validation.data)
        return response
    } catch (error) {
        console.error("[API] POST /api/hostels/createhostel - Error parsing JSON:", error);
        return NextResponse.json({ success: false, message: "Invalid JSON format" }, { status: 400 });
    }
}