"use client";

import { useState, useEffect } from "react";
import { IngestCard } from "../components/IngestCard";
import { DiagnosticDashboard } from "../components/DiagnosticDashboard";
import { HistoryCard } from "../components/HistoryCard";
import { ScoreTrendChart } from "../components/ScoreTrendChart";
import { SessionCompare } from "../components/SessionCompare";
import { ConsentGate } from "../components/ConsentGate";
import { SavedSession } from "./types";
import { SEED_SESSION } from "./seed";
import { Shield, Sparkles, BookOpen, Volume2, Info, Moon, Sun, AlertCircle, LayoutDashboard, History, ShieldCheck, FileText, Activity, Award } from "lucide-react";

export default function Page() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [activeSession, setActiveSession] = useState<SavedSession | null>(null);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"checker" | "analytics" | "dpdp">("checker");

  // Check consent and load history on mount
  useEffect(() => {
    const consent = localStorage.getItem("dpdp_consent_v1");
    setHasConsent(consent === "true");

    const cachedHistory = localStorage.getItem("livo_assessments_v1");
    if (cachedHistory) {
      try {
        const parsed = JSON.parse(cachedHistory) as SavedSession[];
        setHistory(parsed);
        if (parsed.length > 0) {
          setActiveSession(parsed[0]);
        }
      } catch (e) {
        console.error("Failed to load history cache:", e);
      }
    } else {
      // First load, populate with SEED_SESSION
      const defaultHistory = [SEED_SESSION];
      setHistory(defaultHistory);
      setActiveSession(SEED_SESSION);
      localStorage.setItem("livo_assessments_v1", JSON.stringify(defaultHistory));
    }
  }, []);

  const handleConsentGiven = () => {
    setHasConsent(true);
  };

  const handleAnalysisStart = (stage: string) => {
    setErrorMessage(null);
  };

  const handleAnalysisSuccess = (newSession: SavedSession) => {
    const updatedHistory = [newSession, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("livo_assessments_v1", JSON.stringify(updatedHistory));
    setActiveSession(newSession);
    setActiveTab("checker");
  };

  const handleAnalysisError = (err: string) => {
    setErrorMessage(err);
  };

  const handleSelectSession = (session: SavedSession) => {
    setActiveSession(session);
    setErrorMessage(null);
    setActiveTab("checker");
    // Smooth scroll to dashboard
    document.getElementById("diagnostic-dashboard")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleToggleCompareId = (id: string) => {
    setSelectedCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 2) {
        // Replace oldest
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  // Find selected comparison sessions
  const compareSessionA = history.find((s) => s.id === selectedCompareIds[0]);
  const compareSessionB = history.find((s) => s.id === selectedCompareIds[1]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc]">
      
      {/* DPDP Consent Modal Gate */}
      {hasConsent === false && (
        <ConsentGate onConsentGiven={handleConsentGiven} />
      )}

      {/* Left Sidebar Layout */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0">
        
        {/* Brand Header */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
              L
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 font-sans">Livo AI</span>
              <span className="text-[10px] font-mono text-slate-500 block -mt-1 uppercase tracking-widest font-bold">
                ENGLISH AUDIO CHECK
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-left">
            <button
              type="button"
              onClick={() => setActiveTab("checker")}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "checker"
                  ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50"
                  : "text-slate-600 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Diagnostic Board
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50"
                  : "text-slate-600 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <History className="w-4 h-4" />
              History & Trends
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dpdp")}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "dpdp"
                  ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50"
                  : "text-slate-600 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              DPDP Privacy Policy
            </button>
          </nav>
        </div>

        {/* Profile Card & Security Badge */}
        <div className="space-y-4 pt-4 border-t border-slate-100 mt-6 lg:mt-0 text-left">
          {/* Compliance Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
            <Shield className="w-3.5 h-3.5" />
            DPDP India Compliant
          </div>

          {/* Lead Engineer Badge */}
          <div className="flex items-center gap-2.5 p-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
              NC
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 font-sans leading-none">Naresh Chandu</p>
              <p className="text-[9px] font-mono font-bold text-slate-400 mt-0.5 tracking-wider uppercase">Lead Product Eng.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Global Error Notice */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-start gap-3 text-rose-800 shadow-sm text-left">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold">Analysis Pre-flight Error</h4>
              <p className="text-xs mt-0.5 leading-relaxed font-semibold">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Tab Switchboard */}
        <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-w-7xl w-full mx-auto">
          
          {/* If 2 comparison items are selected, override view with Comparison Dashboard */}
          {compareSessionA && compareSessionB ? (
            <SessionCompare
              sessionA={compareSessionA}
              sessionB={compareSessionB}
              onClose={() => setSelectedCompareIds([])}
            />
          ) : (
            <>
              {activeTab === "checker" && (
                <>
                  {activeSession ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-left border-b border-slate-100 pb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
                        <h2 className="text-base font-black tracking-tight text-slate-900 font-sans uppercase">
                          pronunciation audit workspace
                        </h2>
                      </div>
                      
                      <DiagnosticDashboard
                        session={activeSession}
                        ingestCard={
                          <IngestCard
                            onAnalysisStart={handleAnalysisStart}
                            onAnalysisProgress={() => {}}
                            onAnalysisSuccess={handleAnalysisSuccess}
                            onAnalysisError={handleAnalysisError}
                          />
                        }
                      />
                    </div>
                  ) : (
                    <div className="h-96 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-white/50">
                      <BookOpen className="w-12 h-12 text-slate-300 mb-3 animate-bounce" />
                      <p className="text-sm font-bold text-slate-600">No report loaded</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs">
                        Upload an audio file or start recording with your microphone to generate a pronunciation audit report.
                      </p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "analytics" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left panel: Session History list */}
                  <div className="lg:col-span-5 space-y-6">
                    <HistoryCard
                      history={history}
                      activeSessionId={activeSession?.id || null}
                      onSelectSession={handleSelectSession}
                      selectedCompareIds={selectedCompareIds}
                      onToggleCompareId={handleToggleCompareId}
                    />
                  </div>

                  {/* Right panel: Trends and graph chart */}
                  <div className="lg:col-span-7 space-y-6">
                    <ScoreTrendChart history={history} />
                  </div>
                </div>
              )}

              {activeTab === "dpdp" && (
                <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-8 text-left space-y-5 shadow-sm">
                  <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-slate-900">
                        DPDP Act, 2023 Compliance
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">India&apos;s Digital Personal Data Protection Act policy guidelines</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs text-slate-600 leading-relaxed font-semibold">
                    <p>
                      In accordance with India&apos;s Digital Personal Data Protection Act (DPDP), 2023, Livo AI processes personal data under the strict classification of a <strong>Data Fiduciary</strong>. Your raw voice recordings, transcriptions, and generated performance metrics constitute personal diagnostic data.
                    </p>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide font-mono">Our Security & De-identification Safeguards:</h4>
                      <ul className="list-disc pl-4 space-y-2">
                        <li><strong>Data Minimization:</strong> We only collect speech duration boundaries (30s-45s) and evaluate raw waveforms strictly required to yield scoring. No supplemental metadata is recorded.</li>
                        <li><strong>Transient In-Memory Processing:</strong> Your audio uploads and records are processed strictly in-memory during evaluation. Raw audio binaries are destroyed immediately upon delivery of score metrics.</li>
                        <li><strong>No Permanent Cloud Persistence:</strong> No raw voice metrics or voice data is stored permanently on server disks. Your reports and logs are maintained using private client-side browser cache (local storage).</li>
                        <li><strong>No Model Training:</strong> Your private recordings are strictly prohibited from being utilized for model optimization, fine-tuning, or external provider training loops.</li>
                      </ul>
                    </div>

                    <p className="text-slate-500 text-[11px] font-medium italic">
                      You can revoke consent or purge your browser metrics archive at any time by clearing your browser cache.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Global Footer */}
        <footer className="bg-white border-t border-slate-200/80 py-4 px-6 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
            <span>&copy; {new Date().getFullYear()} Livo AI Evaluator.</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Secure & De-identified
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </footer>

      </main>

    </div>
  );
}
