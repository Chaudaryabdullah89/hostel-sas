"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Bed, Users, ArrowRight, ArrowLeft, CheckCircle2,
  Sparkles, MapPin, Phone, Mail, Hash, Loader2, PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "@/hooks/Authstate";

const STEPS = ["Your First Hostel", "Add Rooms", "Invite Warden", "All Done!"];

type FormState = {
  hostelName: string;
  address: string;
  city: string;
  hostelType: string;
  phone: string;
  floors: string;
  roomNumber: string;
  roomType: string;
  roomCapacity: string;
  roomPrice: string;
  wardenName: string;
  wardenEmail: string;
  wardenPassword: string;
  wardenPhone: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hostelId, setHostelId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    hostelName: "",
    address: "",
    city: "",
    hostelType: "BOYS",
    phone: "",
    floors: "1",
    roomNumber: "101",
    roomType: "TRIPLE",
    roomCapacity: "3",
    roomPrice: "5000",
    wardenName: "",
    wardenEmail: "",
    wardenPassword: "",
    wardenPhone: "",
  });

  const update = (key: keyof FormState, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  // ── Step Submission Handlers ──────────────────────────────────────────────

  const handleCreateHostel = async () => {
    if (!form.hostelName.trim() || !form.city.trim()) {
      toast.error("Hostel name and city are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/hostels/createhostel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.hostelName,
          address: form.address,
          city: form.city,
          type: form.hostelType,
          phone: form.phone,
          floors: parseInt(form.floors) || 1,
        }),
      });
      const data = await res.json();
      if (res.ok && (data.data?.id || data.hostel?.id || data.id)) {
        setHostelId(data.data?.id || data.hostel?.id || data.id);
        toast.success("Hostel created!");
        setStep(1);
      } else {
        toast.error(data.error || "Failed to create hostel");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!hostelId) { toast.error("Hostel not found"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/rooms/createroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostelId,
          roomNumber: form.roomNumber,
          floor: 1,
          type: form.roomType,
          capacity: parseInt(form.roomCapacity) || 3,
          price: parseFloat(form.roomPrice) || 5000,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Room added!");
        setStep(2);
      } else {
        toast.error(data.error || "Failed to create room");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteWarden = async () => {
    if (!form.wardenEmail || !form.wardenPassword || !form.wardenName) {
      toast.error("Warden name, email, and password are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.wardenName,
          email: form.wardenEmail,
          password: form.wardenPassword,
          phone: form.wardenPhone,
          role: "WARDEN",
          hostelId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Warden account created!");
        setStep(3);
      } else {
        toast.error(data.error || "Failed to create warden");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipWarden = () => setStep(3);

  const goToDashboard = () => {
    localStorage.setItem("skipped_onboarding", "true");
    router.push("/admin/dashboard");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-6">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    i < step
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : i === step
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-600/30 shadow-lg shadow-indigo-500/30"
                      : "bg-white/5 border border-white/10 text-slate-500"
                  }`}
                >
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${i === step ? "text-white" : "text-slate-600"}`}>
                  {label.split(" ")[0]}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 mx-3 transition-all ${i < step ? "bg-emerald-500/50" : "bg-white/5"}`} style={{ width: "40px" }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

          {/* ── STEP 0: Create Hostel ─────────────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-black text-white">Create Your First Hostel</h1>
                <p className="text-slate-400 mt-1 text-sm">Let's get your property set up on Portal HMS.</p>
              </div>

              {[
                { label: "Hostel Name *", key: "hostelName", placeholder: "e.g. Shaheen Boys Hostel", icon: Building2 },
                { label: "Address", key: "address", placeholder: "Street address", icon: MapPin },
                { label: "City *", key: "city", placeholder: "Lahore, Karachi...", icon: MapPin },
                { label: "Phone", key: "phone", placeholder: "0300-1234567", icon: Phone },
              ].map(({ label, key, placeholder, icon: Icon }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      type="text"
                      value={form[key as keyof FormState]}
                      onChange={(e) => update(key as keyof FormState, e.target.value)}
                      placeholder={placeholder}
                      className="w-full h-11 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Hostel Type</label>
                <select
                  value={form.hostelType}
                  onChange={(e) => update("hostelType", e.target.value)}
                  className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="BOYS" className="bg-slate-900">Boys Hostel</option>
                  <option value="GIRLS" className="bg-slate-900">Girls Hostel</option>
                  <option value="MIXED" className="bg-slate-900">Mixed Hostel</option>
                </select>
              </div>

              <button
                onClick={handleCreateHostel}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create Hostel <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 1: Add Room ──────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center mb-4">
                  <Bed className="w-6 h-6 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-black text-white">Add Your First Room</h1>
                <p className="text-slate-400 mt-1 text-sm">You can add more rooms later from the dashboard.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Room Number *</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      type="text"
                      value={form.roomNumber}
                      onChange={(e) => update("roomNumber", e.target.value)}
                      placeholder="101"
                      className="w-full h-11 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Monthly Price (PKR)</label>
                  <input
                    type="number"
                    value={form.roomPrice}
                    onChange={(e) => update("roomPrice", e.target.value)}
                    placeholder="5000"
                    className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Room Type</label>
                  <select
                    value={form.roomType}
                    onChange={(e) => update("roomType", e.target.value)}
                    className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="SINGLE" className="bg-slate-900">Single (1 bed)</option>
                    <option value="DOUBLE" className="bg-slate-900">Double (2 beds)</option>
                    <option value="TRIPLE" className="bg-slate-900">Triple (3 beds)</option>
                    <option value="DORMITORY" className="bg-slate-900">Dormitory</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Capacity</label>
                  <input
                    type="number"
                    value={form.roomCapacity}
                    onChange={(e) => update("roomCapacity", e.target.value)}
                    min={1}
                    className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="h-12 px-5 bg-white/5 border border-white/10 rounded-xl text-slate-300 flex items-center gap-2 hover:bg-white/10 transition-all">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Add Room <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Invite Warden ─────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <h1 className="text-2xl font-black text-white">Invite a Warden</h1>
                <p className="text-slate-400 mt-1 text-sm">Wardens manage day-to-day hostel operations. You can skip this step.</p>
              </div>

              {[
                { label: "Warden Full Name *", key: "wardenName", placeholder: "e.g. Ali Hassan", icon: Users },
                { label: "Email Address *", key: "wardenEmail", placeholder: "warden@example.com", icon: Mail, type: "email" },
                { label: "Temporary Password *", key: "wardenPassword", placeholder: "Min. 8 characters", icon: null, type: "password" },
                { label: "Phone (optional)", key: "wardenPhone", placeholder: "0300-1234567", icon: Phone },
              ].map(({ label, key, placeholder, icon: Icon, type = "text" }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">{label}</label>
                  <div className="relative">
                    {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />}
                    <input
                      type={type}
                      value={form[key as keyof FormState]}
                      onChange={(e) => update(key as keyof FormState, e.target.value)}
                      placeholder={placeholder}
                      className={`w-full h-11 ${Icon ? "pl-11" : "pl-4"} pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
                    />
                  </div>
                </div>
              ))}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="h-12 px-5 bg-white/5 border border-white/10 rounded-xl text-slate-300 flex items-center gap-2 hover:bg-white/10 transition-all">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleInviteWarden}
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Create Warden <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handleSkipWarden} className="w-full text-slate-500 text-sm hover:text-slate-300 transition-colors py-2">
                Skip this step →
              </button>
            </div>
          )}

          {/* ── STEP 3: Done ──────────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 animate-bounce">
                <PartyPopper className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white mb-3">You're All Set! 🎉</h1>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                  Your hostel is live on Portal HMS. Head to your dashboard to add more rooms, manage bookings, and explore all features.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-3">
                {[
                  "✅ Hostel created",
                  "✅ First room added",
                  hostelId ? "✅ System ready" : "⏭ Warden invite skipped",
                  "💡 Tip: Add more rooms from the Hostels section",
                ].map((item) => (
                  <p key={item} className="text-slate-300 text-sm">{item}</p>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={goToDashboard}
                  className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25"
                >
                  <Sparkles className="w-4 h-4" /> Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skip link */}
        {step < 3 && (
          <p className="text-center text-slate-600 text-sm mt-6">
            <button onClick={goToDashboard} className="hover:text-slate-400 transition-colors">
              Skip setup and go to dashboard →
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
