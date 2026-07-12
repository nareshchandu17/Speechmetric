"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { DpdpWorkspace } from "./DpdpWorkspace";

interface ConsentGateProps {
  onConsentGiven: () => void;
}

export function ConsentGate({ onConsentGiven }: ConsentGateProps) {
  const [consentGiven, setConsentGiven] = useState(false);

  const handleAgree = () => {
    if (consentGiven) {
      localStorage.setItem("dpdp_consent_v1", "true");
      onConsentGiven();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f8fafc] flex flex-col justify-between min-h-screen" id="consent-modal">
      
      {/* Main Wide Desktop SaaS Workspace Viewport */}
      <main className="flex-1 w-full max-w-[1536px] mx-auto px-8 sm:px-12 md:px-16 lg:px-20 py-8 md:py-10 space-y-6 overflow-x-hidden">
        
        {/* Render our 12-column multi-panel dashboard */}
        <DpdpWorkspace />

        {/* Consent Confirmation Box aligned with the workspace width */}
        <div className="w-full mt-6 text-left">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Statutory Consent Confirmation</h3>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200/60">
                Required for Entry
              </span>
            </div>
            
            <label className="flex items-start gap-3.5 p-4 sm:p-5 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl cursor-pointer border border-slate-200/80 transition-all duration-150 active:scale-[0.99] focus-within:ring-2 focus-within:ring-blue-600">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 border-slate-300 focus:ring-blue-600 mt-0.5 shrink-0 cursor-pointer"
              />
              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-normal">
                  I acknowledge and freely give my explicit consent to SpeechMetric under Section 6 of the DPDP Act, 2023.
                </span>
                <span className="text-xs text-slate-600 leading-relaxed block font-medium">
                  I have read and understood the full statutory disclosure above, including purpose of processing, transient in-memory audio evaluation, zero permanent server retention, and my statutory data principal rights.
                </span>
              </div>
            </label>
          </div>
        </div>

      </main>

      {/* Sticky Bottom Action Bar */}
      <footer className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200/80 py-4 px-8 sm:px-12 md:px-16 lg:px-20 shadow-lg shrink-0">
        <div className="w-full max-w-[1536px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200/60 shrink-0 shadow-2xs">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">DPDP Act, 2023 Statutory Compliance</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">Check the box above to enable access to the diagnostic workspace.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAgree}
            disabled={!consentGiven}
            className={`h-11 px-6 rounded-xl text-sm font-bold tracking-tight flex items-center justify-center gap-2.5 transition-all duration-150 focus:outline-none shrink-0 w-full sm:w-auto ${
              consentGiven
                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-sm cursor-pointer active:scale-[0.98]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span>Agree &amp; Enter Workspace</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </footer>
    </div>
  );
}

