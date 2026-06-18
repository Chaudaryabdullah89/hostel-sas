import { PrismaClient } from "@prisma/client";

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
                    } catch (e) {
                        // Ignore: not in a Next.js request context (e.g., CLI seeds, tests, cron)
                    }

                    if (!tenantId) {
                        return query(args);
                    }

                    // Enforce tenantId isolation based on operation type
                    if (['findFirst', 'findMany', 'count', 'aggregate', 'groupBy'].includes(operation)) {
                        args.where = { ...args.where, tenantId };
                    } else if (operation === 'findUnique') {
                        // Convert findUnique to findFirst on the base client to avoid unique index validation errors
                        const newArgs = { ...args };
                        newArgs.where = { ...newArgs.where, tenantId };
                        const prismaModelName = model.charAt(0).toLowerCase() + model.slice(1);
                        return (basePrisma as any)[prismaModelName].findFirst(newArgs);
                    } else if (['update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
                        args.where = { ...args.where, tenantId };
                    } else if (operation === 'create') {
                        args.data = { ...args.data, tenantId };
                    } else if (operation === 'createMany') {
                        if (Array.isArray(args.data)) {
                            args.data = args.data.map((item: any) => ({ ...item, tenantId }));
                        } else if (args.data) {
                            args.data.tenantId = tenantId;
                        }
                    } else if (operation === 'upsert') {
                        args.where = { ...args.where, tenantId };
                        args.create = { ...args.create, tenantId };
                        args.update = { ...args.update, tenantId };
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