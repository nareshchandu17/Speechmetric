"use client";

import { useState, useEffect } from "react";
import { SavedSession, WordFeedback } from "../app/types";
import { Sparkles, CheckCircle2, Volume2, Info, RefreshCw, Play, Square, Mic, X, ChevronRight, Check, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DiagnosticDashboardProps {
  session: SavedSession;
  ingestCard?: React.ReactNode;
}

interface ActiveDrill {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  description: string;
  estimatedTime: string;
}

export function DiagnosticDashboard({ session, ingestCard }: DiagnosticDashboardProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [selectedWord, setSelectedWord] = useState<WordFeedback | null>(null);
  const [filter, setFilter] = useState<"all" | "needs_improvement" | "watch_stress" | "good">("all");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<1.0 | 0.75>(1.0);
  
  // Interactive Drill State
  const [activeDrill, setActiveDrill] = useState<ActiveDrill | null>(null);
  const [drillStage, setDrillStage] = useState<"intro" | "recording" | "analyzing" | "success">("intro");
  const [drillSeconds, setDrillSeconds] = useState(0);
  const [drillScore, setDrillScore] = useState(0);

  // Default select a feedback word when session loads
  useEffect(() => {
    if (session.id === "seed_naresh") {
      const buildWord = session.feedback.words.find(w => w.word.toLowerCase() === "build");
      if (buildWord) {
        setSelectedWord(buildWord);
      }
    } else if (session.feedback.words.length > 0) {
      // Find a word with some feedback, otherwise the first word
      const feedbackWord = session.feedback.words.find(w => w.score < 85) || session.feedback.words[0];
      setSelectedWord(feedbackWord);
    } else {
      setSelectedWord(null);
    }
  }, [session]);

  // Smooth Count-Up Animation for the Overall Score
  useEffect(() => {
    setAnimatedScore(0);
    const target = session.overallScore;
    if (target === 0) return;

    let current = 0;
    const duration = 1200; // ms
    const stepTime = Math.max(Math.floor(duration / target), 10);
    
    const timer = setInterval(() => {
      current += 1;
      if (current >= target) {
        setAnimatedScore(target);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [session]);

  // Timer for the drill recorder
  useEffect(() => {
    let interval: any;
    if (drillStage === "recording") {
      interval = setInterval(() => {
        setDrillSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setDrillSeconds(0);
    }
    return () => clearInterval(interval);
  }, [drillStage]);

  const metrics = [
    { label: "Speech Clarity", val: session.clarity, desc: "Acoustic phoneme clarity", color: "from-blue-500 to-indigo-600" },
    { label: "Fluency Flow", val: session.fluency, desc: "Speech continuity & rhythm", color: "from-emerald-500 to-teal-600" },
    { label: "Pacing Speed", val: session.pacing, desc: "Ideal words-per-minute range", color: "from-amber-500 to-orange-600" },
    { label: "Stress & Rhythm", val: session.stress, desc: "Syllable emphasis correctness", color: "from-purple-500 to-pink-600" },
  ];

  // Helper to speak the word
  const handleSpeak = (text: string, rate: number = 1.0) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setIsPlayingWord(true);
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rate;
      utterance.onend = () => setIsPlayingWord(false);
      utterance.onerror = () => setIsPlayingWord(false);
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback visual simulation
      setIsPlayingWord(true);
      setTimeout(() => setIsPlayingWord(false), 800);
    }
  };

  // Helper to determine word styling class
  const getWordStyle = (w: WordFeedback) => {
    const isSelected = selectedWord?.word === w.word;
    const ringClass = isSelected ? "ring-2 ring-slate-900 ring-offset-1 scale-[1.03] z-10" : "";
    
    // Check filter matching
    const matchesFilter = 
      filter === "all" ||
      (filter === "needs_improvement" && w.score < 60) ||
      (filter === "watch_stress" && w.score >= 60 && w.score < 85) ||
      (filter === "good" && w.score >= 85);

    if (!matchesFilter) {
      return `text-slate-400 hover:text-slate-600 px-1.5 py-1 rounded transition-all duration-150 cursor-pointer active:scale-95 ${ringClass}`;
    }

    // Highlighting based on category
    if (w.score < 60) {
      return `bg-rose-100 text-rose-800 border border-rose-200 decoration-wavy underline decoration-rose-500 font-bold px-1.5 py-1 rounded-lg transition-all duration-150 cursor-pointer active:scale-95 ${ringClass}`;
    } else if (w.score >= 60 && w.score < 85) {
      return `bg-amber-100 text-amber-800 border border-amber-200 decoration-line underline decoration-amber-500 font-semibold px-1.5 py-1 rounded-lg transition-all duration-150 cursor-pointer active:scale-95 ${ringClass}`;
    } else {
      // Highlight green only for key exemplary words to avoid clutter, else clean slate
      const isExemplary = ["science", "engineering", "computer", "projects", "developer", "portfolio", "interested", "database", "mongodb"].includes(w.word.toLowerCase());
      if (isExemplary) {
        return `bg-emerald-50 text-emerald-800 border border-emerald-100/80 font-medium px-1.5 py-1 rounded-lg transition-all duration-150 cursor-pointer active:scale-95 ${ringClass}`;
      }
      return `text-slate-800 hover:bg-slate-100 px-1.5 py-1 rounded transition-all duration-150 cursor-pointer active:scale-95 ${ringClass}`;
    }
  };

  // Generate word-specific pitch contour coordinates
  const getPitchContour = (word: string) => {
    const norm = word.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (norm === "build") {
      return {
        your: "M 10,70 Q 100,15 180,65 T 290,80",
        ideal: "M 10,70 Q 100,20 180,45 Q 240,30 290,45",
        accuracy: 72,
        drill: "Press tongue tip firmly against the roof of the mouth and release with a soft burst of air to release the final /d/."
      };
    }
    if (norm === "flowrevia") {
      return {
        your: "M 10,25 Q 100,75 180,60 T 290,65",
        ideal: "M 10,65 Q 100,20 180,75 T 290,65",
        accuracy: 81,
        drill: "Lengthen the second syllable 're' and raise your pitch slightly on this syllable: flow-RE-via."
      };
    }
    if (norm === "portfolio") {
      return {
        your: "M 10,60 Q 90,80 180,55 T 290,60",
        ideal: "M 10,60 Q 90,35 180,50 T 290,55",
        accuracy: 82,
        drill: "Keep your lips rounded and fully formed as you transition to the second syllable 'fo'."
      };
    }
    if (norm === "i" || norm === "am") {
      return {
        your: "M 10,40 C 60,10 90,80 150,40 C 210,10 240,80 290,40",
        ideal: "M 10,50 Q 150,20 290,50",
        accuracy: 55,
        drill: "Fluency drill: Breathe out slowly before starting. Deliver 'I am' as a single continuous sound with zero double pauses."
      };
    }
    // Default
    return {
      your: "M 10,55 Q 80,30 160,50 T 290,55",
      ideal: "M 10,55 Q 80,33 160,48 T 290,53",
      accuracy: 94,
      drill: "Excellent native-like rhythm. Practice linking smoothly to the succeeding word to polish natural cadence."
    };
  };

  const pitchData = selectedWord ? getPitchContour(selectedWord.word) : getPitchContour("build");

  // Drills data
  const drills: ActiveDrill[] = [
    {
      id: "hesitation",
      title: "Reducing Hesitation & Repetition",
      subtitle: "Frequent repetition of 'I am' disrupts the natural flow of speech.",
      prompt: "I am interested in full stack development.",
      description: "This practice drill targets continuous flow. Speak the sentence below without repeating 'I am' or pausing excessively to build professional speech flow.",
      estimatedTime: "4 mins"
    },
    {
      id: "consonant",
      title: "Final Consonant Release",
      subtitle: "The final /d/ in 'build' was omitted, making it sound like 'buil'.",
      prompt: "I am build the projects like QuickBite.",
      description: "Focus on releasing the trailing /d/ consonant cleanly. Press your tongue tip firmly against the roof of your mouth and let a soft puff of air release.",
      estimatedTime: "5 mins"
    }
  ];

  const startDrillHandler = (drill: ActiveDrill) => {
    setActiveDrill(drill);
    setDrillStage("intro");
    setDrillSeconds(0);
  };

  const submitDrillPractice = () => {
    setDrillStage("analyzing");
    // Simulate beautiful AI calculation
    setTimeout(() => {
      setDrillScore(Math.floor(Math.random() * 12) + 85); // 85 to 97
      setDrillStage("success");
    }, 2500);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={session.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6 text-left"
        id="diagnostic-dashboard"
      >
        
        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
          
          {/* LEFT COLUMN: Ingest Recorder Card & Interactive Oral Transcript (col-span-7) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            
            {/* 1. Ingestion Panel (Mic recording / Upload) */}
            {ingestCard}

            {/* 2. Interactive Oral Transcript Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-2 relative">
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-slate-900">
                      Interactive Oral Transcript
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">
                      Click any highlighted word to see detailed pronunciation feedback.
                    </p>
                  </div>
                  
                  {/* Custom Filter Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-95"
                    >
                      <span>Show: {filter === "all" ? "All Feedback" : filter === "needs_improvement" ? "Needs Improvement" : filter === "watch_stress" ? "Watch Stress" : "Good Pronunciation"}</span>
                      <span className="text-[10px] text-slate-400 font-mono">▼</span>
                    </button>

                    <AnimatePresence>
                      {isFilterDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsFilterDropdownOpen(false)}></div>
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.95 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20"
                          >
                            <button
                              type="button"
                              onClick={() => { setFilter("all"); setIsFilterDropdownOpen(false); }}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                            >
                              <span>All Feedback</span>
                              {filter === "all" && <Check className="w-3.5 h-3.5 text-slate-900" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setFilter("needs_improvement"); setIsFilterDropdownOpen(false); }}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50/50 flex items-center justify-between cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                Needs Improvement
                              </span>
                              {filter === "needs_improvement" && <Check className="w-3.5 h-3.5 text-rose-600" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setFilter("watch_stress"); setIsFilterDropdownOpen(false); }}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50/50 flex items-center justify-between cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Watch Stress
                              </span>
                              {filter === "watch_stress" && <Check className="w-3.5 h-3.5 text-amber-600" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setFilter("good"); setIsFilterDropdownOpen(false); }}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50/50 flex items-center justify-between cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Good Pronunciation
                              </span>
                              {filter === "good" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Dynamic Transcript text box */}
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/60 leading-relaxed text-sm text-slate-800 font-semibold flex flex-wrap gap-x-2 gap-y-2.5 min-h-[180px]">
                  {session.feedback.words.map((w, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedWord(w)}
                      className={`${getWordStyle(w)} relative flex items-center gap-1`}
                    >
                      {/* Word text */}
                      <span>{w.word}</span>
                      {/* Optional small color indicator dot inside highlighted badge */}
                      {w.score < 60 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block shrink-0"></span>}
                      {w.score >= 60 && w.score < 85 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block shrink-0"></span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dot Legend at bottom */}
              <div className="border-t border-slate-100 pt-4 mt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Needs improvement
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Watch stress
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Good pronunciation
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Metrics Dashboard, Advisories & Selected Word feedback (col-span-5) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            
            {/* 3. Overall Rating & 3 Breakdown Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              
              {/* Glassy Blue Rating Card */}
              <div className="md:col-span-5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-2xl p-6 shadow-sm border border-blue-500/20 flex flex-col justify-between relative overflow-hidden min-h-[200px] h-full">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-white/5 rounded-full blur-2xl"></div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-blue-200 font-bold uppercase tracking-widest">
                    overall rating
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold">
                    Strong
                  </span>
                </div>

                <div className="my-auto">
                  <div className="text-6xl font-black font-mono tracking-tighter inline-flex items-baseline text-white">
                    {animatedScore}
                    <span className="text-xl font-medium text-blue-200 ml-1">/100</span>
                  </div>
                </div>

                <div className="w-full space-y-1">
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${animatedScore}%` }}
                      className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                    ></div>
                  </div>
                </div>
              </div>

              {/* 3 Metric Breakdown Grids */}
              <div className="md:col-span-7 grid grid-cols-1 gap-3 flex flex-col justify-between h-full">
                
                {/* Clarity card with Sparkline */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex-1 flex flex-col justify-between shadow-2xs min-h-[64px] relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">CLARITY / ACCURACY</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">{session.clarity}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Word & Sound Clarity</span>
                  </div>
                  {/* Wave Sparkline Curve at bottom */}
                  <div className="absolute bottom-0 inset-x-0 h-4 overflow-hidden pointer-events-none">
                    <svg viewBox="0 0 120 20" className="w-full h-full opacity-60" preserveAspectRatio="none">
                      <path d="M 0,15 Q 15,5 30,12 T 60,8 T 90,15 T 120,5" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Speech Fluency card with Sparkline */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex-1 flex flex-col justify-between shadow-2xs min-h-[64px] relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">SPEECH FLUENCY</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">{session.fluency}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Natural Transitions</span>
                  </div>
                  {/* Wave Sparkline Curve at bottom */}
                  <div className="absolute bottom-0 inset-x-0 h-4 overflow-hidden pointer-events-none">
                    <svg viewBox="0 0 120 20" className="w-full h-full opacity-60" preserveAspectRatio="none">
                      <path d="M 0,5 Q 20,18 40,8 T 80,12 T 120,7" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Pacing card with Sparkline */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex-1 flex flex-col justify-between shadow-2xs min-h-[64px] relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">PACING & RHYTHM</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">{session.pacing}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Cadence & Speed</span>
                  </div>
                  {/* Wave Sparkline Curve at bottom */}
                  <div className="absolute bottom-0 inset-x-0 h-4 overflow-hidden pointer-events-none">
                    <svg viewBox="0 0 120 20" className="w-full h-full opacity-60" preserveAspectRatio="none">
                      <path d="M 0,15 Q 30,2 60,15 T 120,5" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

              </div>

            </div>

            {/* 4. Advisory callout card with full-sized wave representation */}
            <div className="bg-blue-50/60 border border-blue-200/60 rounded-2xl p-6 shadow-2xs flex items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 text-left">
                <h4 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  Strong overall pronunciation.
                </h4>
                <p className="text-xs text-blue-800 font-medium leading-relaxed max-w-sm">
                  {session.feedback.generalAdvice || "Clear and intelligible speech with minor areas for articulation and fluency polishing. Focus on linking words smoothly."}
                </p>
              </div>
              {/* Cadence wave visualization */}
              <div className="shrink-0 pointer-events-none">
                <svg viewBox="0 0 120 40" className="w-24 h-10 text-blue-500 overflow-visible opacity-80">
                  <path
                    d="M 0,20 Q 20,5 40,30 T 80,10 T 120,20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* 5. Selected Word Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex-1 flex flex-col justify-between">
              {selectedWord ? (
                <div className="space-y-4 text-left h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">Word:</span>
                        <h4 className="text-lg font-bold tracking-tight text-slate-900">
                          &quot;{selectedWord.word}&quot;
                        </h4>
                      </div>
                      
                      {/* IPA / Transcription Badge and audio */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 border border-slate-200/50">
                          /{selectedWord.phonemes || "..."}/
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSpeak(selectedWord.word, playSpeed)}
                          className={`p-1.5 rounded-lg border transition-all duration-150 cursor-pointer active:scale-90 ${
                            isPlayingWord
                              ? "bg-emerald-500 border-emerald-500 text-white animate-pulse"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                          title="Listen to correct pronunciation"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Pitch & Intonation Graph Component */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono mb-2">
                        <span>Pitch & Intonation</span>
                        <span className="text-[10px] text-blue-600 font-bold">Match Accuracy: {pitchData.accuracy}%</span>
                      </div>

                      {/* SVG Curve Container with dotted background grid base lines */}
                      <div className="bg-slate-50/60 rounded-xl border border-slate-200/60 p-4 relative overflow-hidden flex items-center justify-center">
                        <svg viewBox="0 0 300 100" className="w-full h-24 overflow-visible">
                          <defs>
                            <linearGradient id="yourGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid guides (Base Dotted Lines) as requested */}
                          <line x1="0" y1="20" x2="300" y2="20" stroke="#94a3b8" strokeDasharray="3,3" strokeOpacity="0.3" />
                          <line x1="0" y1="50" x2="300" y2="50" stroke="#94a3b8" strokeDasharray="3,3" strokeOpacity="0.3" />
                          <line x1="0" y1="80" x2="300" y2="80" stroke="#94a3b8" strokeDasharray="3,3" strokeOpacity="0.3" />

                          {/* Ideal target dashed contour */}
                          <path
                            d={pitchData.ideal}
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="2.5"
                            strokeDasharray="4,4"
                            strokeOpacity="0.8"
                          />

                          {/* Your pronunciation path */}
                          <path
                            d={pitchData.your}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        
                        {/* Interactive Sparkle effect */}
                        {pitchData.accuracy > 90 && (
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 text-[8px] font-bold flex items-center gap-0.5 animate-bounce">
                            <Sparkles className="w-2.5 h-2.5" /> Perfect Pitch
                          </div>
                        )}
                      </div>
                      
                      {/* Legend */}
                      <div className="flex items-center justify-center gap-5 mt-2.5 text-[10px] font-bold text-slate-400 uppercase font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-rose-500"></span>
                          Your Pronunciation
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 border-t border-dashed border-slate-400"></span>
                          Ideal Target
                        </span>
                      </div>
                    </div>

                    {/* Cadence Alignment metric */}
                    <div className="mt-4 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase font-mono">
                        <span>Cadence Alignment</span>
                        <span>{pitchData.accuracy}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pitchData.accuracy}%` }}
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            pitchData.accuracy < 60
                              ? "bg-rose-500"
                              : pitchData.accuracy < 85
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action buttons */}
                  <div className="space-y-2 pt-4 border-t border-slate-100 mt-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPlaySpeed(1.0);
                          handleSpeak(selectedWord.word, 1.0);
                        }}
                        className="flex-1 h-9 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-95 focus:outline-none"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Normal Speed
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPlaySpeed(0.75);
                          handleSpeak(selectedWord.word, 0.75);
                        }}
                        className="flex-1 h-9 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-95 focus:outline-none"
                      >
                        <Play className="w-3.5 h-3.5 fill-emerald-800" />
                        Slow (0.75x)
                      </button>
                    </div>

                    {/* Physical Drill Box */}
                    <div className="p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-start gap-2.5 text-left">
                      <div className="w-5 h-5 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-[10px] font-mono shrink-0 mt-0.5">
                        ✓
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-wider">Physical Drill Recommendation</p>
                        <p className="text-xs text-slate-700 mt-0.5 leading-relaxed font-semibold">
                          {selectedWord.actionableAdvice || pitchData.drill}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 min-h-[300px]">
                  <Sliders className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-600">Select a Word</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Click on any highlighted word in the oral transcript on the left to see precise syllable contours.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: Personalized Practice Drills (col-span-12) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs animate-in fade-in-0 slide-in-from-bottom-4 duration-700 ease-out fill-mode-both [animation-delay:150ms]">
          <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-base font-bold tracking-tight text-slate-900">
                Personalized Practice Drills
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Targeted exercises based on your phonetic patterns.
              </p>
            </div>
            {/* Global Listen to Audio button */}
            <button
              type="button"
              onClick={() => handleSpeak(session.transcript)}
              className="h-9 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-95 focus:outline-none"
            >
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              Listen to Audio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drills.map((drill, idx) => (
              <div
                key={drill.id}
                className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/60 flex flex-col justify-between hover:border-slate-300 transition-all duration-150 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-200 px-2 py-0.5 rounded text-slate-600">
                      Drill {idx + 1}
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-500">
                      Est. time: {drill.estimatedTime}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">
                    {drill.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {drill.subtitle}
                  </p>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => startDrillHandler(drill)}
                    className="h-9 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-95 focus:outline-none"
                  >
                    <span>Start Drill</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* indicators & coaching feedback block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 ease-out fill-mode-both [animation-delay:300ms]">
          
          {/* Strengths & Focus Areas */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <h4 className="text-xs font-semibold font-mono text-slate-500 uppercase tracking-wider">
                Phonetic Indicators
              </h4>
              
              <div className="mt-3 space-y-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md inline-block">
                    Vocal Strengths
                  </span>
                  <ul className="list-disc pl-4 text-xs text-slate-600 mt-2 space-y-1.5 font-medium leading-relaxed">
                    {session.feedback.keyStrengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-md inline-block">
                    Vocal Focus Areas
                  </span>
                  <ul className="list-disc pl-4 text-xs text-slate-600 mt-2 space-y-1.5 font-medium leading-relaxed">
                    {session.feedback.focusAreas.map((area, idx) => (
                      <li key={idx}>{area}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable General Coach Advice */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <h4 className="text-xs font-semibold font-mono text-slate-500 uppercase tracking-wider">
                Speech Intelligibility
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-2.5 font-medium">
                {session.feedback.intelligibilityExplanation}
              </p>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800">
              <h5 className="text-xs font-semibold font-mono text-emerald-400 uppercase tracking-wider">
                Coaching Feedback
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed mt-1.5 font-normal">
                {session.feedback.generalAdvice}
              </p>
            </div>
          </div>

        </div>

      </motion.div>

      {/* Full-screen Drill Practice Modal Overlay */}
      <AnimatePresence>
        {activeDrill && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDrill(null)}
              className="fixed inset-0 bg-slate-950 z-50 cursor-pointer"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="fixed inset-x-4 bottom-4 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-50 border border-slate-200 text-left space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                    Active Practice Drill
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-1.5">{activeDrill.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDrill(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Body */}
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeDrill.description}
                </p>

                {/* Phrase to Speak */}
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center relative overflow-hidden group">
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSpeak(activeDrill.prompt, 1.0)}
                      className="p-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all cursor-pointer active:scale-90"
                      title="Listen"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-widest mb-1">Passage to read aloud</span>
                  <p className="text-sm font-bold text-white tracking-wide leading-relaxed">
                    &quot;{activeDrill.prompt}&quot;
                  </p>
                </div>

                {/* Interaction States */}
                <div className="pt-2">
                  {drillStage === "intro" && (
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => setDrillStage("recording")}
                        className="w-16 h-16 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg transition-all duration-150 cursor-pointer active:scale-95 animate-pulse"
                      >
                        <Mic className="w-6 h-6" />
                      </button>
                      <p className="text-xs font-bold text-slate-700 mt-3">Ready when you are</p>
                      <p className="text-[10px] text-slate-400 mt-1 text-center">Tap the button above to begin recording your spoken practice attempt.</p>
                    </div>
                  )}

                  {drillStage === "recording" && (
                    <div className="flex flex-col items-center justify-center p-6 bg-rose-50/50 rounded-2xl border border-rose-100">
                      {/* Audio Pulse Wave */}
                      <div className="flex items-center gap-1 mb-4 h-10">
                        <span className="w-1.5 h-6 bg-rose-500 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                        <span className="w-1.5 h-8 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-10 bg-rose-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                        <span className="w-1.5 h-5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        <span className="w-1.5 h-7 bg-rose-500 rounded-full animate-bounce [animation-delay:0.5s]"></span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={submitDrillPractice}
                        className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-all duration-150 cursor-pointer active:scale-95"
                      >
                        <Square className="w-5 h-5 fill-white" />
                      </button>
                      <p className="text-xs font-bold text-rose-700 mt-3">Recording spoken attempt... {drillSeconds}s</p>
                      <p className="text-[10px] text-slate-400 mt-1">Click the red button when finished speaking.</p>
                    </div>
                  )}

                  {drillStage === "analyzing" && (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                      <RefreshCw className="w-8 h-8 text-slate-800 animate-spin" />
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-800">Processing acoustic audio...</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Evaluating your phoneme release accuracy</p>
                      </div>
                    </div>
                  )}

                  {drillStage === "success" && (
                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      
                      <div>
                        <span className="text-[10px] font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded text-emerald-700">
                          COMPLETED SUCCESSFULLY
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900 mt-2">
                          Accuracy Score: <span className="font-mono text-emerald-600">{drillScore}%</span>
                        </h4>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed px-4">
                          {activeDrill.id === "consonant" 
                            ? "Splendid! You released the final /d/ phoneme perfectly with crisp articulation. Match score improved from 48% to " + drillScore + "%!"
                            : "Excellent rhythm polish! You paced your syllables beautifully and maintained consistent flow with zero hesitations."
                          }
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          // Update word score in-place if appropriate, e.g. "build" score improves!
                          if (selectedWord && activeDrill.id === "consonant" && selectedWord.word.toLowerCase() === "build") {
                            selectedWord.score = drillScore;
                            selectedWord.errorType = "none";
                            selectedWord.explanation = "Corrected via practice drill!";
                          }
                          setActiveDrill(null);
                        }}
                        className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95"
                      >
                        Keep Practice Results
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
