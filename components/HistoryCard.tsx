"use client";

import { SavedSession } from "../app/types";
import { Clock, Calendar, ChevronRight, BarChart2, CheckCircle, HelpCircle } from "lucide-react";

interface HistoryCardProps {
  history: SavedSession[];
  activeSessionId: string | null;
  onSelectSession: (session: SavedSession) => void;
  selectedCompareIds: string[];
  onToggleCompareId: (id: string) => void;
}

export function HistoryCard({
  history,
  activeSessionId,
  onSelectSession,
  selectedCompareIds,
  onToggleCompareId,
}: HistoryCardProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm text-center flex flex-col items-center justify-center">
        <HelpCircle className="w-10 h-10 text-slate-300 mb-2" />
        <p className="text-sm font-semibold text-slate-700">No session history yet</p>
        <p className="text-xs text-slate-500 mt-0.5">Your analyzed voice recordings will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col space-y-4" id="history-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-900">assessment log</h3>
          <p className="text-xs text-slate-500 mt-0.5">Select two sessions to compare side-by-side</p>
        </div>
        <div className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
          {selectedCompareIds.length}/2 selected
        </div>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {history.map((session) => {
          const isSelectedForCompare = selectedCompareIds.includes(session.id);
          const isCurrentActive = activeSessionId === session.id;

          return (
            <div
              key={session.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                isCurrentActive
                  ? "border-slate-900 bg-slate-50/50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Compare Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompareId(session.id);
                  }}
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-all duration-150 cursor-pointer active:scale-90 ${
                    isSelectedForCompare
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "border-slate-300 hover:border-slate-400 bg-white"
                  }`}
                  title="Select for comparison"
                >
                  {isSelectedForCompare && <span className="text-[10px] font-bold">✓</span>}
                </button>

                {/* Info */}
                <div
                  className="cursor-pointer select-none text-left transition-all duration-150 active:scale-[0.98]"
                  onClick={() => onSelectSession(session)}
                >
                  <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    {session.fileName.length > 20
                      ? session.fileName.substring(0, 18) + "..."
                      : session.fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-slate-500 text-[11px] font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(session.timestamp).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {session.duration}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Score and Open Button */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-lg font-extrabold text-slate-900 font-mono tracking-tight">
                    {session.overallScore}%
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Score</span>
                </div>
                <button
                  onClick={() => onSelectSession(session)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-150 cursor-pointer active:scale-90"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
