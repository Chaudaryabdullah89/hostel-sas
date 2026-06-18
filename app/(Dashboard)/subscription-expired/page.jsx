"use client";
import Link from "next/link";
import { AlertCircle, Crown, ArrowRight, Phone, Mail } from "lucide-react";

export default function SubscriptionExpiredPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white border border-rose-100 rounded-3xl p-8 text-center shadow-xl shadow-rose-100/50">
          {/* Icon */}
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2">Subscription Expired</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Your Portal HMS subscription has expired. Please renew your subscription to continue managing your hostel.
          </p>

          {/* Bank Details */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-left mb-6 space-y-3">
            <p className="font-black text-amber-800 text-sm uppercase tracking-widest">Renew via Bank Transfer</p>
            {[
              { label: "Bank", value: "HBL" },
              { label: "Account", value: "01234567890123" },
              { label: "Title", value: "Portal HMS Pvt Ltd" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-amber-700 text-xs font-bold">{label}</span>
                <span className="text-amber-900 text-sm font-black font-mono">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="mailto:support@portalhms.com"
              className="w-full h-11 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all text-sm"
            >
              <Mail className="w-4 h-4" /> Email Support to Renew
            </a>
            <a
              href="https://wa.me/923001234567"
              className="w-full h-11 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all text-sm"
            >
              <Phone className="w-4 h-4" /> WhatsApp Support
            </a>
            <Link
              href="/admin/subscription"
              className="w-full h-11 bg-gray-100 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all text-sm"
            >
              <Crown className="w-4 h-4" /> View Subscription Details
            </Link>
          </div>

          <p className="text-gray-400 text-xs mt-6">
            Activation usually takes less than 24 hours after payment confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}
