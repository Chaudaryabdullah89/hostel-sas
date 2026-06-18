"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Building2, Users, Bed, Calendar, CheckCircle2, XCircle, AlertCircle,
  RefreshCw, LogOut, Shield, TrendingUp, Search, ChevronDown,
  Zap, Rocket, Crown, Clock, Eye, EyeOff, ToggleLeft, ToggleRight,
  DollarSign, Activity, ArrowUpRight, MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow, isPast } from "date-fns";

const PLAN_COLORS: Record<string, { bg: string; text: string; icon: typeof Zap }> = {
  starter: { bg: "bg-slate-700", text: "text-slate-200", icon: Zap },
  growth: { bg: "bg-indigo-700", text: "text-indigo-100", icon: Rocket },
  enterprise: { bg: "bg-amber-700", text: "text-amber-100", icon: Crown },
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-rose-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">Super Admin</h1>
          <p className="text-slate-500 text-sm mt-2">Platform owner access only</p>
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-rose-300 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Super Admin Key</label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type={show ? "text" : "password"}
                value={key}
                onChange={(e) => { setKey(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter your super admin key"
                className="w-full h-12 pl-12 pr-12 bg-slate-800 border border-white/5 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
              />
              <button onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-rose-600 to-orange-600 text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {loading ? "Authenticating..." : "Access Dashboard"}
          </button>

          <p className="text-center text-slate-600 text-xs">
            Set <code className="text-slate-500 bg-slate-800 px-1 rounded">SUPER_ADMIN_KEY</code> in your .env file
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Tenant Row ────────────────────────────────────────────────────────────────
function TenantRow({ tenant, adminKey, onRefresh }: { tenant: any; adminKey: string; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const planInfo = PLAN_COLORS[tenant.plan] || PLAN_COLORS.starter;
  const PlanIcon = planInfo.icon;
  const subStatus = tenant.subscription?.status || "pending";
  const isExpired = tenant.subscription?.paidUntil ? isPast(new Date(tenant.subscription.paidUntil)) : true;
  const daysLeft = tenant.subscription?.paidUntil
    ? Math.max(0, Math.ceil((new Date(tenant.subscription.paidUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const doAction = async (action: string, extra = {}) => {
    setLoading(true);
    setMenuOpen(false);
    try {
      const res = await fetch("/api/superadmin/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-super-admin-key": adminKey },
        body: JSON.stringify({ tenantId: tenant.id, action, ...extra }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        onRefresh();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5 shrink-0">
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{tenant.name}</p>
            <p className="text-slate-500 text-xs font-mono">{tenant.slug}.portalhms.com</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${planInfo.bg} ${planInfo.text}`}>
          <PlanIcon className="w-3 h-3" />
          {tenant.plan}
        </span>
      </td>

      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[subStatus] || STATUS_COLORS.pending}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {subStatus}
        </span>
      </td>

      <td className="px-6 py-4">
        {tenant.subscription?.paidUntil ? (
          <div>
            <p className={`text-xs font-bold ${isExpired ? "text-rose-400" : daysLeft <= 3 ? "text-amber-400" : "text-slate-300"}`}>
              {isExpired ? "Expired" : `${daysLeft}d remaining`}
            </p>
            <p className="text-slate-600 text-xs">{format(new Date(tenant.subscription.paidUntil), "dd MMM yyyy")}</p>
          </div>
        ) : (
          <span className="text-slate-600 text-xs">—</span>
        )}
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-4 text-slate-400 text-xs">
          <span className="flex items-center gap-1.5"><Users className="w-3 h-3" />{tenant.stats.users}</span>
          <span className="flex items-center gap-1.5"><Building2 className="w-3 h-3" />{tenant.stats.hostels}</span>
          <span className="flex items-center gap-1.5"><Bed className="w-3 h-3" />{tenant.stats.rooms}</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{tenant.stats.bookings}</span>
        </div>
      </td>

      <td className="px-6 py-4">
        <span className={`w-2 h-2 rounded-full inline-block ${tenant.isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
        <span className={`ml-2 text-xs font-medium ${tenant.isActive ? "text-emerald-400" : "text-rose-400"}`}>
          {tenant.isActive ? "Active" : "Inactive"}
        </span>
      </td>

      <td className="px-6 py-4 text-right relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          disabled={loading}
          className="h-8 w-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all ml-auto disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MoreVertical className="w-3.5 h-3.5" />}
        </button>

        {menuOpen && (
          <div className="absolute right-6 top-12 z-50 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-2 w-52 text-left">
            <button onClick={() => doAction("activate", { paidUntilDays: 30 })} className="w-full px-4 py-2.5 text-sm text-emerald-400 hover:bg-white/5 rounded-xl flex items-center gap-3 font-medium transition-colors">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Activate (30 days)
            </button>
            <button onClick={() => doAction("activate", { paidUntilDays: 365 })} className="w-full px-4 py-2.5 text-sm text-blue-400 hover:bg-white/5 rounded-xl flex items-center gap-3 font-medium transition-colors">
              <TrendingUp className="w-4 h-4 shrink-0" /> Activate (1 year)
            </button>
            <div className="border-t border-white/5 my-1" />
            <button onClick={() => doAction("change_plan", { plan: "starter" })} className="w-full px-4 py-2.5 text-sm text-slate-400 hover:bg-white/5 rounded-xl flex items-center gap-3 font-medium transition-colors">
              <Zap className="w-4 h-4 shrink-0" /> Set Starter Plan
            </button>
            <button onClick={() => doAction("change_plan", { plan: "growth" })} className="w-full px-4 py-2.5 text-sm text-indigo-400 hover:bg-white/5 rounded-xl flex items-center gap-3 font-medium transition-colors">
              <Rocket className="w-4 h-4 shrink-0" /> Set Growth Plan
            </button>
            <button onClick={() => doAction("change_plan", { plan: "enterprise" })} className="w-full px-4 py-2.5 text-sm text-amber-400 hover:bg-white/5 rounded-xl flex items-center gap-3 font-medium transition-colors">
              <Crown className="w-4 h-4 shrink-0" /> Set Enterprise Plan
            </button>
            <div className="border-t border-white/5 my-1" />
            <button onClick={() => doAction("expire")} className="w-full px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-3 font-medium transition-colors">
              <XCircle className="w-4 h-4 shrink-0" /> Expire Subscription
            </button>
            <button onClick={() => doAction("toggle_active", { isActive: !tenant.isActive })} className="w-full px-4 py-2.5 text-sm text-orange-400 hover:bg-orange-500/10 rounded-xl flex items-center gap-3 font-medium transition-colors">
              {tenant.isActive ? <ToggleLeft className="w-4 h-4 shrink-0" /> : <ToggleRight className="w-4 h-4 shrink-0" />}
              {tenant.isActive ? "Deactivate Tenant" : "Activate Tenant"}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

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

  if (!adminKey) {
    return <LoginScreen onLogin={(k) => setAdminKey(k)} />;
  }

  const filtered = tenants.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "active") return t.subscription?.status === "active";
    if (filter === "expired") return t.subscription?.status === "expired" || isPast(new Date(t.subscription?.paidUntil || 0));
    if (filter === "pending") return t.subscription?.status === "pending";
    return true;
  });

  const stats = {
    total: tenants.length,
    active: tenants.filter((t) => t.subscription?.status === "active").length,
    expired: tenants.filter((t) => t.subscription?.status === "expired").length,
    totalRevenue: tenants.filter((t) => t.subscription?.status === "active").length * 6999, // avg estimate
    totalUsers: tenants.reduce((acc, t) => acc + t.stats.users, 0),
    totalRooms: tenants.reduce((acc, t) => acc + t.stats.rooms, 0),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-950 border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-sm uppercase tracking-widest">Portal HMS</h1>
              <p className="text-rose-400 text-xs font-bold uppercase tracking-widest">Super Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchTenants}
              disabled={loading}
              className="h-9 px-4 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white text-xs font-bold flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setAdminKey(null)}
              className="h-9 px-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-rose-500/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Tenants", value: stats.total, icon: Building2, color: "indigo" },
            { label: "Active", value: stats.active, icon: CheckCircle2, color: "emerald" },
            { label: "Expired", value: stats.expired, icon: XCircle, color: "rose" },
            { label: "MRR (Est.)", value: `${(stats.totalRevenue / 1000).toFixed(0)}k`, icon: DollarSign, color: "amber" },
            { label: "Total Users", value: stats.totalUsers, icon: Users, color: "blue" },
            { label: "Total Rooms", value: stats.totalRooms, icon: Bed, color: "purple" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-slate-900 border border-white/5 rounded-2xl p-5">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-black text-white">{value}</p>
                <Icon className={`w-5 h-5 text-${color}-400`} />
              </div>
            </div>
          ))}
        </div>

        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tenants..."
              className="w-full h-10 pl-11 pr-4 bg-slate-900 border border-white/5 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "expired", "pending"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  filter === f ? "bg-rose-600 text-white shadow-lg shadow-rose-500/20" : "bg-white/5 border border-white/5 text-slate-500 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <p className="text-slate-600 text-xs ml-auto">{filtered.length} of {tenants.length} tenants</p>
        </div>

        {/* Tenants Table */}
        <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  {["Tenant", "Plan", "Status", "Expiry", "Usage", "Active", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-white/5 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-600 text-sm">
                      {search ? "No tenants match your search." : "No tenants registered yet."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((tenant) => (
                    <TenantRow key={tenant.id} tenant={tenant} adminKey={adminKey} onRefresh={fetchTenants} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
