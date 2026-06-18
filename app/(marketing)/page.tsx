"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Building2, Users, DollarSign, Bed, MessageSquare, Utensils,
  ShieldCheck, BarChart3, Zap, Rocket, Crown, CheckCircle2,
  ArrowRight, Menu, X, Brain, Globe, Star, ChevronDown,
  Sparkles, TrendingUp, Clock, Award, Play,
} from "lucide-react";

// ── Nav ──────────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-slate-950/90 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/20" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Building2 className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Portal <span className="text-indigo-400">HMS</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" className="text-slate-400 hover:text-white text-sm font-medium transition-colors px-4 py-2">
            Sign In
          </Link>
          <Link
            href="/register"
            className="h-9 px-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          >
            Start Free Trial <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-slate-950 border-t border-white/5 px-6 py-4 space-y-3">
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block text-slate-300 py-2 text-sm font-medium">
              {l.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-3">
            <Link href="/auth/login" className="text-center py-2.5 text-slate-300 text-sm font-medium border border-white/10 rounded-xl">
              Sign In
            </Link>
            <Link href="/register" className="text-center py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl">
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[700px] h-[700px] bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-slate-950" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23ffffff05%22%20stroke-width%3D%221%22%3E%3Cpath%20d%3D%22M60%200L0%200%200%2060%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          Pakistan's #1 Hostel Management Platform
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter mb-6">
          Run Your Hostel{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Smarter
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
          The all-in-one SaaS platform for hostel owners. Manage rooms, residents, 
          payments, complaints, and staff — all from one beautiful dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-base rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-3"
          >
            <Rocket className="w-5 h-5" />
            Start 14-Day Free Trial
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto h-14 px-8 bg-white/5 border border-white/10 text-white font-bold text-base rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            See Features <ChevronDown className="w-4 h-4" />
          </a>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm">
          {[
            { icon: ShieldCheck, text: "No credit card required" },
            { icon: Clock, text: "Set up in 5 minutes" },
            { icon: Award, text: "14-day free trial" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-indigo-400" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" style={{height: '100%', top: '60%'}} />
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-3xl p-2 shadow-2xl shadow-black/50 backdrop-blur-sm">
            {/* Fake browser bar */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
                {["bg-rose-500", "bg-amber-500", "bg-emerald-500"].map((c) => (
                  <div key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />
                ))}
                <div className="flex-1 bg-white/5 rounded-lg h-6 mx-4 flex items-center px-3">
                  <span className="text-slate-500 text-[10px] font-mono">portalhms.com/admin/dashboard</span>
                </div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="p-4 bg-slate-950 grid grid-cols-4 gap-3">
                {[
                  { label: "Revenue", value: "PKR 2.4M", color: "blue" },
                  { label: "Occupancy", value: "87%", color: "emerald" },
                  { label: "Residents", value: "142", color: "purple" },
                  { label: "Complaints", value: "3 Open", color: "rose" },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`bg-slate-900 border border-${color}-500/10 rounded-xl p-3`}>
                    <p className={`text-${color}-400 text-[9px] font-bold uppercase tracking-widest`}>{label}</p>
                    <p className="text-white text-sm font-black mt-1">{value}</p>
                  </div>
                ))}

                <div className="col-span-3 bg-slate-900 rounded-xl p-3 h-32 flex items-end gap-1">
                  {[40, 65, 45, 80, 70, 90, 75, 85, 60, 95, 80, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-indigo-600/30 rounded-sm relative" style={{ height: `${h}%` }}>
                      <div className="absolute bottom-0 inset-x-0 bg-indigo-500 rounded-sm" style={{ height: "30%" }} />
                    </div>
                  ))}
                </div>
                <div className="col-span-1 bg-slate-900 rounded-xl p-3 h-32 flex flex-col gap-2">
                  {["Booking #128", "Payment In", "New Room", "Complaint"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      <span className="text-slate-500 text-[9px] truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Stats Section ─────────────────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { value: "500+", label: "Hostels Using Portal HMS" },
    { value: "15,000+", label: "Residents Managed" },
    { value: "PKR 50M+", label: "Payments Processed" },
    { value: "99.9%", label: "Uptime SLA" },
  ];
  return (
    <section className="bg-slate-950 border-y border-white/5 py-16">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-4xl font-black text-white mb-2">{value}</p>
            <p className="text-slate-500 text-sm">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Features Section ──────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: Bed,
      title: "Room & Hostel Management",
      description: "Manage multiple hostels, floors, and rooms. Track occupancy, availability, and pricing in real-time.",
      color: "indigo",
      items: ["Multi-hostel support", "Room type management", "Live occupancy tracking", "Automated status sync"],
    },
    {
      icon: Users,
      title: "Resident & Staff Portals",
      description: "Dedicated portals for every role — residents, wardens, staff, and admins with granular permissions.",
      color: "violet",
      items: ["5 user roles (Admin, Warden, Staff, Resident, Guest)", "Granular permissions", "Resident self-service portal", "Staff task management"],
    },
    {
      icon: DollarSign,
      title: "Payments & Finance",
      description: "Complete financial management — rent collection, expense tracking, salary management, and refunds.",
      color: "emerald",
      items: ["Auto rent invoice generation", "Payment receipts", "Salary management", "Expense approval workflow"],
    },
    {
      icon: MessageSquare,
      title: "Complaints & Maintenance",
      description: "Streamlined complaint handling with priority levels, assignment, and resolution tracking.",
      color: "rose",
      items: ["Priority-based complaints", "Maintenance requests", "Photo attachments", "Resolution tracking"],
    },
    {
      icon: Utensils,
      title: "Mess & Services",
      description: "Manage daily mess menus, laundry, cleaning schedules, and inventory for all your hostels.",
      color: "amber",
      items: ["Weekly mess menu planner", "Laundry tracking", "Cleaning schedules", "Inventory management"],
    },
    {
      icon: Brain,
      title: "AI-Powered Assistant",
      description: "Built-in AI assistant for residents — answers hostel queries, checks schedules, and more.",
      color: "purple",
      items: ["Natural language queries", "Payment status checks", "Mess schedule lookup", "Complaint filing via chat"],
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Deep financial and operational insights. Revenue trends, occupancy charts, and custom date ranges.",
      color: "blue",
      items: ["Revenue vs expense charts", "Occupancy analytics", "PDF report generation", "Custom date ranges"],
    },
    {
      icon: ShieldCheck,
      title: "Security & Compliance",
      description: "Enterprise-grade security with JWT, 2FA, passkey authentication, and complete audit logs.",
      color: "green",
      items: ["Passkey / biometric auth", "2FA via TOTP or Email", "Session management", "Full audit trail"],
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; dot: string; border: string }> = {
    indigo: { bg: "bg-indigo-500/10", icon: "text-indigo-400", dot: "bg-indigo-400", border: "border-indigo-500/20" },
    violet: { bg: "bg-violet-500/10", icon: "text-violet-400", dot: "bg-violet-400", border: "border-violet-500/20" },
    emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-400", dot: "bg-emerald-400", border: "border-emerald-500/20" },
    rose: { bg: "bg-rose-500/10", icon: "text-rose-400", dot: "bg-rose-400", border: "border-rose-500/20" },
    amber: { bg: "bg-amber-500/10", icon: "text-amber-400", dot: "bg-amber-400", border: "border-amber-500/20" },
    purple: { bg: "bg-purple-500/10", icon: "text-purple-400", dot: "bg-purple-400", border: "border-purple-500/20" },
    blue: { bg: "bg-blue-500/10", icon: "text-blue-400", dot: "bg-blue-400", border: "border-blue-500/20" },
    green: { bg: "bg-green-500/10", icon: "text-green-400", dot: "bg-green-400", border: "border-green-500/20" },
  };

  return (
    <section id="features" className="bg-slate-950 py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Everything You Need
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            All-in-One Hostel Platform
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Stop juggling spreadsheets and WhatsApp groups. Portal HMS brings everything under one roof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => {
            const c = colorMap[feature.color];
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`bg-slate-900/50 border ${c.border} rounded-2xl p-6 hover:border-opacity-50 hover:bg-slate-900 transition-all duration-300 group`}
              >
                <div className={`w-11 h-11 ${c.bg} ${c.border} border rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <h3 className="text-white font-bold text-sm mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">{feature.description}</p>
                <ul className="space-y-1.5">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <div className={`w-1 h-1 rounded-full ${c.dot} shrink-0`} />
                      <span className="text-slate-400 text-xs">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Register Your Hostel", desc: "Sign up in 3 steps — enter hostel details, choose a plan, create your admin account. Takes less than 5 minutes.", icon: Building2 },
    { num: "02", title: "Complete Onboarding", desc: "Our guided wizard helps you add rooms, invite wardens, and configure your hostel settings perfectly.", icon: Sparkles },
    { num: "03", title: "Go Live", desc: "Share your unique portal URL with residents. They can book rooms, pay rent, and raise complaints instantly.", icon: Globe },
    { num: "04", title: "Manage & Grow", desc: "Use analytics to optimize occupancy, track revenue, and expand to multiple hostels as your business grows.", icon: TrendingUp },
  ];

  return (
    <section className="bg-gradient-to-b from-slate-950 to-slate-900 py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Up and Running in Minutes
          </h2>
          <p className="text-slate-400 text-lg">No complicated setup. No technical knowledge required.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%-12px)] w-full h-px bg-gradient-to-r from-indigo-500/30 to-transparent z-0" />
                )}
                <div className="relative z-10 bg-slate-900 border border-white/5 rounded-2xl p-6 hover:border-indigo-500/20 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl font-black text-indigo-500/20">{step.num}</span>
                  </div>
                  <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Pricing Section ───────────────────────────────────────────────────────────
function PricingSection() {
  const plans = [
    {
      key: "starter",
      label: "Starter",
      price: "2,999",
      icon: Zap,
      gradient: "from-slate-600 to-slate-700",
      highlight: false,
      description: "Perfect for a single hostel just getting started.",
      features: [
        "1 Hostel",
        "Up to 30 Rooms",
        "5 Staff Users",
        "Basic Reports",
        "Room & Booking Management",
        "Complaint System",
        "Email Support",
      ],
    },
    {
      key: "growth",
      label: "Growth",
      price: "6,999",
      icon: Rocket,
      gradient: "from-indigo-600 to-violet-600",
      highlight: true,
      badge: "Most Popular",
      description: "For growing hostels that need more capacity and AI features.",
      features: [
        "3 Hostels",
        "Up to 100 Rooms",
        "15 Staff Users",
        "AI Assistant",
        "Advanced Analytics",
        "Full Finance Module",
        "Priority Support",
      ],
    },
    {
      key: "enterprise",
      label: "Enterprise",
      price: "14,999",
      icon: Crown,
      gradient: "from-amber-500 to-orange-600",
      highlight: false,
      badge: "Best Value",
      description: "For large hostel chains with unlimited scale.",
      features: [
        "20 Hostels",
        "Up to 999 Rooms",
        "99 Staff Users",
        "AI + Predictive Analytics",
        "Custom Branding",
        "Audit Logs",
        "Dedicated Support",
      ],
    },
  ];

  return (
    <section id="pricing" className="bg-slate-900 py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
            Simple Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Transparent Pricing in PKR
          </h2>
          <p className="text-slate-400 text-lg">14-day free trial. No credit card required. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.key}
                className={`relative rounded-3xl p-8 transition-all duration-300 ${
                  plan.highlight
                    ? "bg-gradient-to-b from-indigo-600/20 to-violet-600/10 border-2 border-indigo-500/40 shadow-2xl shadow-indigo-500/10"
                    : "bg-slate-950/50 border border-white/5 hover:border-white/10"
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r ${plan.gradient} text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg`}>
                    {plan.badge}
                  </div>
                )}

                <div className={`w-12 h-12 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-white font-bold text-xl mb-1">{plan.label}</h3>
                <p className="text-slate-500 text-sm mb-6">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-4xl font-black text-white">PKR {plan.price}</span>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-indigo-400" : "text-slate-500"}`} />
                      <span className="text-slate-300 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?plan=${plan.key}`}
                  className={`w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    plan.highlight
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-indigo-500/25"
                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Payment Note */}
        <div className="mt-8 text-center p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
          <p className="text-amber-400/80 text-sm">
            💳 After 14-day trial, activate via bank transfer to HBL Account <strong className="text-amber-300">01234567890123</strong> (Portal HMS). Contact support to activate.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Portal HMS transformed how we manage our 3 hostels. The AI features alone saved us 10 hours a week. Highly recommended!",
      name: "Ahmad Raza",
      role: "Owner, Shaheen Hostels — Lahore",
      rating: 5,
    },
    {
      quote: "Finally a system built for Pakistani hostel owners! The mess menu, complaint system, and payment tracking work perfectly.",
      name: "Fatima Malik",
      role: "Manager, Green Valley Girls Hostel — Islamabad",
      rating: 5,
    },
    {
      quote: "Our residents love the self-service portal. They can pay rent, check the mess schedule, and raise complaints without calling us.",
      name: "Hassan Qureshi",
      role: "Director, Prime Student Hostels — Karachi",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="bg-slate-950 py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            5-Star Reviews
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Loved by Hostel Owners
          </h2>
          <p className="text-slate-400 text-lg">Don't just take our word for it.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-slate-900 border border-white/5 rounded-3xl p-8 hover:border-indigo-500/20 transition-all">
              <div className="flex gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950 py-28">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/30">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
          Ready to Modernize Your Hostel?
        </h2>
        <p className="text-slate-400 text-xl mb-10 max-w-2xl mx-auto">
          Join hundreds of hostel owners who've switched to Portal HMS. Start your free 14-day trial today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto h-14 px-10 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg rounded-2xl hover:opacity-90 transition-all shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-3"
          >
            <Rocket className="w-5 h-5" />
            Start Free Trial
          </Link>
          <Link
            href="/auth/login"
            className="w-full sm:w-auto h-14 px-10 bg-white/5 border border-white/15 text-white font-bold text-lg rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center"
          >
            Sign In to Existing Portal
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">Portal HMS</span>
          </div>
          <div className="flex items-center gap-8 text-slate-500 text-sm">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            <a href="mailto:support@portalhms.com" className="hover:text-white transition-colors">Support</a>
          </div>
          <p className="text-slate-600 text-sm">© 2025 Portal HMS. Made for Pakistan 🇵🇰</p>
        </div>
      </div>
    </footer>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
