import { requireAuth } from '@/lib/apiAuth';
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import RoomServices from "../../../../../lib/services/roomservices/roomservices";
import { errorResponse } from '@/lib/apiResponse';
import { canAddRoom } from '@/lib/limits';
import { getCurrentTenantId } from '@/lib/tenant';

export async function POST(req) {
    const auth = await requireAuth();
    if (!auth.success) return errorResponse(auth.error, auth.status);

    try {
        const body = await req.json();

        // ── Plan limit check ─────────────────────────────────────────────────
        const tenantId = await getCurrentTenantId();
        if (tenantId) {
            const limitCheck = await canAddRoom(tenantId);
            if (!limitCheck.allowed) {
                return NextResponse.json({
                    success: false,
                    error: `Room limit reached. Your ${limitCheck.plan} plan allows up to ${limitCheck.max} rooms (currently ${limitCheck.current}). Please upgrade your plan.`,
                    limitExceeded: true,
                    current: limitCheck.current,
                    max: limitCheck.max,
                    plan: limitCheck.plan,
                }, { status: 403 });
            }
        }

        // Security: Wardens can ONLY create rooms in their assigned hostel
        if (auth.user.role === 'WARDEN') {
            let wardenHostelId = auth.user.hostelId;
            if (!wardenHostelId) {
                const wardenProfile = await prisma.user.findUnique({
                    where: { id: auth.user.userId || auth.user.id },
                    select: { hostelId: true }
                });
                wardenHostelId = wardenProfile?.hostelId;
            }

            if (!body.hostelId || body.hostelId !== wardenHostelId) {
                return NextResponse.json({ success: false, error: "Access Denied: You cannot create rooms in other hostels." }, { status: 403 });
            }
        }

        const room = await new RoomServices().createRoom(body)
        return NextResponse.json({
            message: "Room created successfully",
            data: room,
            success: true
        })
    } catch (error) {
        console.error("POST Create Room Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}