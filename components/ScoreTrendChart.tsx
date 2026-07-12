"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { SavedSession } from "../app/types";
import { TrendingUp, Award } from "lucide-react";

interface ScoreTrendChartProps {
  history: SavedSession[];
}

export function ScoreTrendChart({ history }: ScoreTrendChartProps) {
  if (history.length === 0) return null;

  const chartData = [...history]
    .reverse()
    .map((session, idx) => ({
      index: idx + 1,
      date: new Date(session.timestamp).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
      score: session.overallScore,
    }));

  const latestScore = history[0]?.overallScore || 0;
  const initialScore = history[history.length - 1]?.overallScore || 0;
  const delta = latestScore - initialScore;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between space-y-4 h-full" id="score-trend-chart">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold tracking-tight text-slate-900">Progress Timeline</h3>
          <p className="text-xs text-slate-500 mt-1 leading-normal">Assessment score progression over time</p>
        </div>
        {delta !== 0 && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border ${
            delta > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-rose-50 text-rose-700 border-rose-200/60"
          }`}>
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span>{delta > 0 ? `+${delta}` : delta} net</span>
          </div>
        )}
      </div>

      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.4} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontFamily: "var(--font-mono)" }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontFamily: "var(--font-mono)" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-md border border-slate-800 text-xs font-mono">
                      <p className="font-bold">Score: {payload[0].value}%</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">Session #{payload[0].payload.index}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#2563eb" // Blue accent
              strokeWidth={2.5}
              dot={{ r: 4, stroke: "#2563eb", strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
