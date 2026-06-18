import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal HMS — Super Admin",
  robots: "noindex, nofollow",
};

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
