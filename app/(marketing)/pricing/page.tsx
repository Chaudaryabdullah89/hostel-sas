"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Building2, ArrowRight, Menu, X, CheckCircle2, HelpCircle, ChevronDown, ChevronUp,
  Zap, Rocket, Crown, DollarSign, Star, ShieldCheck, Clock, Award
} from "lucide-react";

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Testimonials", href: "/#testimonials" },
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
            <Link key={l.label} href={l.href} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
              {l.label}
            </Link>
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
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block text-slate-300 py-2 text-sm font-medium">
              {l.label}
            </Link>
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

// ── FAQ Item Component ───────────────────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-2 focus:outline-none group"
      >
        <span className="text-white font-semibold text-base group-hover:text-indigo-400 transition-colors">
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-indigo-400 shrink-0 ml-4" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500 group-hover:text-white shrink-0 ml-4" />
        )}
      </button>
      {isOpen && (
        <p className="text-slate-400 text-sm leading-relaxed mt-2 pb-2 pr-6 animate-in fade-in slide-in-from-top-1 duration-200">
          {answer}
        </p>
      )}
    </div>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
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

// ── Main Page Component ──────────────────────────────────────────────────────
export default function StandalonePricingPage() {
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

  const faqs = [
    {
      question: "Is there a free trial?",
      answer: "Yes! We offer a 14-day free trial on all plans. No credit card or payment info is required to sign up. You can explore all features of your chosen plan immediately."
    },
    {
      question: "How do I pay after my trial ends?",
      answer: "We support easy manual bank transfers. You can transfer your monthly fee to our HBL Account (01234567890123). Once done, upload the receipt or share it with our support team, and your subscription will be activated within hours."
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Absolutely. You can change your subscription tier anytime from the 'Subscription' section in your Admin Dashboard. If you upgrade, the new limits take effect instantly."
    },
    {
      question: "What happens if I exceed my room or hostel limits?",
      answer: "If you try to add more hostels or rooms than your current plan allows, you will be prompted to upgrade to a higher tier. Feel free to contact our sales team if you need custom limits."
    },
    {
      question: "Is my hostel's data safe with you?",
      answer: "Data security is our top priority. We use strict database isolation, secure session tokens (JWT + Passkey authentication), and daily encrypted backups to ensure your business and resident details remain confidential."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar />

      {/* Header Section */}
      <section className="relative pt-32 pb-20 flex flex-col items-center text-center px-6 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-slate-950" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <DollarSign className="w-3.5 h-3.5" />
            Simple & Transparent
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Choose the Perfect Plan for{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Your Hostel
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Get started in minutes with our 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.key}
                className={`relative rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between ${
                  plan.highlight
                    ? "bg-gradient-to-b from-indigo-600/20 to-violet-600/10 border-2 border-indigo-500/40 shadow-2xl shadow-indigo-500/10"
                    : "bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-900/60"
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r ${plan.gradient} text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg`}>
                    {plan.badge}
                  </div>
                )}

                <div>
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
                </div>

                <Link
                  href={`/register?plan=${plan.key}`}
                  className={`w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    plan.highlight
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-indigo-500/25 animate-pulse"
                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Bank Transfer Box */}
        <div className="mt-8 text-center p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl max-w-4xl mx-auto">
          <p className="text-indigo-400/90 text-sm">
            🛡️ Safe and simple activation via bank transfer to HBL Account <strong className="text-indigo-300">01234567890123</strong>. Send payment confirmation to <strong className="text-indigo-300">billing@portalhms.com</strong> or your account manager.
          </p>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28 w-full">
        <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-12 uppercase tracking-wide">
          Compare Plan Features
        </h2>
        <div className="overflow-x-auto border border-white/5 rounded-3xl bg-slate-900/20 backdrop-blur-xl">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/40">
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400">Features</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 text-center">Starter</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 text-center">Growth</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: "Hostels", starter: "1 Hostel", growth: "3 Hostels", enterprise: "20 Hostels" },
                { name: "Rooms Limit", starter: "Up to 30 Rooms", growth: "Up to 100 Rooms", enterprise: "Up to 999 Rooms" },
                { name: "Staff Users", starter: "5 Users", growth: "15 Users", enterprise: "99 Users" },
                { name: "Multi-tenant Subdomain", starter: "Yes", growth: "Yes", enterprise: "Yes" },
                { name: "Rent & Financials", starter: "Yes", growth: "Yes", enterprise: "Yes" },
                { name: "Complaints & Maintenance", starter: "Yes", growth: "Yes", enterprise: "Yes" },
                { name: "Mess & Service Logs", starter: "Yes", growth: "Yes", enterprise: "Yes" },
                { name: "AI Assistant Integration", starter: "No", growth: "Yes", enterprise: "Yes" },
                { name: "Weekly Automated Backups", starter: "Yes", growth: "Yes", enterprise: "Yes" },
                { name: "Custom Branding & Colors", starter: "No", growth: "No", enterprise: "Yes" },
                { name: "Support Channels", starter: "Email Support", growth: "Priority Email/Chat", enterprise: "24/7 Dedicated Support" }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-5 text-sm font-semibold text-white">{row.name}</td>
                  <td className="p-5 text-sm text-slate-400 text-center font-medium">{row.starter}</td>
                  <td className="p-5 text-sm text-indigo-400 text-center font-bold">{row.growth}</td>
                  <td className="p-5 text-sm text-slate-400 text-center font-medium">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28 w-full">
        <h2 className="text-3xl font-black text-white text-center mb-4 tracking-tight">
          Pricing FAQ
        </h2>
        <p className="text-slate-500 text-sm text-center mb-12">
          Got questions about billing, payment methods, or plans? We've got answers.
        </p>

        <div className="bg-slate-900/20 border border-white/5 rounded-3xl p-6 md:p-8 space-y-2">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950 py-24 text-center px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Ready to Take Control of Your Hostel?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Choose a plan, launch your workspace, and transform your daily management operations today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/25"
            >
              <Rocket className="w-4.5 h-4.5" /> Start Free Trial
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto h-14 px-8 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
