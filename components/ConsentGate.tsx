"use client";

import { useState, useEffect } from "react";
import { Shield, ArrowRight, Lock, Check, Eye } from "lucide-react";

interface ConsentGateProps {
  onConsentGiven: () => void;
}

export function ConsentGate({ onConsentGiven }: ConsentGateProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedAudio, setAcceptedAudio] = useState(false);
  const [showFullNotice, setShowFullNotice] = useState(false);

  const handleAgree = () => {
    if (acceptedTerms && acceptedAudio) {
      localStorage.setItem("dpdp_consent_v1", "true");
      onConsentGiven();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="consent-modal">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Banner */}
        <div className="bg-slate-900 text-white p-6 flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl text-emerald-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Privacy Notice & Consent</h2>
            <p className="text-sm text-slate-300 mt-1">
              Compliant with the Digital Personal Data Protection (DPDP) Act, 2023, India.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome to Livo AI&apos;s Pronunciation Assessment tool. To analyze your pronunciation, we collect and process your audio recordings and generate temporary transcriptions. We value your privacy and process all data in compliance with DPDP 2023 rules.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <Lock className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Data Security</h4>
                <p className="text-xs text-slate-600 mt-1">Audio is transferred securely using HTTPS, processed temporarily, and never used for model training.</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <Eye className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Minimization</h4>
                <p className="text-xs text-slate-600 mt-1">We collect only the vocal features necessary to score speech. Audio is deleted immediately after analysis.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl cursor-pointer border border-slate-200/60 transition-all duration-150 active:scale-[0.98]">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900 mt-1 shrink-0"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I agree to the Livo AI Privacy Policy and Terms of Use. I understand my data is processed solely for providing pronunciation scores.
              </span>
            </label>

            <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl cursor-pointer border border-slate-200/60 transition-all duration-150 active:scale-[0.98]">
              <input
                type="checkbox"
                checked={acceptedAudio}
                onChange={(e) => setAcceptedAudio(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900 mt-1 shrink-0"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I explicitly consent to Livo AI recording my voice, storing it temporarily, transmitting it to Google Gemini API for phonetic analysis, and displaying the transcript.
              </span>
            </label>
          </div>

          {/* Collapsible details */}
          <div>
            <button
              onClick={() => setShowFullNotice(!showFullNotice)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline flex items-center gap-1 cursor-pointer transition-all duration-150 active:scale-95"
            >
              {showFullNotice ? "Hide Detailed Rights & Disclosures" : "Show Detailed Rights & Disclosures (DPDP Section 4)"}
            </button>

            {showFullNotice && (
              <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 text-slate-600 leading-relaxed max-h-40 overflow-y-auto">
                <p className="font-bold text-slate-800">1. Data Principal Rights (Your Rights):</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Right to Withdraw Consent:</strong> You can withdraw consent at any time, which stops further processing.</li>
                  <li><strong>Right to Correction & Erasure:</strong> You can request deletion of any locally persisted analysis history.</li>
                  <li><strong>Right of Grievance Redressal:</strong> Reach out to Livo AI Support for privacy grievances.</li>
                </ul>
                <p className="font-bold text-slate-800 mt-2">2. Processing & Storage:</p>
                <p>We process your voice recordings in real-time. No raw audio files are stored long-term on our servers. Calculated score history is saved in your browser&apos;s local cache unless cleared. The Gemini API is used as the processing engine under strict confidentiality terms.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4 shrink-0">
          <span className="text-xs font-mono text-slate-500">
            DPDP India compliant
          </span>
          <button
            onClick={handleAgree}
            disabled={!acceptedTerms || !acceptedAudio}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium tracking-tight flex items-center gap-2 transition-all duration-150 ${
              acceptedTerms && acceptedAudio
                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md cursor-pointer active:scale-95"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Agree and Proceed
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
