"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

function JoinContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="bg-white py-8 px-6 shadow-xl sm:rounded-3xl border border-slate-100 max-w-md w-full text-center">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-7 h-7 text-emerald-600" />
      </div>

      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
        Creator Campaign Invite
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
        You have been invited by an Ethiopian merchant to collaborate and promote their campaign. No passwords required.
      </p>

      {token ? (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Invite Authorization Token
            </span>
            <div className="font-mono text-xs text-slate-700 truncate select-all">
              {token}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-left text-xs text-emerald-800 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Token Verified</span>
            </div>
            <p className="text-[11px] text-emerald-700/80">
              One-click claim and creator performance dashboard will be fully activated in Ticket #8.
            </p>
          </div>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-sm"
          >
            <span>Learn About EthioLink</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          Missing invitation token. Please check the link provided by your brand partner.
        </div>
      )}
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20">
            E
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">EthioLink</span>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="bg-white py-12 px-6 rounded-3xl border border-slate-100 shadow-xl max-w-md w-full text-center animate-pulse">
            <div className="w-12 h-12 bg-slate-200 rounded-2xl mx-auto mb-4" />
            <div className="w-48 h-6 bg-slate-200 rounded mx-auto mb-2" />
            <div className="w-64 h-4 bg-slate-100 rounded mx-auto mb-6" />
          </div>
        }
      >
        <JoinContent />
      </Suspense>
    </div>
  );
}
