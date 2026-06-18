import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal HMS — Smart Hostel Management System",
  description:
    "The all-in-one SaaS platform for hostel owners. Manage rooms, residents, payments, complaints, and staff from one beautiful dashboard.",
  keywords: "hostel management, hostel software, PG management, Pakistan hostel system",
  openGraph: {
    title: "Portal HMS — Smart Hostel Management System",
    description: "The all-in-one SaaS platform for hostel owners.",
    type: "website",
    url: "https://portalhms.com",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
