import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Use raw PrismaClient (no extension) to avoid circular dependency with tenant context
const rawPrisma = new PrismaClient();

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    try {
        const tenant = await rawPrisma.tenant.findUnique({
            where: { slug },
            select: {
                id: true,
                isActive: true,
                plan: true,
                subscriptions: {
                    select: { status: true, paidUntil: true },
                },
            },
        });

        if (!tenant) {
            return NextResponse.json({ tenantId: null, isActive: false }, { status: 404 });
        }

        const sub = tenant.subscriptions?.length > 0 ? tenant.subscriptions[0] : null;

        return NextResponse.json({
            tenantId: tenant.id,
            isActive: tenant.isActive,
            plan: tenant.plan,
            subscriptionStatus: sub?.status || 'pending',
            paidUntil: sub?.paidUntil?.toISOString() || null,
        });
    } catch (error) {
        console.error('[Tenant Resolve]', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
