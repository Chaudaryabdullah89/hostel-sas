"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { Plane, Plus, Calendar, Clock, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import useAuthStore from "@/hooks/Authstate";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function StaffLeaveRequestPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    type: "CASUAL",
    startDate: "",
    endDate: "",
    reason: "",
    emergencyContact: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["my-leaves", user?.id],
    queryFn: async () => {
      const res = await axios.get("/api/leave", { params: { userId: user?.id } });
      return res.data;
    },
    enabled: !!user?.id,
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post("/api/leave", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Leave request submitted!");
      setShowForm(false);
      setForm({ type: "CASUAL", startDate: "", endDate: "", reason: "", emergencyContact: "" });
      qc.invalidateQueries({ queryKey: ["my-leaves"] });
    },
    onError: () => toast.error("Failed to submit leave request"),
  });

  const handleSubmit = () => {
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      toast.error("End date must be after start date");
      return;
    }
    submitMutation.mutate({
      type: form.type,
      description: JSON.stringify({
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        emergencyContact: form.emergencyContact,
      }),
    });
  };

  const leaves: any[] = ((data?.data || data || []) as any[]).map((l: any) => {
    try {
      const desc = JSON.parse(l.description || "{}");
      return { ...l, ...desc };
    } catch {
      return l;
    }
  });

  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "PENDING").length,
    approved: leaves.filter((l) => l.status === "APPROVED").length,
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans tracking-tight">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 h-16">
        <div className="max-w-3xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-blue-600 rounded-full" />
            <div>
              <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">Leave Request</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Apply for leave</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "Apply for Leave"}
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Leave Form */}
        {showForm && (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-5">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">New Leave Request</h2>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Leave Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {["SICK", "CASUAL", "ANNUAL", "EMERGENCY", "OTHER"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Start Date *</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">End Date *</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  min={form.startDate || format(new Date(), "yyyy-MM-dd")}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {form.startDate && form.endDate && (
              <div className="flex items-center gap-2 text-sm text-indigo-600 font-bold">
                <Calendar className="w-4 h-4" />
                {Math.max(0, differenceInDays(new Date(form.endDate), new Date(form.startDate)) + 1)} day(s) requested
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Reason *</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                placeholder="Briefly explain the reason for your leave..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Emergency Contact (optional)</label>
              <input
                type="text"
                value={form.emergencyContact}
                onChange={(e) => setForm((p) => ({ ...p, emergencyContact: e.target.value }))}
                placeholder="Phone number during leave"
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plane className="w-4 h-4" />}
              Submit Leave Request
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Requests", value: stats.total, icon: Plane, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Leave History */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">My Leave History</h3>
          </div>

          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
            </div>
          ) : leaves.length === 0 ? (
            <div className="py-16 text-center">
              <Plane className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">No leave requests yet</p>
              <p className="text-xs text-gray-300 mt-1">Click "Apply for Leave" to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {leaves.map((leave: any) => {
                const days = leave.startDate && leave.endDate
                  ? Math.max(1, differenceInDays(new Date(leave.endDate), new Date(leave.startDate)) + 1)
                  : 1;
                return (
                  <div key={leave.id} className="px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        leave.status === "APPROVED" ? "bg-emerald-50" : leave.status === "REJECTED" ? "bg-rose-50" : "bg-amber-50"
                      }`}>
                        <Plane className={`w-4.5 h-4.5 ${
                          leave.status === "APPROVED" ? "text-emerald-600" : leave.status === "REJECTED" ? "text-rose-600" : "text-amber-600"
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-sm uppercase">{leave.type || "CASUAL"} Leave</p>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${STATUS_STYLES[leave.status] || STATUS_STYLES.PENDING}`}>
                            {leave.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {leave.startDate ? format(new Date(leave.startDate), "dd MMM") : "—"} →{" "}
                          {leave.endDate ? format(new Date(leave.endDate), "dd MMM yyyy") : "—"} ({days} day{days !== 1 ? "s" : ""})
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{format(new Date(leave.createdAt), "dd MMM yyyy")}</p>
                      {leave.resolutionNotes && (
                        <p className="text-xs text-gray-500 font-medium mt-1 max-w-xs text-right italic">"{leave.resolutionNotes}"</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
