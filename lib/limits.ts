import { PrismaClient } from '@prisma/client';

// Raw client to bypass tenant extension (needed for cross-tenant admin operations)
const rawPrisma = new PrismaClient();

// ─── Plan Definitions ──────────────────────────────────────────────────────────
export const PLAN_LIMITS = {
  starter: {
    maxRooms: 30,
    maxUsers: 5,
    maxHostels: 1,
    ai: false,
    label: 'Starter',
    price: 2999, // PKR/month
    description: 'Perfect for a single hostel just getting started.',
  },
  growth: {
    maxRooms: 100,
    maxUsers: 15,
    maxHostels: 3,
    ai: true,
    label: 'Growth',
    price: 6999,
    description: 'For growing hostels that need more rooms and AI features.',
  },
  enterprise: {
    maxRooms: 999,
    maxUsers: 99,
    maxHostels: 20,
    ai: true,
    label: 'Enterprise',
    price: 14999,
    description: 'For large hostel chains with unlimited capacity.',
  },
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Get the plan limits for a given tenant.
 */
export async function getTenantPlan(tenantId: string): Promise<PlanKey> {
  const tenant = await rawPrisma.tenant.findUnique({
    where: { id: tenantId },
    select: { plan: true },
  });
  const plan = (tenant?.plan ?? 'starter') as PlanKey;
  return PLAN_LIMITS[plan] ? plan : 'starter';
}

/**
 * Check if the tenant can add another room.
 * Returns { allowed: boolean, current: number, max: number }
 */
export async function canAddRoom(tenantId: string) {
  const plan = await getTenantPlan(tenantId);
  const sub = await rawPrisma.subscription.findUnique({
    where: { tenantId },
    select: { maxRoomsOverride: true },
  });

  const limit = sub?.maxRoomsOverride ?? PLAN_LIMITS[plan].maxRooms;
  const current = await rawPrisma.room.count({ where: { tenantId } });

  return {
    allowed: current < limit,
    current,
    max: limit,
    plan,
    isOverridden: sub?.maxRoomsOverride !== null && sub?.maxRoomsOverride !== undefined,
  };
}

/**
 * Check if the tenant can add another user.
 */
export async function canAddUser(tenantId: string) {
  const plan = await getTenantPlan(tenantId);
  const sub = await rawPrisma.subscription.findUnique({
    where: { tenantId },
    select: { maxUsersOverride: true },
  });

  const limit = sub?.maxUsersOverride ?? PLAN_LIMITS[plan].maxUsers;
  const current = await rawPrisma.user.count({
    where: { tenantId, isActive: true },
  });

  return {
    allowed: current < limit,
    current,
    max: limit,
    plan,
    isOverridden: sub?.maxUsersOverride !== null && sub?.maxUsersOverride !== undefined,
  };
}

/**
 * Check if the tenant can add another hostel.
 */
export async function canAddHostel(tenantId: string) {
  const plan = await getTenantPlan(tenantId);
  const sub = await rawPrisma.subscription.findUnique({
    where: { tenantId },
    select: { maxHostelsOverride: true },
  });

  const limit = sub?.maxHostelsOverride ?? PLAN_LIMITS[plan].maxHostels;
  const current = await rawPrisma.hostel.count({ where: { tenantId } });

  return {
    allowed: current < limit,
    current,
    max: limit,
    plan,
    isOverridden: sub?.maxHostelsOverride !== null && sub?.maxHostelsOverride !== undefined,
  };
}

/**
 * Check if AI features are available for this tenant's plan.
 */
export async function canUseAI(tenantId: string): Promise<boolean> {
  const plan = await getTenantPlan(tenantId);
  const sub = await rawPrisma.subscription.findUnique({
    where: { tenantId },
    select: { aiFeatureBypass: true },
  });

  if (sub?.aiFeatureBypass) return true;
  return PLAN_LIMITS[plan].ai;
}

/**
 * Check if the tenant subscription is still active (not expired).
 */
export async function isSubscriptionActive(tenantId: string): Promise<boolean> {
  const sub = await rawPrisma.subscription.findUnique({
    where: { tenantId },
    select: { status: true, paidUntil: true },
  });
  if (!sub) return false;
  if (sub.status === 'expired') return false;
  return sub.paidUntil > new Date();
}
