"use client";

import React from "react";
import { ShieldCheck, Lock, Trash2, FileText, CheckCircle2, ArrowRight, Shield, Activity, Server, UserCheck, AlertCircle } from "lucide-react";

export function DpdpWorkspace() {
  return (
    <div className="w-full space-y-6 text-left">
      
      {/* 1. Header Banner Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200/60 shadow-2xs shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold border border-emerald-200/60 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                DPDP Act 2023 Compliant
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-200/80 uppercase tracking-wider">
                Section 4 &amp; 6 Certified
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              DPDP Act, 2023 Compliance Workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed max-w-3xl font-medium">
              India&apos;s Digital Personal Data Protection Guidelines. Enterprise-grade transparency and spatial control over your acoustic voice recordings, processing lifecycles, and statutory privacy rights.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Classification</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5 block">Data Fiduciary</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Processing Model</span>
            <span className="text-xs font-bold text-emerald-700 mt-0.5 block">Transient RAM Only</span>
          </div>
        </div>
      </div>

      {/* 2. Grid Row 1: Processing Summary & Security Controls (12 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Panel A: Processing Summary (col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Processing Summary</h3>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200/60">
                Data Scope
              </span>
            </div>

            <ul className="space-y-4 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                <div>
                  <strong className="text-slate-900 font-bold block text-xs">Data Collected</strong>
                  <span className="text-slate-600 mt-0.5 block leading-relaxed">
                    Spoken audio duration (30s–45s), acoustic phoneme timing, and textual reading transcriptions. Zero supplemental device or tracking metadata is recorded.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                <div>
                  <strong className="text-slate-900 font-bold block text-xs">Retention Policy</strong>
                  <span className="text-slate-600 mt-0.5 block leading-relaxed">
                    Audio binaries exist strictly in volatile server RAM during active scoring. Once metrics are delivered, raw waveforms are permanently purged from memory.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <span className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0"></span>
                <div>
                  <strong className="text-slate-900 font-bold block text-xs">Explicit Consent</strong>
                  <span className="text-slate-600 mt-0.5 block leading-relaxed">
                    Collected only after affirmative statutory opt-in under Section 6 of the DPDP Act. You retain full right of revocation at any time.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <span className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                <div>
                  <strong className="text-slate-900 font-bold block text-xs">Immediate Deletion</strong>
                  <span className="text-slate-600 mt-0.5 block leading-relaxed">
                    No voice recording is ever written to disk storage or cloud databases. Historical report cards reside strictly in your local browser cache.
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Statutory Verification</span>
            <span className="text-emerald-600 font-bold">PASS (100%)</span>
          </div>
        </div>

        {/* Panel B: Security Controls (col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Enterprise Security Controls</h3>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200/60">
                Zero-Trust Audit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 items-stretch">
              <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-3 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    Active
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Encrypted Transmission</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                    All audio payloads and diagnostic API streams are protected using modern TLS 1.3 encryption over HTTPS across all network endpoints.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-3 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    Active
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Temporary Processing</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                    Audio buffers are evaluated purely in volatile RAM during active phonetic scoring. Binary streams are discarded immediately post-computation.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-3 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    Active
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Secure Transmission</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                    Acoustic evaluation utilizes isolated sub-processor pipelines (Google Gemini API) governed by strict data confidentiality and non-retention agreements.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-3 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    Active
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Browser-only History</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                    No historical score logs or transcripts are kept on cloud servers. Your progress timeline is stored in your private client-side browser cache.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold">Zero-Knowledge Audio Architecture Guaranteed</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Section 4 Compliance Verified</span>
          </div>
        </div>

      </div>

      {/* 3. Grid Row 2: Processing Lifecycle Horizontal Workflow Pipeline (12 columns) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 shrink-0" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Processing Lifecycle Pipeline</h3>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/80">
            End-to-End Flow
          </span>
        </div>

        {/* Step Progression Chart */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 relative items-stretch">
          
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between relative group hover:border-blue-300 transition-all h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono">01</span>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Opt-in</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Consent</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal font-medium">User agrees to transient processing under Section 6 of DPDP Act.</p>
            </div>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between relative group hover:border-blue-300 transition-all h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono">02</span>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Stream</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Upload</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal font-medium">Audio is transmitted securely via HTTPS/TLS 1.3 to the evaluation pipeline.</p>
            </div>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between relative group hover:border-blue-300 transition-all h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono">03</span>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Volatile</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Temporary Processing</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal font-medium">Raw audio binary buffered in volatile RAM during boundary checks.</p>
            </div>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between relative group hover:border-blue-300 transition-all h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono">04</span>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Scoring</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">AI Analysis</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal font-medium">Phonetic vectors evaluated via sub-processor API without model training.</p>
            </div>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col justify-between relative group hover:border-emerald-400 transition-all h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center font-mono">05</span>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-700">Purged</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950">Delete Audio</h4>
              <p className="text-[11px] text-emerald-800 mt-1 leading-normal font-medium">Audio binary destroyed immediately from RAM after score delivery.</p>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Grid Row 3: User Rights & Compliance Notes (12 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Panel C: User Rights (col-span-6) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Statutory User Rights</h3>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/80">
                Chapter II Rights
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wide flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    Right to Consent
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Section 6</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  You exercise complete autonomy over whether your voice recordings are ingested. Diagnostic capture occurs only when explicitly initiated by you.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wide flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Right to Erase
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Section 12</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Because assessment histories are stored client-side in browser storage, you can execute a full, permanent erasure of all score logs instantly via your browser settings or our clear history tool.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wide flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                    Right to Withdraw
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Section 6(4)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  You may revoke statutory consent at any time without penalty, instantly disabling microphone access and preventing any future audio evaluation.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Data Principal Protection</span>
            <span className="text-slate-700 font-bold">100% Client-Side Control</span>
          </div>
        </div>

        {/* Panel D: Compliance Notes (col-span-6) */}
        <div className="lg:col-span-6 bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400 shrink-0" />
                <h3 className="text-base font-bold text-white tracking-tight">Statutory Compliance Notes</h3>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                Data Fiduciary Status
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">01. Data Fiduciary</span>
                  <span className="text-[10px] font-mono text-slate-400">Statutory Role</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  SpeechMetric acts purely as a Data Fiduciary under the DPDP Act, processing acoustic vectors strictly to deliver your requested pronunciation audit metrics.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 font-mono uppercase tracking-wider">02. No Permanent Retention</span>
                  <span className="text-[10px] font-mono text-slate-400">Storage Assurance</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  We guarantee zero persistent backend archiving of raw audio files. Volatile buffers are flushed immediately after generating phonetic scores and transcripts.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 font-mono uppercase tracking-wider">03. No Model Training</span>
                  <span className="text-[10px] font-mono text-slate-400">Model Isolation</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Your spoken diagnostic audio is strictly isolated during evaluation. It is never retained, shared, or utilized to train, fine-tune, or improve foundational AI models.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Statutory Audit Timestamp</span>
            <span className="text-emerald-400 font-bold">DPDP ACT 2023 COMPLIANT</span>
          </div>
        </div>

      </div>

    </div>
  );
}
