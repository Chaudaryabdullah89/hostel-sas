import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { jwtVerify } from "jose";

import { getCurrentTenantId } from "@/lib/tenant";

// Import the landing page to render it directly
import LandingPage from "./(marketing)/page";

export default async function Home() {
  // Check if user is logged in — redirect to their dashboard
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token && process.env.JWT_SECRET) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;

      const roleRedirects: Record<string, string> = {
        ADMIN: "/admin/dashboard",
        WARDEN: "/warden",
        STAFF: "/staff/dashboard",
        RESIDENT: "/guest/dashboard",
        GUEST: "/guest/dashboard",
      };

      redirect(roleRedirects[role] || "/admin/dashboard");
    } catch {
      // Invalid token — show landing page
    }
  }

  // Check if this is a tenant subdomain — redirect to login
  const tenantId = await getCurrentTenantId();
  if (tenantId) {
    redirect("/auth/login");
  }

  // Render the landing page
  return <LandingPage />;
}
