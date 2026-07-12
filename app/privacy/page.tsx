"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { DpdpWorkspace } from "../../components/DpdpWorkspace";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between py-8 px-6 sm:px-12 md:px-16 lg:px-20">
      <main className="w-full max-w-[1536px] mx-auto space-y-6">
        {/* Navigation Back Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950 transition-all duration-150 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Diagnostic Workspace</span>
          </Link>
          <span className="text-xs font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Dedicated Statutory Privacy Portal</span>
          </span>
        </div>

        {/* Full DPDP Act 2023 Compliance & Privacy Center */}
        <DpdpWorkspace />
      </main>

      <footer className="mt-12 py-6 border-t border-slate-200/80 text-center text-xs text-slate-500 font-medium">
        SpeechMetric &copy; {new Date().getFullYear()} • Data Fiduciary under India&apos;s Digital Personal Data Protection Act, 2023
      </footer>
    </div>
  );
}
