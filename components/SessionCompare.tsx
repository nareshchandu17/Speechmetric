"use client";

import { SavedSession } from "../app/types";
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus, Award, ShieldAlert, Sparkles, BookOpen } from "lucide-react";

interface SessionCompareProps {
  sessionA: SavedSession;
  sessionB: SavedSession;
  onClose: () => void;
}

export function SessionCompare({ sessionA, sessionB, onClose }: SessionCompareProps) {
  // Always assume sessionA is the newer session, and sessionB is the older one
  // (Let's sort them by timestamp to calculate true progress delta)
  const isANewer = new Date(sessionA.timestamp).getTime() >= new Date(sessionB.timestamp).getTime();
  const newer = isANewer ? sessionA : sessionB;
  const older = isANewer ? sessionB : sessionA;

  const metrics = [
    { label: "Overall Score", key: "overallScore" as const },
    { label: "Speech Clarity", key: "clarity" as const },
    { label: "Fluency Flow", key: "fluency" as const },
    { label: "Pacing & Speed", key: "pacing" as const },
    { label: "Stress & Rhythm", key: "stress" as const },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6" id="session-compare">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-900 text-white rounded-xl">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900">session comparison</h3>
            <p className="text-xs text-slate-500 mt-0.5">Comparing older vs. newer session progress</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-semibold text-slate-500 hover:text-slate-950 underline transition-all duration-150 cursor-pointer active:scale-95"
        >
          Clear Selection
        </button>
      </div>

      {/* Side by Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Older Session */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 relative">
          <span className="absolute top-3 right-3 text-[10px] font-mono font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
            OLDER BASELINE
          </span>
          <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider truncate max-w-[150px]">
            {older.fileName}
          </p>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight font-mono mt-1">
            {older.overallScore}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Assessed {new Date(older.timestamp).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Newer Session */}
        <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 relative">
          <span className="absolute top-3 right-3 text-[10px] font-mono font-bold text-emerald-600 bg-white px-2 py-0.5 rounded border border-emerald-200">
            NEWER PROGRESS
          </span>
          <p className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider truncate max-w-[150px]">
            {newer.fileName}
          </p>
          <p className="text-3xl font-extrabold text-emerald-800 tracking-tight font-mono mt-1">
            {newer.overallScore}%
          </p>
          <p className="text-xs text-emerald-600/80 mt-1">
            Assessed {new Date(newer.timestamp).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Metric Delta Grid */}
      <div className="space-y-3.5 pt-2">
        <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
          metric breakdowns
        </h4>
        <div className="space-y-3">
          {metrics.map((m) => {
            const newerVal = newer[m.key];
            const olderVal = older[m.key];
            const diff = newerVal - olderVal;

            return (
              <div key={m.key} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{m.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">
                      {olderVal}% → <strong className="text-slate-800">{newerVal}%</strong>
                    </span>
                    {diff > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-xs font-bold flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        +{diff}
                      </span>
                    ) : diff < 0 ? (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono text-xs font-bold flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" />
                        {diff}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-xs font-semibold flex items-center gap-0.5">
                        <Minus className="w-3 h-3" />
                        0
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden relative">
                  <div
                    style={{ width: `${olderVal}%` }}
                    className="absolute left-0 top-0 h-full bg-slate-300 rounded-full"
                  />
                  <div
                    style={{
                      width: `${Math.abs(diff)}%`,
                      left: `${Math.min(olderVal, newerVal)}%`,
                    }}
                    className={`absolute top-0 h-full rounded-full ${
                      diff >= 0 ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Insights */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-2 text-left">
        <h5 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          Comparative Progress Analysis
        </h5>
        <p className="text-xs text-slate-600 leading-relaxed mt-1">
          {newer.overallScore > older.overallScore ? (
            <span>
              Outstanding effort! Your newer session shows an improvement of{" "}
              <strong>{newer.overallScore - older.overallScore}%</strong> in overall pronunciation accuracy. Keep practicing the stress patterns to sustain your progress.
            </span>
          ) : newer.overallScore < older.overallScore ? (
            <span>
              Your baseline scores were slightly higher. Focus on speaking with natural pausing and pace (keeping your pacing metric controlled) to improve intelligibility.
            </span>
          ) : (
            <span>
              Your performance matches your previous baseline exactly. Try practicing with different paragraphs or focus explicitly on ending consonant pronunciations to break the plateau.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
