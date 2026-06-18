import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

// Raw PrismaClient (no tenant extension) — needed for cross-tenant creation
const rawPrisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { hostelName, email, password, plan = 'starter', city, phone } = body;

        // ── Validation ──────────────────────────────────────────────────────
        if (!hostelName || !email || !password) {
            return NextResponse.json(
                { success: false, error: 'hostelName, email, and password are required.' },
                { status: 400 }
            );
        }
        if (password.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 8 characters.' },
                { status: 400 }
            );
        }

        // ── Generate URL slug ───────────────────────────────────────────────
        let slug = hostelName
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .slice(0, 40);

        // Ensure uniqueness — append a short random suffix if taken
        const existing = await rawPrisma.tenant.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        }

        // ── Check if email is already registered globally ───────────────────
        // Since email is now per-tenant, this check is across ALL tenants for initial admin
        const emailExists = await rawPrisma.user.findFirst({ where: { email } });
        if (emailExists) {
            return NextResponse.json(
                { success: false, error: 'This email is already registered. Please use a different email.' },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const tenantId = randomUUID();
        const userId = randomUUID();

        // ── paidUntil based on plan ─────────────────────────────────────────
        const TRIAL_DAYS: Record<string, number> = {
            starter: 14,
            growth: 14,
            enterprise: 14,
        };
        const trialDays = TRIAL_DAYS[plan] ?? 14;
        const paidUntil = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

        // ── Create Tenant + Admin + Subscription in one transaction ──────────
        await rawPrisma.$transaction(async (tx) => {
            // Create Tenant
            await tx.tenant.create({
                data: {
                    id: tenantId,
                    name: hostelName,
                    slug,
                    plan,
                    isActive: true,
                },
            });

            // Create SUPER_ADMIN user for this tenant
            await tx.user.create({
                data: {
                    id: userId,
                    tenantId,
                    name: 'Admin',
                    email,
                    password: hashedPassword,
                    role: 'ADMIN',
                    phone: phone || null,
                    isActive: true,
                    updatedAt: new Date(),
                },
            });

            // Create initial SystemSettings for this tenant
            await tx.systemSettings.create({
                data: {
                    tenantId,
                    companyName: hostelName,
                    companyShortName: hostelName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 5),
                    updatedAt: new Date(),
                },
            });

            // Create Subscription (trial — pending manual payment)
            await tx.subscription.create({
                data: {
                    tenantId,
                    plan,
                    status: 'pending',
                    paidUntil,
                },
            });
        });

        // ── Determine the tenant URL ────────────────────────────────────────
        const baseUrl = process.env.NODE_ENV === 'production'
            ? `https://${slug}.portalhms.com`
            : `http://${slug}.localhost:3000`;

        return NextResponse.json({
            success: true,
            message: 'Hostel registered successfully! Your trial period has started.',
            slug,
            url: baseUrl,
            paidUntil: paidUntil.toISOString(),
            plan,
        });
    } catch (error: any) {
        console.error('[Register Tenant]', error);
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
