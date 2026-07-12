"use client";

import React from "react";
import { Shield, Lock, Info, BarChart3 } from "lucide-react";

interface FooterProps {
  onOpenModal: (modal: "privacy" | "scoring" | "about") => void;
}

export function Footer({ onOpenModal }: FooterProps) {
  return (
    <footer className="border-t border-zinc-200/80 bg-white py-8 px-6 mt-12" id="footer-rail">
      <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left Side: Brand & DPDP Indicators */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
          {/* Logo & Brand text */}
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 rounded-xl w-10 h-10 flex items-center justify-center text-white shadow-xs shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 9V15M8 6V18M12 3V21M16 6V18M20 9V15" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-zinc-950 tracking-tight leading-none">SpeechMetric</h3>
              <p className="text-[9px] font-bold text-zinc-400 tracking-wider font-mono mt-0.5">
                AI PRONUNCIATION ASSESSMENT
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <div className="bg-[#f0f4ff] text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1">
              <Shield className="h-3 w-3 text-indigo-600" />
              DPDP-ALIGNED ARCHITECTURE
            </div>
            <div className="bg-[#ecfdf5] text-[#059669] border border-emerald-100 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-600" />
              STATELESS AUDIO PROCESSING
            </div>
          </div>
        </div>

        {/* Right Side: Description and Equalizer wave */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 w-full lg:w-auto lg:max-w-2xl justify-end">
          <div className="text-left sm:text-right space-y-1">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Your audio is processed transiently to generate pronunciation feedback and is not permanently retained.
            </p>
            <div className="flex flex-wrap gap-2.5 justify-start sm:justify-end text-[10px] font-medium text-zinc-400">
              <button 
                onClick={() => onOpenModal("privacy")}
                className="hover:text-zinc-600 underline cursor-pointer"
                id="footer-modal-privacy-link"
              >
                Privacy & Data
              </button>
              <span>•</span>
              <button 
                onClick={() => onOpenModal("scoring")}
                className="hover:text-zinc-600 underline cursor-pointer"
                id="footer-modal-scoring-link"
              >
                How Scoring Works
              </button>
              <span>•</span>
              <button 
                onClick={() => onOpenModal("about")}
                className="hover:text-zinc-600 underline cursor-pointer"
                id="footer-modal-about-link"
              >
                About SpeechMetric
              </button>
            </div>
          </div>

          {/* Dot Equalizer Wave */}
          <div className="hidden md:flex items-end gap-1 opacity-25 select-none pointer-events-none h-6 shrink-0 z-0">
            {[6, 12, 18, 10, 14, 22, 16, 12, 6, 10, 16, 8].map((h, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                {Array.from({ length: Math.ceil(h / 4) }).map((_, dotIdx) => (
                  <div key={dotIdx} className="w-1 h-1 rounded-full bg-zinc-800" />
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
      
      {/* Small copyright row */}
      <div className="mt-6 pt-4 border-t border-zinc-150 flex flex-col sm:flex-row justify-between items-center gap-2 text-[9px] text-zinc-400 font-medium">
        <span>© 2026 SpeechMetric | DPDP Act 2023 Compliant</span>
        <span>India Data Residency Compliant & Encrypted</span>
      </div>
    </footer>
  );
}
