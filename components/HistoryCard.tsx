"use client";

import { SavedSession } from "../app/types";
import { Clock, Calendar, ChevronRight, BarChart2, CheckCircle, HelpCircle, Trash2 } from "lucide-react";

interface HistoryCardProps {
  history: SavedSession[];
  activeSessionId: string | null;
  onSelectSession: (session: SavedSession) => void;
  selectedCompareIds: string[];
  onToggleCompareId: (id: string) => void;
  onClearHistory?: () => void;
}

export function HistoryCard({
  history,
  activeSessionId,
  onSelectSession,
  selectedCompareIds,
  onToggleCompareId,
  onClearHistory,
}: HistoryCardProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs text-center flex flex-col items-center justify-center">
        <HelpCircle className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
        <p className="text-sm font-semibold text-slate-800">No session history yet</p>
        <p className="text-xs text-slate-500 mt-1">Your analyzed voice recordings will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between space-y-4 h-full" id="history-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold tracking-tight text-slate-900">Assessment Log</h3>
            <span className="text-[10px] font-mono font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200/80">
              {selectedCompareIds.length}/2 compare
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-normal">Select two sessions to compare side-by-side</p>
        </div>
        {onClearHistory && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to permanently erase all stored speech assessment logs? Under Section 12 of the DPDP Act 2023, this action immediately purges all historical local data.")) {
                onClearHistory();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200/80 transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs shrink-0 self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-rose-500"
            title="Execute Section 12 DPDP Right to Erasure"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span>Erase All Local Assessments</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {history.map((session) => {
          const isSelectedForCompare = selectedCompareIds.includes(session.id);
          const isCurrentActive = activeSessionId === session.id;

          return (
            <div
              key={session.id}
              className={`p-4 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 ${
                isCurrentActive
                  ? "border-slate-900 bg-slate-50/60 shadow-2xs"
                  : "border-slate-200/80 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                {/* Compare Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompareId(session.id);
                  }}
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-150 cursor-pointer active:scale-90 shrink-0 focus:outline-none ${
                    isSelectedForCompare
                      ? "bg-slate-900 border-slate-900 text-white shadow-2xs"
                      : "border-slate-300 hover:border-slate-400 bg-white"
                  }`}
                  title="Select for comparison"
                >
                  {isSelectedForCompare && <span className="text-[10px] font-bold leading-none">✓</span>}
                </button>

                {/* Info */}
                <div
                  className="cursor-pointer select-none text-left transition-all duration-150 active:scale-[0.98] truncate"
                  onClick={() => onSelectSession(session)}
                >
                  <p className="text-xs font-mono font-semibold text-slate-600 uppercase tracking-wider truncate">
                    {session.fileName.length > 20
                      ? session.fileName.substring(0, 18) + "..."
                      : session.fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-slate-500 text-[11px] font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {new Date(session.timestamp).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {session.duration}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Score and Open Button */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900 font-mono tracking-tight">
                    {session.overallScore}%
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block -mt-0.5">Score</span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectSession(session)}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-150 cursor-pointer active:scale-95 flex items-center justify-center focus:outline-none shrink-0"
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

