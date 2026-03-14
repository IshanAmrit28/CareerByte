import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = (props) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#09090b] border border-slate-800 p-4 rounded-xl shadow-xl backdrop-blur-sm">
        <p className="text-gray-300 text-sm mb-1">{data.fullDateStr}</p>
        <p className="text-indigo-400 font-bold text-lg mb-1">
          {data.type === 'Contest' ? `Rating: ${payload[0].value.toFixed(1)}` : `Score: ${payload[0].value}%`}
        </p>
        {data.type === 'Contest' ? (
          <div className="space-y-1">
            <p className="text-gray-400 text-xs">Contest: {data.contest}</p>
            <p className="text-yellow-400 text-xs font-bold">Rank: #{data.rank}</p>
          </div>
        ) : (
          data.role && <p className="text-gray-400 text-xs truncate max-w-[200px]">Role: {data.role}</p>
        )}
      </div>
    );
  }
  return null;
};

const ProgressGraph = ({ reports, contestHistory, currentRating, variant = "card", hideHeader = false }) => {
  const data = useMemo(() => {
    let history = [];

    // If contest history is available, prioritize it (overall rating)
    if (contestHistory && contestHistory.length > 0) {
      history = contestHistory.map(entry => {
        const date = new Date(entry.date);
        return {
          dateStr: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          fullDateStr: date.toLocaleDateString("en-US", { 
            year: "numeric", 
            month: "short", 
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }),
          score: entry.rating || 0,
          rank: entry.rank,
          contest: entry.contestTitle || "Contest",
          type: "Contest",
          timestamp: date.getTime()
        };
      });

      // Sort by timestamp
      history.sort((a, b) => a.timestamp - b.timestamp);

      // Prepend a 0-rating start point
      if (history.length > 0) {
        const firstDate = new Date(history[0].timestamp);
        const startDate = new Date(firstDate);
        startDate.setDate(firstDate.getDate() - 7); // 1 week before first contest

        history.unshift({
          dateStr: "Start",
          fullDateStr: "Beginning of Journey",
          score: 0,
          contest: "Initial Rating",
          type: "Contest",
          timestamp: startDate.getTime()
        });
      }
    } else if (currentRating > 0) {
        // Synthesize a starting point if no history but rating exists
        history = [
            {
                dateStr: "Start",
                fullDateStr: "Beginning of Journey",
                score: 0,
                type: "Contest"
            },
            {
                dateStr: "Now",
                fullDateStr: "Current Performance Rating",
                score: currentRating,
                contest: "Latest Assessment",
                type: "Contest"
            }
        ];
    } else if (reports && reports.length > 0) {
        // Fallback to interview reports
        const sorted = [...reports].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        history = sorted.map(report => {
            const date = new Date(report.createdAt);
            return {
                dateStr: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                fullDateStr: date.toLocaleDateString("en-US", { 
                    year: "numeric", 
                    month: "short", 
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }),
                score: report.overallScore ?? report.reportStructure?.overallScore ?? 0,
                role: report.role || "Interview",
                type: "Interview"
            };
        });

        // Prepend 0 for interviews too
        history.unshift({
            dateStr: "Start",
            fullDateStr: "Initial Assessment",
            score: 0,
            type: "Interview"
        });
    }

    return history;
  }, [reports, contestHistory, currentRating]);

  if (!data || data.length === 0) {
    return (
      <div className={`${variant === "card" ? "bg-[#111b27]/40 border border-slate-800 rounded-3xl p-12 shadow-2xl backdrop-blur-md" : ""} text-center`}>
        <p className="text-gray-500 italic">No contest data available to generate progress history.</p>
      </div>
    );
  }

  const latestScore = data[data.length - 1].score;
  const themeColor = "#818cf8"; // Consistent Indigo theme

  return (
    <div className={variant === "card" ? "bg-[#111b27]/40 border border-slate-800 rounded-3xl p-6 md:p-8 mb-12 shadow-2xl backdrop-blur-md transition-all hover:bg-[#111b27]/60" : "w-full h-full"}>
      {!hideHeader && (
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              Rating History
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Your performance progression over time
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="px-4 py-1.5 bg-gray-800/40 rounded-full border border-gray-700 text-gray-100 text-sm font-bold">
                  {data[0]?.type === 'Contest' ? `Rating: ${latestScore.toFixed(0)}` : `Score: ${latestScore}%`}
              </div>
          </div>
        </div>
      )}
      
      <div className={`${variant === "card" ? "h-80" : "h-full"} w-full min-h-[300px] relative`}>
          <ResponsiveContainer width="99%" height="99%" minWidth={0} minHeight={300}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey="dateStr" 
                stroke="#6b7280" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                dy={10} 
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                domain={[0, (dataMax) => Math.max(dataMax + 100, 1000)]}
                tickFormatter={(value) => data[0]?.type === 'Contest' ? value.toFixed(0) : `${value}%`}
              />
              <RechartsTooltip 
                content={CustomTooltip} 
                cursor={{ stroke: themeColor, strokeWidth: 1, strokeDasharray: '4 4' }} 
              />
              <Area 
                type="linear" 
                dataKey="score" 
                stroke={themeColor} 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#scoreGradient)" 
                dot={{ r: 4, fill: themeColor, strokeWidth: 2, stroke: "#111b27" }}
                activeDot={{ r: 7, fill: themeColor, stroke: "#fff", strokeWidth: 2, className: "animate-pulse" }}
                animationDuration={2000}
                style={{ filter: `drop-shadow(0 0 8px ${themeColor}40)` }}
              />
            </AreaChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressGraph;
