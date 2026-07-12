"use client";

import { useState, useEffect } from "react";
import { IngestCard } from "../components/IngestCard";
import { DiagnosticDashboard } from "../components/DiagnosticDashboard";
import { HistoryCard } from "../components/HistoryCard";
import { ScoreTrendChart } from "../components/ScoreTrendChart";
import { SessionCompare } from "../components/SessionCompare";
import { ConsentGate } from "../components/ConsentGate";
import { DpdpWorkspace } from "../components/DpdpWorkspace";
import { SavedSession } from "./types";
import { SEED_SESSION } from "./seed";
import { Shield, Sparkles, BookOpen, Volume2, Info, Moon, Sun, AlertCircle, LayoutDashboard, History, ShieldCheck, FileText, Activity, Award } from "lucide-react";

type AnalysisState = "idle" | "consent" | "ready" | "recording" | "uploading" | "processing" | "completed" | "error";

export default function Page() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [activeSession, setActiveSession] = useState<SavedSession | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SavedSession | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [rememberHistory, setRememberHistory] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<string>("");
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"checker" | "analytics" | "dpdp">("checker");

  // Check consent and load history on mount without auto-restoring into activeSession
  useEffect(() => {
    const consent = localStorage.getItem("dpdp_consent_v1");
    const hasConsentStored = consent === "true";
    setHasConsent(hasConsentStored);
    if (!hasConsentStored) {
      setAnalysisState("consent");
    } else {
      setAnalysisState("ready");
    }

    const rememberVal = localStorage.getItem("livo_remember_history_v1") === "true";
    setRememberHistory(rememberVal);

    const cachedHistory = localStorage.getItem("livo_assessments_v1");
    if (cachedHistory) {
       try {
         const parsed = JSON.parse(cachedHistory) as SavedSession[];
         setHistory(parsed);
         // Do NOT auto-load previous assessments into activeSession on initial mount.
         // Application starts clean as a first-time experience.
       } catch (e) {
         console.error("Failed to load history cache:", e);
       }
    } else {
       // Seed initial sample data only into history array for History tab inspection if needed,
       // without loading it into the active workspace.
       const defaultHistory = [SEED_SESSION];
       setHistory(defaultHistory);
       localStorage.setItem("livo_assessments_v1", JSON.stringify(defaultHistory));
    }
  }, []);

  const handleConsentGiven = () => {
    setHasConsent(true);
    setAnalysisState("ready");
  };

  const handleAnalysisStart = (stage: string) => {
    setAnalysisState("processing");
    setCurrentStage(stage || "Validating audio sample");
    setErrorMessage(null);
  };

  const handleAnalysisProgress = (stage: string) => {
    setAnalysisState("processing");
    setCurrentStage(stage);
  };

  const handleAnalysisSuccess = (newSession: SavedSession) => {
    const updatedHistory = [newSession, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("livo_assessments_v1", JSON.stringify(updatedHistory));
    setAnalysisResult(newSession);
    setActiveSession(newSession);
    setAnalysisState("completed");
    setActiveTab("checker");
  };

  const handleAnalysisError = (err: string) => {
    setErrorMessage(err);
    setAnalysisState("error");
  };

  const handleStartNewSession = () => {
    setAnalysisResult(null);
    setActiveSession(null);
    setAnalysisState("ready");
    setErrorMessage(null);
  };

  const handleSelectSession = (session: SavedSession) => {
    if (rememberHistory && activeTab === "analytics") {
      setActiveSession(session);
      setAnalysisResult(session);
      setAnalysisState("completed");
      setErrorMessage(null);
      setActiveTab("checker");
      document.getElementById("diagnostic-dashboard")?.scrollIntoView({ behavior: "smooth" });
    } else if (!rememberHistory) {
      alert('Please enable "Remember previous assessments on this device" in the History tab to load historical reports.');
    } else {
      setActiveSession(session);
      setAnalysisResult(session);
      setAnalysisState("completed");
      setErrorMessage(null);
      setActiveTab("checker");
      document.getElementById("diagnostic-dashboard")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleToggleCompareId = (id: string) => {
    setSelectedCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    setActiveSession(null);
    setSelectedCompareIds([]);
    localStorage.removeItem("livo_assessments_v1");
  };

  // Find selected comparison sessions
  const compareSessionA = history.find((s) => s.id === selectedCompareIds[0]);
  const compareSessionB = history.find((s) => s.id === selectedCompareIds[1]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      
      {/* DPDP Consent Modal Gate */}
      {hasConsent === false && (
        <ConsentGate onConsentGiven={handleConsentGiven} />
      )}

      {/* Top Navbar Layout */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs shrink-0">
        <div className="w-full max-w-[1536px] mx-auto px-8 sm:px-12 md:px-16 lg:px-20 h-16 flex items-center justify-between gap-4">
          
          {/* Left Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-2xs">
              S
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900 block leading-none">SpeechMetric</span>
              <span className="text-[10px] font-mono text-slate-500 block mt-1 uppercase tracking-wider font-semibold">
                ENGLISH AUDIO CHECK
              </span>
            </div>
          </div>

          {/* Center Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab("checker")}
              className={`h-9 px-4 rounded-xl text-xs font-medium flex items-center gap-2 transition-all duration-150 cursor-pointer focus:outline-none ${
                activeTab === "checker"
                  ? "bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>Diagnostic Board</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`h-9 px-4 rounded-xl text-xs font-medium flex items-center gap-2 transition-all duration-150 cursor-pointer focus:outline-none ${
                activeTab === "analytics"
                  ? "bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent"
              }`}
            >
              <History className="w-3.5 h-3.5 shrink-0" />
              <span>History &amp; Trends</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dpdp")}
              className={`h-9 px-4 rounded-xl text-xs font-medium flex items-center gap-2 transition-all duration-150 cursor-pointer focus:outline-none ${
                activeTab === "dpdp"
                  ? "bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>DPDP Privacy Policy</span>
            </button>
          </nav>

          {/* Right Profile & Compliance Pill */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-mono font-medium border border-emerald-200/60">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>DPDP India Compliant</span>
            </div>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/80">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">
                NC
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">Naresh Chandu</p>
                <p className="text-[10px] font-mono font-medium text-slate-500 mt-0.5 uppercase tracking-wider">Lead Product Eng.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile Navigation Bar for smaller screens */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-200/80 px-4 py-2 bg-slate-50/80">
          <button
            type="button"
            onClick={() => setActiveTab("checker")}
            className={`h-8 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "checker"
                ? "bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/80"
                : "text-slate-600"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
            <span>Diagnostic Board</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`h-8 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "analytics"
                ? "bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/80"
                : "text-slate-600"
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            <span>History</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dpdp")}
            className={`h-8 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "dpdp"
                ? "bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/80"
                : "text-slate-600"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>DPDP Policy</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Global Error Notice */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border-b border-rose-200/80 flex items-start gap-3 text-rose-800 shadow-2xs text-left">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-rose-600" />
            <div>
              <h4 className="text-sm font-semibold">Analysis Pre-flight Error</h4>
              <p className="text-xs mt-0.5 leading-relaxed text-rose-700 font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Tab Switchboard */}
        <div className="flex-1 w-full max-w-[1536px] mx-auto px-8 sm:px-12 md:px-16 lg:px-20 py-8 md:py-10 space-y-8 overflow-y-auto">
          
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
                  {activeSession && analysisState === "completed" ? (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-6 duration-700 ease-out fill-mode-both">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                        <div className="flex items-center gap-2 text-left">
                          <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></div>
                          <h2 className="text-xs font-semibold tracking-wider text-slate-600 uppercase font-mono">
                            Pronunciation Audit Workspace
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={handleStartNewSession}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>New Speech Assessment</span>
                        </button>
                      </div>
                      
                      <DiagnosticDashboard
                        session={activeSession}
                        ingestCard={
                          <IngestCard
                            onAnalysisStart={handleAnalysisStart}
                            onAnalysisProgress={handleAnalysisProgress}
                            onAnalysisSuccess={handleAnalysisSuccess}
                            onAnalysisError={handleAnalysisError}
                          />
                        }
                      />
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in-0 duration-500">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                        <div className="flex items-center gap-2 text-left">
                          <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></div>
                          <h2 className="text-xs font-semibold tracking-wider text-slate-600 uppercase font-mono">
                            Pronunciation Audit Workspace — First-Time Assessment
                          </h2>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60">
                          State: {analysisState.toUpperCase()}
                        </span>
                      </div>

                      {/* 2-Column Clean Initial Workspace */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                        
                        {/* Left Column: Audio Ingestion Panel */}
                        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                          <IngestCard
                            onAnalysisStart={handleAnalysisStart}
                            onAnalysisProgress={handleAnalysisProgress}
                            onAnalysisSuccess={handleAnalysisSuccess}
                            onAnalysisError={handleAnalysisError}
                          />
                        </div>

                        {/* Right Column: Dynamic Status Companion / Empty State Illustration */}
                        <div className="lg:col-span-6 flex flex-col justify-between">
                          {analysisState === "error" || errorMessage ? (
                            <div className="bg-white rounded-2xl border border-rose-200/80 p-6 sm:p-8 shadow-2xs h-full flex flex-col justify-between space-y-6 text-left animate-in fade-in-0 duration-300">
                              <div>
                                <div className="flex items-center gap-2.5 text-rose-600 border-b border-rose-100 pb-4 mb-4">
                                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/60">
                                    <AlertCircle className="w-6 h-6 shrink-0" />
                                  </div>
                                  <div>
                                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Pronunciation Analysis Failed</h3>
                                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-rose-600">Pre-flight Error</span>
                                  </div>
                                </div>
                                <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                                  We couldn&apos;t analyze your recording.
                                </p>
                                <p className="text-xs text-slate-600 leading-relaxed mt-2 font-medium">
                                  {errorMessage || "Please try again with another 30–45 second English speech sample."}
                                </p>
                              </div>

                              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setErrorMessage(null);
                                    setAnalysisState("ready");
                                  }}
                                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-tight transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                  <span>Retry Assessment</span>
                                </button>
                                <span className="text-[11px] font-mono text-slate-400">Or use the microphone/upload panel on the left to submit a new recording.</span>
                              </div>
                            </div>
                          ) : analysisState === "processing" ? (
                            <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xs h-full flex flex-col justify-between space-y-6 text-left animate-in fade-in-0 duration-300 relative overflow-hidden">
                              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                              <div>
                                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                      <Activity className="w-5 h-5 animate-pulse" />
                                    </div>
                                    <div>
                                      <h3 className="text-base font-bold text-white tracking-tight">Pronunciation Engine Active</h3>
                                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-blue-400">Step Progression</span>
                                    </div>
                                  </div>
                                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                                    <span>Processing</span>
                                  </span>
                                </div>

                                <div className="space-y-4 my-4">
                                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-mono">
                                      <span className="text-slate-300 font-semibold">Active Stage</span>
                                      <span className="text-blue-400 font-bold">LIVE PIPELINE</span>
                                    </div>
                                    <p className="text-sm font-bold text-white tracking-wide">
                                      {currentStage || "Analyzing pronunciation clarity & transcribing phonetics..."}
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                                      <span>Acoustic vector validation</span>
                                      <span>In progress...</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full animate-[loading_12s_ease-in-out_infinite]"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                                <span>DPDP Section 6 Compliant</span>
                                <span className="text-emerald-400 font-bold">Volatile RAM Evaluation</span>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs h-full flex flex-col justify-between space-y-6 text-left animate-in fade-in-0 duration-500">
                              <div>
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                                      <Volume2 className="w-5 h-5 shrink-0" />
                                    </div>
                                    <div>
                                      <h3 className="text-base font-bold text-slate-900 tracking-tight">Pronunciation Report Workspace</h3>
                                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">Awaiting Audio Sample</span>
                                    </div>
                                  </div>
                                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200/80">
                                    Empty Workspace
                                  </span>
                                </div>

                                <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex flex-col items-center justify-center text-center my-4 space-y-4 min-h-[220px] relative overflow-hidden group">
                                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-blue-600 relative group-hover:scale-105 transition-all duration-300">
                                    <Volume2 className="w-8 h-8 stroke-[1.5]" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white animate-pulse"></div>
                                  </div>
                                  <div>
                                    <h4 className="text-base font-bold text-slate-900 tracking-tight">
                                      No pronunciation assessment yet.
                                    </h4>
                                    <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1.5 leading-relaxed font-medium">
                                      Record or upload a 30–45 second English speech sample to generate a personalized pronunciation report.
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                  <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-200/60 space-y-1">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 block">01 / Phonetics</span>
                                    <p className="text-xs font-semibold text-slate-800">IPA Contour Breakdown</p>
                                  </div>
                                  <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-200/60 space-y-1">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 block">02 / Rhythm</span>
                                    <p className="text-xs font-semibold text-slate-800">Fluency & Pacing Analysis</p>
                                  </div>
                                  <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-200/60 space-y-1">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 block">03 / Drills</span>
                                    <p className="text-xs font-semibold text-slate-800">Personalized Practice</p>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                                <span>Diagnostic Accuracy Guaranteed</span>
                                <span className="text-slate-600 font-bold">100% Client-Controlled</span>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === "analytics" && (
                <div className="space-y-6">
                  {/* Device Retention Policy Toggle */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                        <History className="w-4 h-4 shrink-0" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Device History Retention</h3>
                        <p className="text-xs text-slate-500 mt-0.5 leading-normal">Remember and restore previous speech assessments locally on this device</p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2.5 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={rememberHistory}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setRememberHistory(checked);
                          localStorage.setItem("livo_remember_history_v1", checked ? "true" : "false");
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-800">Remember previous assessments on this device</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                    {/* Left panel: Session History list */}
                    <div className="lg:col-span-5 flex flex-col">
                      <HistoryCard
                        history={history}
                        activeSessionId={activeSession?.id || null}
                        onSelectSession={handleSelectSession}
                        selectedCompareIds={selectedCompareIds}
                        onToggleCompareId={handleToggleCompareId}
                        onClearHistory={handleClearHistory}
                      />
                    </div>

                    {/* Right panel: Trends and graph chart */}
                    <div className="lg:col-span-7 flex flex-col">
                      <ScoreTrendChart history={history} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "dpdp" && (
                <DpdpWorkspace />
              )}
            </>
          )}

        </div>

        {/* Global Footer */}
        <footer className="bg-white border-t border-slate-200/80 py-4 px-6 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] font-mono text-slate-500 font-medium tracking-wider">
            <span>&copy; {new Date().getFullYear()} SpeechMetric Evaluator.</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-700">
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
