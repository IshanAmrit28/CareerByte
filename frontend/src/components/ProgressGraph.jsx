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
          Score: {payload[0].value}%
        </p>
        {data.role && (
          <p className="text-gray-400 text-xs truncate max-w-[200px]">Role: {data.role}</p>
        )}
      </div>
    );
  }
  return null;
};

const ProgressGraph = ({ reports }) => {
  const data = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    
    // Sort chronologically ascending for the graph (oldest to newest)
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
        score: report.overallScore || 0,
        role: report.role || "Interview",
      };
    });
  }, [reports]);

  // Handle empty state - though the dashboard shouldn't render this if no reports
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#111b27]/40 border border-slate-800 rounded-3xl p-6 md:p-8 mb-12 shadow-2xl backdrop-blur-md transition-all hover:bg-[#111b27]/60">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            Performance Journey
          </h2>
          <p className="text-gray-400 text-sm mt-1">Track your interview scores over time</p>
        </div>
        {data.length > 0 && (
          <div className="mt-4 md:mt-0 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 text-sm font-semibold">
            Latest Score: {data[data.length - 1].score}%
          </div>
        )}
      </div>
      
      <div className="h-72 w-full mt-4 min-h-[250px] relative">
        {data.length === 1 ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-800/20 rounded-2xl border border-dashed border-gray-700/50">
             <p className="mb-2 text-indigo-400/80 font-medium">Keep going!</p>
             <p className="text-sm text-center max-w-xs">You have one interview completed. Complete more to see your progress graph.</p>
           </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.5} />
              <XAxis 
                dataKey="dateStr" 
                stroke="#9ca3af" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                dy={10} 
                minTickGap={20}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                dx={-10}
              />
              <RechartsTooltip 
                content={CustomTooltip} 
                cursor={{ stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '4 4' }} 
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#818cf8" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#scoreGradient)" 
                activeDot={{ r: 6, fill: "#4f46e5", stroke: "#c7d2fe", strokeWidth: 2, className: "animate-pulse" }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ProgressGraph;
