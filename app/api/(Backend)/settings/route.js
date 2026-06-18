export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/lib/permissions";
import { requireAuth, requireRoles } from "@/lib/apiAuth";
import { errorResponse, successResponse } from "@/lib/apiResponse";
import { revalidateTag } from "next/cache";

export async function GET() {
    // Require authentication — system settings reveal feature flags that shouldn't be public
    const guard = await requireAuth();
    if (!guard.ok) return guard.response;

    try {
        const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
        return successResponse({
            settings: settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS,
        });
    } catch (error) {
        console.error("GET /api/settings error:", error);
        return errorResponse("Server Error", 500);
    }
}

export async function PUT(req) {
    const guard = await requireRoles(["ADMIN"]);
    if (!guard.ok) return guard.response;

    try {
        const body = await req.json();

        // Whitelist only known settings keys (prevents mass-assignment)
        const allowed = Object.keys(DEFAULT_SETTINGS);
        const data = {};
        for (const key of allowed) {
            if (key in body) {
                data[key] = body[key];
            }
        }

        if (Object.keys(data).length === 0) {
            return errorResponse("No valid settings fields provided.", 400);
        }

        // Type casting and coercion for SMTP settings
        if ('smtpPort' in data) {
            if (data.smtpPort === '' || data.smtpPort === null || data.smtpPort === undefined) {
                data.smtpPort = null;
            } else {
                data.smtpPort = parseInt(data.smtpPort, 10);
            }
        }
        if ('smtpSecure' in data) {
            data.smtpSecure = data.smtpSecure === true || data.smtpSecure === 'true';
        }

        const settings = await prisma.systemSettings.upsert({
            where: { id: "global" },
            update: data,
            create: { id: "global", ...DEFAULT_SETTINGS, ...data },
        });

        // Invalidate settings cache so changes take effect immediately
        revalidateTag("settings");

        return successResponse({ settings });
    } catch (error) {
        console.error("PUT /api/settings error:", error);
        return errorResponse("Server Error", 500);
    }
}
