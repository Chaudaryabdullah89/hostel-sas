import { PrismaClient } from "@prisma/client";

const ROOT_HOSTNAMES = new Set([
    'portalhms.com',
    'www.portalhms.com',
    'localhost',
    '127.0.0.1',
]);

function extractTenantSlug(host: string | null): string | null {
    if (!host) return null;
    const cleanHost = host.split(':')[0];
    if (ROOT_HOSTNAMES.has(cleanHost)) return null;
    if (cleanHost.endsWith('.localhost')) {
        return cleanHost.replace('.localhost', '');
    }
    if (cleanHost.endsWith('.portalhms.com')) {
        return cleanHost.replace('.portalhms.com', '');
    }
    return null;
}

const slugToIdCache = new Map<string, string>();

async function getTenantIdFromSlug(slug: string, basePrisma: any): Promise<string | null> {
    if (slugToIdCache.has(slug)) {
        return slugToIdCache.get(slug) || null;
    }
    try {
        const tenant = await basePrisma.tenant.findUnique({
            where: { slug },
            select: { id: true }
        });
        if (tenant) {
            slugToIdCache.set(slug, tenant.id);
            return tenant.id;
        }
    } catch (err) {
        console.error("[Prisma Extension] Error resolving tenant from slug:", err);
    }
    return null;
}

const prismaClientSingleton = () => {
    const basePrisma = new PrismaClient();

    return basePrisma.$extends({
        query: {
            $allModels: {
                async $allOperations({ model, operation, args, query }) {
                    // Exclude Tenant, Subscription, OtpVerification, ResetPassword, BillingLog
                    if (['Tenant', 'Subscription', 'OtpVerification', 'ResetPassword'].includes(model)) {
                        return query(args);
                    }

                    let tenantId: string | null = null;
                    try {
                        const { headers } = await import('next/headers');
                        const headersList = await headers();
                        tenantId = headersList.get('x-tenant-id');
                        
                        if (!tenantId) {
                            const host = headersList.get('host');
                            const slug = extractTenantSlug(host);
                            if (slug) {
                                tenantId = await getTenantIdFromSlug(slug, basePrisma);
                            }
                        }
                    } catch (e) {
                        // Ignore: not in a Next.js request context (e.g., CLI seeds, tests, cron)
                    }

                    if (!tenantId) {
                        return query(args);
                    }

                    // Enforce tenantId isolation based on operation type
                    if (['findFirst', 'findMany', 'count', 'aggregate', 'groupBy'].includes(operation)) {
                        (args as any).where = { ...(args as any).where, tenantId };
                    } else if (operation === 'findUnique') {
                        // Convert findUnique to findFirst on the base client to avoid unique index validation errors
                        const newArgs = { ...args } as any;
                        newArgs.where = { ...newArgs.where, tenantId };
                        const prismaModelName = model.charAt(0).toLowerCase() + model.slice(1);
                        return (basePrisma as any)[prismaModelName].findFirst(newArgs);
                    } else if (['update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
                        (args as any).where = { ...(args as any).where, tenantId };
                    } else if (operation === 'create') {
                        args.data = { ...args.data, tenantId } as any;
                    } else if (operation === 'createMany') {
                        if (Array.isArray(args.data)) {
                            args.data = args.data.map((item: any) => ({ ...item, tenantId })) as any;
                        } else if (args.data) {
                            (args.data as any).tenantId = tenantId;
                        }
                    } else if (operation === 'upsert') {
                        args.where = { ...args.where, tenantId } as any;
                        args.create = { ...args.create, tenantId } as any;
                        args.update = { ...args.update, tenantId } as any;
                    }

                    return query(args);
                }
            }
        }
    });
};

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma as any;

export default prisma;