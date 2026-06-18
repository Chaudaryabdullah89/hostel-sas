import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ===============================
// Route Permissions (RBAC)
// ===============================
const routePermissions: Record<string, string[]> = {
    '/admin': ['ADMIN'],
    '/staff': ['STAFF', 'WARDEN', 'ADMIN'],
    '/warden': ['WARDEN', 'ADMIN'],
    '/guest': ['GUEST', 'RESIDENT', 'ADMIN', 'WARDEN', 'STAFF'],
};

// ===============================
// Root domains — resolved dynamically from base url
// ===============================
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

// ===============================
// Helper: Match Protected Route
// ===============================
function matchProtectedRoute(pathname: string) {
    const routes = Object.keys(routePermissions).sort(
        (a, b) => b.length - a.length // longest first
    );

    return routes.find(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );
}

// ===============================
// Helper: Extract Tenant Slug
// ===============================
function extractTenantSlug(hostname: string): string | null {
    // Strip port (e.g., localhost:3000)
    const host = hostname.split(':')[0];

    // Root domains → no tenant
    if (ROOT_HOSTNAMES.has(host)) return null;

    // Local dev: slug.localhost → slug
    if (host.endsWith('.localhost')) {
        return host.replace('.localhost', '');
    }

    // Production: slug.customdomain.com → slug
    if (host.endsWith(`.${baseDomain}`)) {
        return host.replace(`.${baseDomain}`, '');
    }

    return null;
}

// ===============================
// Middleware
// ===============================
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Build request headers we'll forward
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);

    // ─── 1️⃣ Tenant Resolution via subdomain ─────────────────────────────────
    const tenantSlug = extractTenantSlug(hostname);

    if (tenantSlug) {
        // Resolve tenant from DB via an internal API route so we stay edge-compatible
        // We pass slug in header; the Prisma extension reads x-tenant-id
        // Here we do a lightweight fetch to resolve slug → id
        try {
            const tenantRes = await fetch(
                `${request.nextUrl.origin}/api/tenant/resolve?slug=${tenantSlug}`,
                { headers: { 'x-internal-call': '1' } }
            );
            if (tenantRes.ok) {
                const { tenantId, isActive, paidUntil } = await tenantRes.json();
                if (tenantId && isActive) {
                    requestHeaders.set('x-tenant-slug', tenantSlug);
                    requestHeaders.set('x-tenant-id', tenantId);
                    if (paidUntil) {
                        requestHeaders.set('x-subscription-expiry', paidUntil);
                    }
                } else {
                    // Unknown / inactive tenant → redirect to registration
                    const rootUrl = request.nextUrl.origin.includes('localhost')
                        ? 'http://localhost:3000'
                        : 'https://portalhms.com';
                    return NextResponse.redirect(new URL(`${rootUrl}/register`));
                }
            } else {
                const rootUrl = request.nextUrl.origin.includes('localhost')
                    ? 'http://localhost:3000'
                    : 'https://portalhms.com';
                return NextResponse.redirect(new URL(`${rootUrl}/register`));
            }
        } catch {
            // Edge: if fetch fails, still try to proceed (avoid hard 500 on cold start)
        }
    }

    // ─── 2️⃣ Skip non-page paths ─────────────────────────────────────────────
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/superadmin') ||  // Super admin has its own auth
        pathname.startsWith('/subscription-expired') ||
        pathname.includes('.')
    ) {
        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    }

    const matchedRoute = matchProtectedRoute(pathname);

    // If route is not protected → allow
    if (!matchedRoute) {
        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    }

    // ─── 3️⃣ Check JWT token ─────────────────────────────────────────────────
    const token = request.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }

    let userRole: string | null = null;
    let jwtTenantId: string | null = null;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (typeof payload.role === 'string') userRole = payload.role;
        if (typeof payload.tenantId === 'string') jwtTenantId = payload.tenantId;
    } catch (error) {
        console.error('JWT verification failed:', error);

        const response = NextResponse.redirect(
            new URL('/auth/login?reason=expired', request.url)
        );
        response.cookies.set({
            name: 'token',
            value: '',
            maxAge: 0,
            path: '/',
            expires: new Date(0),
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });
        return response;
    }

    if (!userRole) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // ─── 4️⃣ Tenant isolation from JWT ───────────────────────────────────────
    // If we have a tenantId in the JWT and a subdomain tenant, make sure they match
    const resolvedTenantId = requestHeaders.get('x-tenant-id');
    if (jwtTenantId && resolvedTenantId && jwtTenantId !== resolvedTenantId) {
        // User belongs to a different tenant — reject
        return NextResponse.redirect(new URL('/auth/login?reason=tenant_mismatch', request.url));
    }

    // If no x-tenant-id set yet (root domain login), inject from JWT
    if (!resolvedTenantId && jwtTenantId) {
        requestHeaders.set('x-tenant-id', jwtTenantId);
    }

    // ─── 5️⃣ RBAC check ─────────────────────────────────────────────────────
    const allowedRoles = routePermissions[matchedRoute];

    if (!allowedRoles.includes(userRole)) {
        const roleDashboardMap: Record<string, string> = {
            ADMIN: '/admin/dashboard',
            WARDEN: '/warden',
            STAFF: '/staff/dashboard',
            GUEST: '/guest/dashboard',
            RESIDENT: '/guest/dashboard',
        };

        const redirectPath = roleDashboardMap[userRole] || '/auth/login';
        return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // ─── 6️⃣ Subscription expiry check (non-blocking soft check via header) ───
    // We store subscription expiry date in the tenant resolve response
    // and enforce only for admin/warden/staff routes (not subscription page itself)
    const subExpiry = requestHeaders.get('x-subscription-expiry');
    const isSubscriptionPage = pathname.includes('/subscription') || pathname.includes('/profile');
    if (
        subExpiry &&
        !isSubscriptionPage &&
        userRole === 'ADMIN' &&
        new Date(subExpiry) < new Date()
    ) {
        return NextResponse.redirect(new URL('/subscription-expired', request.url));
    }

    return NextResponse.next({
        request: { headers: requestHeaders },
    });
}

// ===============================
// Matcher
// ===============================
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
