"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Zap,
  Rocket,
  Crown,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Users,
  BedDouble,
  Brain,
} from "lucide-react";

const PLANS = [
  {
    key: "starter",
    label: "Starter",
    price: "2,999",
    icon: Zap,
    color: "from-slate-500 to-slate-700",
    border: "border-slate-300 dark:border-slate-600",
    active: "border-slate-900 dark:border-slate-300 ring-2 ring-slate-900/20 dark:ring-slate-300/20",
    badge: null,
    features: ["30 Rooms", "1 Hostel", "5 Users", "Basic Reports", "Email Support"],
    limits: { rooms: 30, hostels: 1, users: 5 },
    ai: false,
  },
  {
    key: "growth",
    label: "Growth",
    price: "6,999",
    icon: Rocket,
    color: "from-blue-500 to-indigo-600",
    border: "border-blue-300 dark:border-blue-600",
    active: "border-blue-600 dark:border-blue-400 ring-2 ring-blue-500/30",
    badge: "Most Popular",
    features: ["100 Rooms", "3 Hostels", "15 Users", "AI Assistant", "Priority Support"],
    limits: { rooms: 100, hostels: 3, users: 15 },
    ai: true,
  },
  {
    key: "enterprise",
    label: "Enterprise",
    price: "14,999",
    icon: Crown,
    color: "from-amber-500 to-orange-600",
    border: "border-amber-300 dark:border-amber-600",
    active: "border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/30",
    badge: "Best Value",
    features: ["Unlimited Rooms", "20 Hostels", "99 Users", "AI + Analytics", "Dedicated Support"],
    limits: { rooms: 999, hostels: 20, users: 99 },
    ai: true,
  },
];

const STEPS = ["Hostel Details", "Choose Plan", "Admin Account"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ url: string; slug: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    hostelName: "",
    city: "",
    phone: "",
    plan: "growth",
    email: "",
    password: "",
  });

  const update = (key: string, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.hostelName.trim()) return "Please enter your hostel name.";
      if (form.hostelName.trim().length < 3) return "Hostel name must be at least 3 characters.";
    }
    if (step === 2) {
      if (!form.email || !form.email.includes("@")) return "Please enter a valid email address.";
      if (!form.password || form.password.length < 8) return "Password must be at least 8 characters.";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }
      setSuccess({ url: data.url, slug: data.slug });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = PLANS.find((p) => p.key === form.plan)!;

  // ── Success State ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/30 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">You&apos;re All Set! 🎉</h1>
          <p className="text-slate-400 text-lg mb-8">
            Your hostel management portal is ready. Your 14-day trial has started.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
            <p className="text-slate-400 text-sm mb-1">Your Portal URL</p>
            <a
              href={success.url}
              className="text-indigo-400 font-mono text-lg font-semibold hover:text-indigo-300 break-all"
            >
              {success.url}
            </a>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-slate-400 text-sm">
                💡 <strong className="text-white">Payment:</strong> To activate after trial, transfer to{" "}
                <strong className="text-white">HBL Account: 01234567890123</strong> (Portal HMS) and contact support.
              </p>
            </div>
          </div>

          <a
            href={success.url}
            className="w-full inline-flex items-center justify-center gap-2 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl text-white font-semibold text-lg hover:opacity-90 transition-all shadow-xl shadow-indigo-500/30"
          >
            Go to My Portal <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12 relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">Portal HMS</span>
        </Link>

        {/* Value props */}
        <div className="space-y-8">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Run your hostel{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              smarter
            </span>
          </h2>
          <p className="text-slate-400 text-lg">
            Everything you need to manage rooms, residents, payments, and staff — in one beautiful platform.
          </p>

          <div className="space-y-5">
            {[
              { icon: BedDouble, title: "Multi-Hostel Management", desc: "Manage all your properties from a single dashboard" },
              { icon: Users, title: "Staff & Resident Tracking", desc: "Complete user management with roles and permissions" },
              { icon: Brain, title: "AI-Powered Insights", desc: "Smart analytics and predictive recommendations" },
              { icon: Sparkles, title: "14-Day Free Trial", desc: "No credit card needed. Cancel anytime." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">{title}</p>
                  <p className="text-slate-500 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-slate-300 text-sm italic">
            &ldquo;Portal HMS transformed how we manage our 3 hostels. The AI features alone saved us 10 hours a week.&rdquo;
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full" />
            <div>
              <p className="text-white text-sm font-semibold">Ahmad Raza</p>
              <p className="text-slate-500 text-xs">Owner, Shaheen Hostels — Lahore</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-lg">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    i < step
                      ? "bg-green-500 text-white"
                      : i === step
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-600/30"
                      : "bg-white/10 text-slate-500"
                  }`}
                >
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm hidden sm:block ${i === step ? "text-white font-semibold" : "text-slate-500"}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-8 sm:w-12 ${i < step ? "bg-green-500" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* ── STEP 0: Hostel Details ──────────────────────────────────── */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Tell us about your hostel</h1>
                  <p className="text-slate-400 mt-1">We&apos;ll set up your personalized portal URL.</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Hostel / Business Name *
                  </label>
                  <div className="relative mt-2">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="hostel-name"
                      type="text"
                      placeholder="e.g. Shaheen Boys Hostel"
                      value={form.hostelName}
                      onChange={(e) => update("hostelName", e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  {form.hostelName && (
                    <p className="mt-2 text-slate-500 text-xs">
                      Your URL:{" "}
                      <span className="text-indigo-400 font-mono">
                        {form.hostelName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}.portalhms.com
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">City</label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="city"
                      type="text"
                      placeholder="Lahore, Karachi, Islamabad..."
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone (optional)</label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="phone"
                      type="tel"
                      placeholder="0300-1234567"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  id="next-step-1"
                  onClick={handleNext}
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── STEP 1: Choose Plan ─────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Choose your plan</h1>
                  <p className="text-slate-400 mt-1">All plans include a 14-day free trial. PKR/month after trial.</p>
                </div>

                <div className="space-y-3">
                  {PLANS.map((plan) => {
                    const Icon = plan.icon;
                    const isSelected = form.plan === plan.key;
                    return (
                      <button
                        key={plan.key}
                        id={`plan-${plan.key}`}
                        onClick={() => update("plan", plan.key)}
                        className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 relative ${
                          isSelected ? plan.active + " bg-white/5" : plan.border + " bg-white/[0.02] hover:bg-white/5"
                        }`}
                      >
                        {plan.badge && (
                          <span className={`absolute -top-2.5 left-4 text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${plan.color}`}>
                            {plan.badge}
                          </span>
                        )}
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-white font-semibold">{plan.label}</span>
                              <span className="text-white font-bold">PKR {plan.price}<span className="text-slate-500 text-xs font-normal">/mo</span></span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                              {plan.features.slice(0, 3).map((f) => (
                                <span key={f} className="text-slate-400 text-xs">{f}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300">
                  💳 After trial: transfer PKR {selectedPlan.price}/mo to HBL Account <strong>01234567890123</strong> (Portal HMS).
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setError(""); setStep(0); }}
                    className="h-12 px-5 bg-white/5 border border-white/10 rounded-xl text-slate-300 flex items-center gap-2 hover:bg-white/10 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    id="next-step-2"
                    onClick={() => { setError(""); setStep(2); }}
                    className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Admin Account ───────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Create your admin account</h1>
                  <p className="text-slate-400 mt-1">You&apos;ll use these credentials to sign in.</p>
                </div>

                {/* Summary pill */}
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedPlan.color} flex items-center justify-center`}>
                    <selectedPlan.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <span className="text-white font-semibold">{form.hostelName}</span>
                    <span className="text-slate-500"> · </span>
                    <span className="text-slate-400">{selectedPlan.label} Plan</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address *</label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="admin-email"
                      type="email"
                      placeholder="admin@yourmail.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password *</label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      className="w-full h-12 pl-12 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password strength */}
                {form.password && (
                  <div className="space-y-1">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          form.password.length < 8 ? "w-1/4 bg-red-500"
                          : form.password.length < 12 ? "w-1/2 bg-yellow-500"
                          : "w-full bg-green-500"
                        }`}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      {form.password.length < 8 ? "Too short" : form.password.length < 12 ? "Good password" : "Strong password ✓"}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setError(""); setStep(1); }}
                    className="h-12 px-5 bg-white/5 border border-white/10 rounded-xl text-slate-300 flex items-center gap-2 hover:bg-white/10 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    id="submit-register"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Creating your portal...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Launch My Portal</>
                    )}
                  </button>
                </div>

                <p className="text-center text-slate-600 text-xs">
                  By registering you agree to our{" "}
                  <Link href="/terms-of-service" className="text-indigo-400 hover:text-indigo-300">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy-policy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>.
                </p>
              </div>
            )}
          </div>

          {/* Sign in link */}
          <p className="text-center text-slate-500 text-sm mt-6">
            Already have a hostel portal?{" "}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
