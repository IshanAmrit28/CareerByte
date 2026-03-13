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
    // If contest history is available, prioritize it (overall rating)
    if (contestHistory && contestHistory.length > 0) {
      return contestHistory.map(entry => {
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
          type: "Contest"
        };
      });
    }

    // Synthesize a starting point if no history but rating exists
    if ((!contestHistory || contestHistory.length === 0) && currentRating > 0) {
        return [{
            dateStr: "Initial",
            fullDateStr: "Base Performance Rating",
            score: currentRating,
            contest: "Initial Rating",
            type: "Contest"
        }];
    }

    if (!reports || reports.length === 0) return [];
    
    // Fallback to mock interview reports (only if explicitly passed in other views like InterviewDashboard)
    const sorted = [...reports].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    return sorted.map(report => {
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
  }, [reports, contestHistory, currentRating]);

  if (!data || data.length === 0) {
    return (
      <div className={`${variant === "card" ? "bg-[#111b27]/40 border border-slate-800 rounded-3xl p-12 shadow-2xl backdrop-blur-md" : ""} text-center`}>
        <p className="text-gray-500 italic">No contest data available to generate progress history.</p>
      </div>
    );
  }

  const getTierColor = (score) => {
    if (score >= 2000) return "#facc15"; // Gold
    if (score >= 1800) return "#c084fc"; // Purple
    if (score >= 1500) return "#60a5fa"; // Blue
    if (score >= 1200) return "#34d399"; // Emerald
    return "#818cf8"; // Indigo (Default)
  };

  const latestScore = data[data.length - 1].score;
  const tierColor = data[0].type === 'Contest' ? getTierColor(latestScore) : "#818cf8";

  return (
    <div className={variant === "card" ? "bg-[#111b27]/40 border border-slate-800 rounded-3xl p-6 md:p-8 mb-12 shadow-2xl backdrop-blur-md transition-all hover:bg-[#111b27]/60" : "w-full h-full"}>
      {!hideHeader && (
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              Performance Journey
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {data[0]?.type === 'Contest' ? 'CareerByte Rating progress through contests' : 'Interview performance progression'}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-500`}
                   style={{ 
                      backgroundColor: `${tierColor}10`,
                      borderColor: `${tierColor}30`,
                      color: tierColor,
                      boxShadow: `0 0 15px ${tierColor}15`
                   }}>
                  {data[0].type === 'Contest' ? (
                      latestScore >= 2000 ? 'Master' :
                      latestScore >= 1800 ? 'Expert' :
                      latestScore >= 1500 ? 'Knight' :
                      latestScore >= 1200 ? 'Specialist' : 'Newbie'
                  ) : 'Progress'}
              </div>
              <div className="px-4 py-1.5 bg-gray-800/40 rounded-full border border-gray-700 text-gray-100 text-sm font-bold">
                  {data[0].type === 'Contest' ? latestScore.toFixed(1) : `${latestScore}%`}
              </div>
          </div>
        </div>
      )}
      
      <div className={`${variant === "card" ? "h-80" : "h-full"} w-full min-h-[300px] relative`}>
          <ResponsiveContainer width="99%" height="99%" minWidth={0} minHeight={300}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={tierColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={tierColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.1} />
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
                domain={data[0]?.type === 'Contest' ? ['dataMin - 100', 'dataMax + 100'] : [0, 100]}
                tickFormatter={(value) => data[0]?.type === 'Contest' ? value.toFixed(0) : `${value}%`}
              />
              <RechartsTooltip 
                content={CustomTooltip} 
                cursor={{ stroke: tierColor, strokeWidth: 1, strokeDasharray: '4 4' }} 
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke={tierColor} 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#scoreGradient)" 
                dot={{ r: 4, fill: tierColor, strokeWidth: 2, stroke: "#111b27" }}
                activeDot={{ r: 7, fill: tierColor, stroke: "#fff", strokeWidth: 2, className: "animate-pulse" }}
                animationDuration={2000}
                style={{ filter: `drop-shadow(0 0 8px ${tierColor}40)` }}
              />
            </AreaChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressGraph;
