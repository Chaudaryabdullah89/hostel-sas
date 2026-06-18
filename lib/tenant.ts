import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const rawPrisma = new PrismaClient();

const getBaseDomain = () => {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'portalhms.com';
  return base.replace(/^https?:\/\//, '').split(':')[0];
};

const baseDomain = getBaseDomain();

const ROOT_HOSTNAMES = new Set([
  baseDomain,
  `www.${baseDomain}`,
  'localhost',
  '127.0.0.1',
]);

export function extractTenantSlug(host: string | null): string | null {
  if (!host) return null;
  const cleanHost = host.split(':')[0];
  if (ROOT_HOSTNAMES.has(cleanHost)) return null;
  if (cleanHost.endsWith('.localhost')) {
    return cleanHost.replace('.localhost', '');
  }
  if (cleanHost.endsWith(`.${baseDomain}`)) {
    return cleanHost.replace(`.${baseDomain}`, '');
  }
  return null;
}

const slugToIdCache = new Map<string, string>();

export async function getTenantIdFromSlug(slug: string): Promise<string | null> {
  if (slugToIdCache.has(slug)) {
    return slugToIdCache.get(slug) || null;
  }
  try {
    const tenant = await rawPrisma.tenant.findUnique({
      where: { slug },
      select: { id: true }
    });
    if (tenant) {
      slugToIdCache.set(slug, tenant.id);
      return tenant.id;
    }
  } catch (err) {
    console.error("[Tenant Helper] Error resolving tenant from slug:", err);
  }
  return null;
}

/**
 * Resolve tenant ID dynamically, falling back to Host header subdomain lookup
 */
export async function getCurrentTenantId(): Promise<string | null> {
  try {
    const headersList = await headers();
    let tenantId = headersList.get('x-tenant-id');
    console.log(`[getCurrentTenantId] Header x-tenant-id:`, tenantId);
    if (tenantId) return tenantId;

    const host = headersList.get('host');
    const slug = extractTenantSlug(host);
    console.log(`[getCurrentTenantId] Host: ${host}, Slug: ${slug}`);
    if (slug) {
      const resolved = await getTenantIdFromSlug(slug);
      console.log(`[getCurrentTenantId] Resolved tenantId:`, resolved);
      return resolved;
    }
  } catch (e: any) {
    console.error(`[getCurrentTenantId] Error:`, e.message);
  }
  return null;
}

/**
 * Get the current tenant from the request context.
 */
export async function getCurrentTenant() {
  const tenantId = await getCurrentTenantId();
  if (!tenantId) return null;

  let tenantSlug = null;
  try {
    const headersList = await headers();
    tenantSlug = headersList.get('x-tenant-slug');
    if (!tenantSlug) {
      tenantSlug = extractTenantSlug(headersList.get('host'));
    }
  } catch {}

  return { tenantId, tenantSlug };
}

/**
 * Require tenant context — throws a Response if not found.
 */
export async function requireTenant() {
  const tenant = await getCurrentTenant();
  if (!tenant?.tenantId) {
    throw new Response(JSON.stringify({ success: false, error: 'Tenant context not found.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return tenant;
}

/**
 * Fetch full tenant record by slug.
 */
export async function getTenantBySlug(slug: string) {
  return rawPrisma.tenant.findUnique({
    where: { slug, isActive: true },
    include: { subscriptions: true },
  });
}

/**
 * Fetch full tenant record by ID.
 */
export async function getTenantById(id: string) {
  return rawPrisma.tenant.findUnique({
    where: { id },
    include: { subscriptions: true },
  });
}
