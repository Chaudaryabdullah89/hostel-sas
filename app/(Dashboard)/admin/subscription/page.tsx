"use client";
import { useEffect, useState } from "react";
import {
  Crown, Zap, Rocket, CheckCircle2, Clock, AlertCircle,
  Building2, Bed, Users, Calendar, CreditCard, ArrowUpRight,
  Phone, Mail, RefreshCw, TrendingUp,
} from "lucide-react";
import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";
import useAuthStore from "@/hooks/Authstate";
import axios from "axios";

const PLANS = {
  starter: {
    label: "Starter",
    icon: Zap,
    color: "from-slate-600 to-slate-700",
    price: "2,999",
    limits: { rooms: 30, hostels: 1, users: 5 },
  },
  growth: {
    label: "Growth",
    icon: Rocket,
    color: "from-indigo-600 to-violet-600",
    price: "6,999",
    limits: { rooms: 100, hostels: 3, users: 15 },
  },
  enterprise: {
    label: "Enterprise",
    icon: Crown,
    color: "from-amber-500 to-orange-600",
    price: "14,999",
    limits: { rooms: 999, hostels: 20, users: 99 },
  },
};

function UsageBar({ label, current, max, icon: Icon, color }: { label: string; current: number; max: number; icon: any; color: string }) {
  const pct = Math.min((current / max) * 100, 100);
  const isWarning = pct >= 80;
  const isCritical = pct >= 95;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="font-semibold text-gray-700">{label}</span>
        </div>
        <span className={`font-black text-sm ${isCritical ? "text-rose-600" : isWarning ? "text-amber-600" : "text-gray-900"}`}>
          {current} / {max === 999 ? "∞" : max}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isCritical ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-indigo-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isCritical && (
        <p className="text-xs text-rose-500 font-medium">⚠️ Limit almost reached — upgrade your plan</p>
      )}
    </div>
  );
}

export default function SubscriptionPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantRes, statsRes] = await Promise.all([
          axios.get("/api/tenant/subscription"),
          axios.get("/api/reports?period=month"),
        ]);
        setData({
          subscription: tenantRes.data.subscription,
          tenant: tenantRes.data.tenant,
          usage: statsRes.data?.usage || {},
        });
      } catch (err) {
        // Fallback to user auth data
        setData({
          subscription: (user as any)?.subscription,
          tenant: { name: user?.name, plan: "starter" },
          usage: {},
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const plan = user?.systemSettings?.plan || data?.tenant?.plan || "starter";
  const planInfo = PLANS[plan as keyof typeof PLANS] || PLANS.starter;
  const PlanIcon = planInfo.icon;

  const sub = data?.subscription;
  const paidUntil = sub?.paidUntil ? new Date(sub.paidUntil) : null;
  const isExpired = paidUntil ? isPast(paidUntil) : true;
  const daysLeft = paidUntil ? Math.max(0, differenceInDays(paidUntil, new Date())) : 0;
  const isTrialEnding = daysLeft <= 3 && !isExpired;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans tracking-tight">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 h-16">
        <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-indigo-600 rounded-full" />
            <div>
              <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">Subscription & Plan</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manage Your Portal HMS Plan</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Expiry Alert */}
        {(isExpired || isTrialEnding) && (
          <div className={`p-5 rounded-2xl border flex items-start gap-4 ${
            isExpired
              ? "bg-rose-50 border-rose-200"
              : "bg-amber-50 border-amber-200"
          }`}>
            <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isExpired ? "text-rose-500" : "text-amber-500"}`} />
            <div>
              <p className={`font-black text-sm ${isExpired ? "text-rose-700" : "text-amber-700"}`}>
                {isExpired ? "⚠️ Subscription Expired" : `⏰ Trial ending in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}
              </p>
              <p className={`text-sm mt-1 ${isExpired ? "text-rose-600" : "text-amber-600"}`}>
                {isExpired
                  ? "Your access to Portal HMS has been suspended. Transfer payment to reactivate."
                  : "Transfer payment before the trial ends to avoid service interruption."}
              </p>
            </div>
          </div>
        )}

        {/* Current Plan Card */}
        <div className={`bg-gradient-to-br ${planInfo.color} rounded-3xl p-8 text-white shadow-2xl`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Current Plan</p>
              <div className="flex items-center gap-3 mb-4">
                <PlanIcon className="w-8 h-8 text-white" />
                <h2 className="text-4xl font-black">{planInfo.label}</h2>
              </div>
              <p className="text-white/80 text-sm">PKR {planInfo.price} / month after trial</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${
                isExpired ? "bg-rose-500/30 text-rose-100" : "bg-white/15 text-white"
              }`}>
                <span className={`w-2 h-2 rounded-full ${isExpired ? "bg-rose-400" : "bg-emerald-400"} animate-pulse`} />
                {sub?.status === "active" ? "Active" : sub?.status === "pending" ? "Trial" : "Expired"}
              </div>
              {paidUntil && (
                <p className="text-white/50 text-xs mt-2">
                  {isExpired ? "Expired" : "Expires"} {format(paidUntil, "dd MMM yyyy")}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: "Rooms", value: `${planInfo.limits.rooms === 999 ? "∞" : planInfo.limits.rooms}`, icon: Bed },
              { label: "Hostels", value: `${planInfo.limits.hostels === 20 ? "20" : planInfo.limits.hostels}`, icon: Building2 },
              { label: "Users", value: `${planInfo.limits.users === 99 ? "99" : planInfo.limits.users}`, icon: Users },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white/10 rounded-2xl p-4 text-center">
                <Icon className="w-5 h-5 text-white/70 mx-auto mb-1" />
                <p className="text-2xl font-black">{value}</p>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Section */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Usage</h3>
            <TrendingUp className="w-5 h-5 text-gray-300" />
          </div>
          <div className="space-y-5">
            <UsageBar label="Rooms" current={data?.usage?.rooms || 0} max={planInfo.limits.rooms} icon={Bed} color="text-blue-500" />
            <UsageBar label="Hostels" current={data?.usage?.hostels || 0} max={planInfo.limits.hostels} icon={Building2} color="text-indigo-500" />
            <UsageBar label="Staff Users" current={data?.usage?.users || 0} max={planInfo.limits.users} icon={Users} color="text-violet-500" />
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-900">How to Activate / Renew</h3>
              <p className="text-amber-700 text-sm">Manual bank transfer (Pakistan)</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-amber-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Bank", value: "HBL (Habib Bank Limited)" },
                { label: "Account Number", value: "01234567890123" },
                { label: "Account Title", value: "Portal HMS Pvt Ltd" },
                { label: "IBAN", value: "PK36HABB0012345678901234" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                  <p className="text-gray-900 font-semibold mt-0.5 font-mono text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-amber-800 font-bold text-sm">Steps to activate:</p>
            {[
              "Transfer the monthly amount to the account above",
              "Take a screenshot of your transaction",
              "Send it to support with your hostel slug",
              "We'll activate within 24 hours",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 text-xs font-black shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-amber-700 text-sm">{step}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="mailto:support@portalhms.com"
              className="inline-flex items-center gap-2 h-11 px-6 bg-amber-600 text-white font-bold text-sm rounded-xl hover:bg-amber-700 transition-all"
            >
              <Mail className="w-4 h-4" /> Email Support
            </a>
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-6 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-all"
            >
              <Phone className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>

        {/* Upgrade Plans */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Upgrade Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(PLANS).map(([key, p]) => {
              const Icon = p.icon;
              const isCurrent = key === plan;
              return (
                <div
                  key={key}
                  className={`rounded-2xl border p-6 transition-all ${
                    isCurrent
                      ? "bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-100"
                      : "bg-white border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${p.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-baseline justify-between mb-1">
                    <h4 className="font-black text-gray-900">{p.label}</h4>
                    {isCurrent && <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Current</span>}
                  </div>
                  <p className="text-2xl font-black text-gray-900 mb-4">PKR {p.price}<span className="text-sm font-normal text-gray-400">/mo</span></p>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gray-300" />{p.limits.rooms === 999 ? "Unlimited" : p.limits.rooms} Rooms</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gray-300" />{p.limits.hostels} Hostel{p.limits.hostels > 1 ? "s" : ""}</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gray-300" />{p.limits.users} Users</li>
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
