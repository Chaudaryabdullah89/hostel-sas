"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Building2, Users, Bed, Calendar, CheckCircle2, XCircle, AlertCircle,
  RefreshCw, LogOut, Shield, TrendingUp, Search, ChevronDown,
  Zap, Rocket, Crown, Clock, Eye, EyeOff, Sliders, Mail, Settings,
  Key, Check, X, ChevronRight, Activity, DollarSign, ArrowUpRight,
  MoreVertical, ShieldAlert, Laptop
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Plan Limits mapping for calculations
const PLAN_DETAILS = {
  starter: { label: "Starter", price: 2999, color: "text-slate-400 bg-slate-500/10 border-slate-500/20", icon: Zap },
  growth: { label: "Growth", price: 6999, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", icon: Rocket },
  enterprise: { label: "Enterprise", price: 14999, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Crown },
};

const PLAN_LIMITS_DEFAULTS = {
  starter: { maxRooms: 30, maxUsers: 5, maxHostels: 1 },
  growth: { maxRooms: 100, maxUsers: 15, maxHostels: 3 },
  enterprise: { maxRooms: 999, maxUsers: 99, maxHostels: 20 },
};

const STATUS_COLORS: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  expired: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (key: string) => void }) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!key.trim()) { setError("Enter the super admin key"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/tenants", {
        headers: { "x-super-admin-key": key },
      });
      if (res.ok) {
        onLogin(key);
      } else {
        setError("Invalid super admin key");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transition-transform hover:scale-105 duration-300">
            <Shield className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Portal HMS</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Super Admin Control console</p>
        </div>

        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 space-y-6 shadow-2xl">
          {error && (
            <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-rose-300 text-sm font-medium">{error}</p>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Platform Master Key</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={show ? "text" : "password"}
                value={key}
                onChange={(e) => { setKey(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="••••••••••••••••••••"
                className="w-full h-12 pl-12 pr-12 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500/50 transition-all text-sm font-mono"
              />
              <button onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {loading ? "Verifying Credentials..." : "Authenticate"}
          </button>

          <p className="text-center text-slate-500 text-xs">
            Set <code className="text-slate-400 bg-slate-800/50 px-1.5 py-0.5 rounded font-mono">SUPER_ADMIN_KEY</code> in environment variables
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  
  // Drawer state
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for selected tenant
  const [formPlan, setFormPlan] = useState("");
  const [formExpiry, setFormExpiry] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formMaxRooms, setFormMaxRooms] = useState<number | string>("");
  const [formMaxUsers, setFormMaxUsers] = useState<number | string>("");
  const [formMaxHostels, setFormMaxHostels] = useState<number | string>("");
  const [formAiBypass, setFormAiBypass] = useState(false);
  const [formSmtpBypass, setFormSmtpBypass] = useState(false);
  const [formStatus, setFormStatus] = useState("active");

  const fetchTenants = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/tenants", {
        headers: { "x-super-admin-key": adminKey },
      });
      if (res.ok) {
        const data = await res.json();
        setTenants(data.tenants || []);
      }
    } catch {
      toast.error("Failed to fetch tenants");
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    if (adminKey) fetchTenants();
  }, [adminKey, fetchTenants]);

  const handleOpenDrawer = (tenant: any) => {
    setSelectedTenant(tenant);
    setFormPlan(tenant.plan);
    setFormExpiry(
      tenant.subscription?.paidUntil
        ? format(new Date(tenant.subscription.paidUntil), "yyyy-MM-dd")
        : ""
    );
    setFormIsActive(tenant.isActive);
    setFormMaxRooms(tenant.subscription?.maxRoomsOverride ?? "");
    setFormMaxUsers(tenant.subscription?.maxUsersOverride ?? "");
    setFormMaxHostels(tenant.subscription?.maxHostelsOverride ?? "");
    setFormAiBypass(tenant.subscription?.aiFeatureBypass ?? false);
    setFormSmtpBypass(tenant.subscription?.smtpFeatureBypass ?? false);
    setFormStatus(tenant.subscription?.status ?? "pending");
    setDrawerOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedTenant || !adminKey) return;
    setIsSaving(true);
    try {
      const payload = {
        tenantId: selectedTenant.id,
        action: "update",
        plan: formPlan,
        paidUntilDate: formExpiry ? new Date(formExpiry).toISOString() : null,
        isActive: formIsActive,
        maxRoomsOverride: formMaxRooms === "" ? null : Number(formMaxRooms),
        maxUsersOverride: formMaxUsers === "" ? null : Number(formMaxUsers),
        maxHostelsOverride: formMaxHostels === "" ? null : Number(formMaxHostels),
        aiFeatureBypass: formAiBypass,
        smtpFeatureBypass: formSmtpBypass,
        status: formStatus,
      };

      const res = await fetch("/api/superadmin/subscription", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-super-admin-key": adminKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Tenant configuration updated successfully");
        setDrawerOpen(false);
        fetchTenants();
      } else {
        toast.error(data.error || "Failed to update configuration");
      }
    } catch {
      toast.error("Network error saving configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickStatusToggle = async (tenantId: string, currentActive: boolean) => {
    if (!adminKey) return;
    try {
      const res = await fetch("/api/superadmin/subscription", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-super-admin-key": adminKey,
        },
        body: JSON.stringify({
          tenantId,
          action: "toggle_active",
          isActive: !currentActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchTenants();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const filtered = useMemo(() => {
    return tenants.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      const sub = t.subscription;
      const isExpired = sub?.paidUntil ? isPast(new Date(sub.paidUntil)) : true;
      const effectiveStatus = isExpired ? "expired" : (sub?.status || "pending");

      if (filter === "active") return effectiveStatus === "active";
      if (filter === "expired") return effectiveStatus === "expired";
      if (filter === "pending") return effectiveStatus === "pending";
      return true;
    });
  }, [tenants, search, filter]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const total = tenants.length;
    const active = tenants.filter((t) => {
      const isExpired = t.subscription?.paidUntil ? isPast(new Date(t.subscription.paidUntil)) : true;
      return t.subscription?.status === "active" && !isExpired;
    }).length;
    const expired = tenants.filter((t) => {
      const isExpired = t.subscription?.paidUntil ? isPast(new Date(t.subscription.paidUntil)) : true;
      return t.subscription?.status === "expired" || isExpired;
    }).length;
    
    // Exact MRR Sum based on active plan prices
    const mrr = tenants.reduce((acc, t) => {
      const isExpired = t.subscription?.paidUntil ? isPast(new Date(t.subscription.paidUntil)) : true;
      if (t.subscription?.status === "active" && !isExpired) {
        const planKey = (t.plan || "starter") as keyof typeof PLAN_DETAILS;
        return acc + (PLAN_DETAILS[planKey]?.price || 0);
      }
      return acc;
    }, 0);

    const totalUsers = tenants.reduce((acc, t) => acc + (t.stats?.users || 0), 0);
    const totalRooms = tenants.reduce((acc, t) => acc + (t.stats?.rooms || 0), 0);
    const totalHostels = tenants.reduce((acc, t) => acc + (t.stats?.hostels || 0), 0);

    return { total, active, expired, mrr, totalUsers, totalRooms, totalHostels };
  }, [tenants]);

  // Dynamic Chart Data mapping registrations by date
  const registrationChartData = useMemo(() => {
    if (tenants.length === 0) {
      // Fallback preview curve
      return [
        { name: "Jan", Registrations: 2 },
        { name: "Feb", Registrations: 5 },
        { name: "Mar", Registrations: 8 },
        { name: "Apr", Registrations: 14 },
        { name: "May", Registrations: 20 },
        { name: "Jun", Registrations: 28 },
      ];
    }
    const grouped = tenants.reduce((acc: Record<string, number>, t) => {
      const dateLabel = format(new Date(t.createdAt), "MMM yy");
      acc[dateLabel] = (acc[dateLabel] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(grouped).map(key => ({
      name: key,
      Registrations: grouped[key]
    })).reverse();
  }, [tenants]);

  if (!adminKey) {
    return <LoginScreen onLogin={(k) => setAdminKey(k)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-rose-500/30 selection:text-rose-200 overflow-x-hidden relative">
      {/* Decorative glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="bg-slate-950/80 border-b border-white/10 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h1 className="text-white font-black text-sm uppercase tracking-wider">Portal HMS</h1>
              <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest">Global Super Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchTenants}
              disabled={loading}
              className="h-9 px-4 bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] rounded-xl text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh System
            </button>
            <button
              onClick={() => setAdminKey(null)}
              className="h-9 px-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-rose-500/20 cursor-pointer transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10 relative z-10">
        
        {/* Apple-style Welcome & Total Revenue Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white/15 transition-all duration-300">
            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-rose-500/5 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-500" />
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Overview Status</span>
              <h2 className="text-3xl font-extrabold tracking-tight">Platform Growth Timeline</h2>
              <p className="text-slate-400 text-sm">Real-time tenant onboarding frequency</p>
            </div>
            
            <div className="h-44 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold" }}
                    itemStyle={{ color: "#fff", fontSize: "13px" }}
                  />
                  <Area type="monotone" dataKey="Registrations" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRegs)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white/15 transition-all duration-300">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Earnings metrics</span>
                <h3 className="text-sm font-semibold text-slate-400">Estimated SaaS MRR</h3>
              </div>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-black tracking-tight text-white">PKR {stats.mrr.toLocaleString()}</p>
              <p className="text-slate-500 text-xs mt-1">Based on active paid plan tiers</p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Average ARPU</span>
              <span className="text-white font-bold">PKR {stats.active > 0 ? (stats.mrr / stats.active).toFixed(0) : "0"}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Tenants", value: stats.total, icon: Building2, color: "text-slate-400 bg-white/5 border-white/10" },
            { label: "Active Sub", value: stats.active, icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            { label: "Expired Sub", value: stats.expired, icon: XCircle, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
            { label: "Global Hostels", value: stats.totalHostels, icon: Building2, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
            { label: "Global Users", value: stats.totalUsers, icon: Users, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
            { label: "Global Rooms", value: stats.totalRooms, icon: Bed, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-slate-900 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color.split(" ")[1]}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Table & Filtering Section */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Controls Bar */}
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tenant name or subdomain..."
                className="w-full h-10 pl-11 pr-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500/50 text-xs font-semibold"
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {["all", "active", "expired", "pending"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`h-8 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                    filter === f 
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                      : "bg-white/[0.03] border border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01] text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-4">Tenant Host</th>
                  <th className="px-6 py-4">Current Plan</th>
                  <th className="px-6 py-4">Sub Status</th>
                  <th className="px-6 py-4">Paid Expiry</th>
                  <th className="px-6 py-4">Platform Footprint</th>
                  <th className="px-6 py-4">Direct Login</th>
                  <th className="px-6 py-4 text-right">Config</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx}>
                      {Array.from({ length: 7 }).map((_, cIdx) => (
                        <td key={cIdx} className="px-6 py-5">
                          <div className="h-4 bg-white/5 rounded-lg animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500 text-sm font-medium">
                      No tenants found matching parameters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const isExpired = t.subscription?.paidUntil ? isPast(new Date(t.subscription.paidUntil)) : true;
                    const subStatus = isExpired ? "expired" : (t.subscription?.status || "pending");
                    const daysLeft = t.subscription?.paidUntil
                      ? Math.max(0, Math.ceil((new Date(t.subscription.paidUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                      : 0;

                    const planKey = (t.plan || "starter") as keyof typeof PLAN_DETAILS;
                    const planDetail = PLAN_DETAILS[planKey] || PLAN_DETAILS.starter;
                    const PlanIcon = planDetail.icon;

                    return (
                      <tr key={t.id} className="hover:bg-white/[0.01] transition-all group duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                              <Building2 className="w-4.5 h-4.5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                            </div>
                            <div>
                              <p className="text-white font-semibold text-xs leading-none">{t.name}</p>
                              <p className="text-slate-500 text-[10px] font-mono mt-1">{t.slug}.localhost:3000</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border rounded-lg text-[9px] font-bold uppercase tracking-widest ${planDetail.color}`}>
                            <PlanIcon className="w-3 h-3" />
                            {t.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-lg text-[9px] font-bold uppercase tracking-widest ${STATUS_COLORS[subStatus] || STATUS_COLORS.pending}`}>
                            <span className="w-1 h-1 rounded-full bg-current" />
                            {subStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {t.subscription?.paidUntil ? (
                            <div>
                              <p className={`text-[10px] font-bold uppercase tracking-wider ${isExpired ? "text-rose-500" : daysLeft <= 5 ? "text-amber-500" : "text-slate-300"}`}>
                                {isExpired ? "Suspended" : `${daysLeft} days left`}
                              </p>
                              <p className="text-slate-600 text-[10px] mt-0.5">{format(new Date(t.subscription.paidUntil), "dd MMM yyyy")}</p>
                            </div>
                          ) : (
                            <span className="text-slate-600 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {t.stats?.users ?? 0}</span>
                            <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {t.stats?.hostels ?? 0}</span>
                            <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {t.stats?.rooms ?? 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleQuickStatusToggle(t.id, t.isActive)}
                            className={`h-7 px-3 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                              t.isActive 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                                : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                            }`}
                          >
                            {t.isActive ? "Authorized" : "Blocked"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleOpenDrawer(t)}
                            className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all ml-auto cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Slide-over Tenant Detail Drawer Panel */}
      {drawerOpen && selectedTenant && (
        <>
          {/* Backdrop blur */}
          <div 
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300" 
          />
          
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-950 border-l border-white/10 shadow-2xl z-50 p-8 overflow-y-auto space-y-8 flex flex-col justify-between transition-transform duration-300">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-black tracking-tight">{selectedTenant.name}</h3>
                  <p className="text-slate-500 text-xs font-mono">{selectedTenant.slug}.localhost:3000</p>
                </div>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Tenant Health Status card */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Resource Footprint</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-900 border border-white/5 rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rooms</p>
                    <p className="text-lg font-black mt-1 text-white">{selectedTenant.stats?.rooms ?? 0}</p>
                    <p className="text-[8px] text-slate-500 mt-0.5">Limit: {selectedTenant.subscription?.maxRoomsOverride ?? PLAN_LIMITS_DEFAULTS[selectedTenant.plan as keyof typeof PLAN_LIMITS_DEFAULTS]?.maxRooms ?? 30}</p>
                  </div>
                  <div className="bg-slate-900 border border-white/5 rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Users</p>
                    <p className="text-lg font-black mt-1 text-white">{selectedTenant.stats?.users ?? 0}</p>
                    <p className="text-[8px] text-slate-500 mt-0.5">Limit: {selectedTenant.subscription?.maxUsersOverride ?? PLAN_LIMITS_DEFAULTS[selectedTenant.plan as keyof typeof PLAN_LIMITS_DEFAULTS]?.maxUsers ?? 5}</p>
                  </div>
                  <div className="bg-slate-900 border border-white/5 rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hostels</p>
                    <p className="text-lg font-black mt-1 text-white">{selectedTenant.stats?.hostels ?? 0}</p>
                    <p className="text-[8px] text-slate-500 mt-0.5">Limit: {selectedTenant.subscription?.maxHostelsOverride ?? PLAN_LIMITS_DEFAULTS[selectedTenant.plan as keyof typeof PLAN_LIMITS_DEFAULTS]?.maxHostels ?? 1}</p>
                  </div>
                </div>
              </div>

              {/* Access Settings form */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Controls & Subscriptions</p>
                
                {/* Status toggles */}
                <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold">Tenant Authentication</p>
                    <p className="text-[10px] text-slate-500">Allow or block login access</p>
                  </div>
                  <button 
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`h-7 px-3 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                      formIsActive 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    }`}
                  >
                    {formIsActive ? "Authorized" : "Blocked"}
                  </button>
                </div>

                {/* Plan picker */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Base SaaS Plan</label>
                  <select 
                    value={formPlan} 
                    onChange={(e) => setFormPlan(e.target.value)}
                    className="w-full h-11 px-4 bg-slate-900 border border-white/10 rounded-xl text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="starter">Starter Plan</option>
                    <option value="growth">Growth Plan</option>
                    <option value="enterprise">Enterprise Plan</option>
                  </select>
                </div>

                {/* Subscription Status Picker */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Subscription State</label>
                  <select 
                    value={formStatus} 
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full h-11 px-4 bg-slate-900 border border-white/10 rounded-xl text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="active">Active (Paid)</option>
                    <option value="pending">Pending Review</option>
                    <option value="expired">Expired / Suspended</option>
                  </select>
                </div>

                {/* Expiry Calendar */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Paid Until Expiry Date</label>
                  <input
                    type="date"
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    className="w-full h-11 px-4 bg-slate-900 border border-white/10 rounded-xl text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                {/* Custom Limits Overrides */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Capacity Limits Overrides</label>
                  <p className="text-[9px] text-slate-500 -mt-2">Leave blank to inherit default plan limits</p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Max Rooms</span>
                      <input
                        type="number"
                        value={formMaxRooms}
                        onChange={(e) => setFormMaxRooms(e.target.value)}
                        placeholder="Default"
                        className="w-full h-10 px-3 bg-slate-900 border border-white/10 rounded-lg text-white text-xs font-semibold text-center focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Max Users</span>
                      <input
                        type="number"
                        value={formMaxUsers}
                        onChange={(e) => setFormMaxUsers(e.target.value)}
                        placeholder="Default"
                        className="w-full h-10 px-3 bg-slate-900 border border-white/10 rounded-lg text-white text-xs font-semibold text-center focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Max Hostels</span>
                      <input
                        type="number"
                        value={formMaxHostels}
                        onChange={(e) => setFormMaxHostels(e.target.value)}
                        placeholder="Default"
                        className="w-full h-10 px-3 bg-slate-900 border border-white/10 rounded-lg text-white text-xs font-semibold text-center focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom bypass flags */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Feature Bypass Settings</label>
                  
                  <div className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold">AI Assistant Access</p>
                      <p className="text-[9px] text-slate-500">Allow AI assistant bypassing plan check</p>
                    </div>
                    <button 
                      onClick={() => setFormAiBypass(!formAiBypass)}
                      className={`w-10 h-6 rounded-full p-1 transition-all flex cursor-pointer ${
                        formAiBypass ? "bg-rose-500 justify-end" : "bg-slate-800 justify-start"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold">Custom SMTP Email Bypass</p>
                      <p className="text-[9px] text-slate-500">Enable advanced mailing functions</p>
                    </div>
                    <button 
                      onClick={() => setFormSmtpBypass(!formSmtpBypass)}
                      className={`w-10 h-6 rounded-full p-1 transition-all flex cursor-pointer ${
                        formSmtpBypass ? "bg-rose-500 justify-end" : "bg-slate-800 justify-start"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/10 flex gap-3">
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-1 h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="flex-1 h-11 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-500/10 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isSaving ? "Saving Config..." : "Save Tenant"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
