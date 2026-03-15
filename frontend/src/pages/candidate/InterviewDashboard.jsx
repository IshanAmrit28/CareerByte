import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, FileText, ChevronRight, Loader2, Activity, Target, TrendingUp } from "lucide-react";
import { 
  BarChart, Bar, Cell, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import ProgressGraph from "../../components/ProgressGraph";
import { getUserReports } from "../../services/interviewService";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const InterviewDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ sectorScores: [], reportCount: 0 });

  const barColors = ['#8b5cf6', '#3b82f6', '#10b981'];

  const CustomTooltipBar = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#09090b] dark:bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-md dark:shadow-xl backdrop-blur-sm">
          <p className="text-indigo-400 font-bold">{payload[0].payload.subject}</p>
          <p className="text-gray-200">Score: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both reports and dashboard stats
        const [reportsRes, dashboardRes] = await Promise.all([
          getUserReports(),
          api.get('/dashboard/profile')
        ]);
        
        setReports(reportsRes.reports || []);
        
        if (dashboardRes.data.success) {
          setStats({
            sectorScores: dashboardRes.data.data.sectorScores,
            reportCount: dashboardRes.data.data.reports.length
          });
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-12 px-8 pb-12 font-sans overflow-x-hidden relative">
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-gray-900/50 p-8 rounded-3xl border border-gray-800/60 shadow-2xl backdrop-blur-sm">
          <div>
            <h1 className="text-3xl font-extrabold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Welcome back, {user?.userName || "Candidate"}!
            </h1>
            <p className="text-lg text-gray-400">
              Ready to ace your next mock interview? Let's get started.
            </p>
          </div>
          
          <button
            onClick={() => navigate("/candidate/practice-setup")}
            className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <Play className="w-6 h-6 fill-white drop-shadow-md" />
            Start Interview Practice
          </button>
        </div>

        {/* Quick Stats and Analytics Row */}
        {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1 grid grid-cols-2 gap-4">
                <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-center items-center text-center">
                    <Activity className="w-5 h-5 text-blue-400 mb-3" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Total Mock</h3>
                    <div className="text-3xl font-black">{stats.reportCount}</div>
                </div>
                
                <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-center items-center text-center">
                    <Target className="w-5 h-5 text-emerald-400 mb-3" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Top Area</h3>
                    {stats.sectorScores.length > 0 ? (() => {
                        const top = [...stats.sectorScores].sort((a,b) => b.score - a.score)[0];
                        return (
                           <div className="truncate w-full font-bold text-gray-200">{top.subject}</div>
                        );
                    })() : <div className="text-gray-500">-</div>}
                </div>
            </div>

            <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800 rounded-3xl p-6 backdrop-blur-md shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                    <Target className="w-5 h-5 text-purple-400" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Skill Distribution</h2>
                </div>
                <div className="h-32 w-full">
                    {stats.sectorScores.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
                            <BarChart data={stats.sectorScores} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.1} />
                                <XAxis dataKey="subject" stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                                <RechartsTooltip content={<CustomTooltipBar />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={30}>
                                    {stats.sectorScores.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-600 text-xs italic">No interview data available</div>
                    )}
                </div>
            </div>
        </div>
        )}

        {/* Performance Graph Section for Mock Interviews */}
        {!loading && !error && reports.length > 0 && (
            <div className="mb-12">
                <ProgressGraph reports={reports} />
            </div>
        )}

        {/* History Section */}
        <div className="bg-gray-900/40 border border-gray-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="p-8 border-b border-gray-800/80 flex items-center gap-3 bg-gray-900/80">
            <FileText className="w-7 h-7 text-indigo-400" />
            <h2 className="text-2xl font-bold">Recent Interview Attempts</h2>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="w-12 h-12 mb-4 animate-spin text-indigo-500" />
                <p className="text-lg">Loading your interview history...</p>
              </div>
            ) : error ? (
              <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-6 rounded-2xl text-center">
                <p className="text-lg font-medium">{error}</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-dashed border-gray-700">
                <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <FileText className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">No Interviews Yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  You haven't completed any mock interviews. Click the start button above to launch your first session!
                </p>
                <button
                  onClick={() => navigate("/candidate/practice-setup")}
                  className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
                >
                  Start your first interview &rarr;
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-800/50 hidden md:block">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-800/50 text-gray-400 uppercase text-sm tracking-wider">
                      <th className="p-4 font-semibold w-1/3">Target Role</th>
                      <th className="p-4 font-semibold w-1/4">Date</th>
                      <th className="p-4 font-semibold w-1/6 text-center">Overall Score</th>
                      <th className="p-4 font-semibold w-1/4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {reports.map((report) => (
                      <tr 
                        key={report.reportId} 
                        className="hover:bg-gray-800/30 transition-colors group cursor-default"
                      >
                        <td className="p-4 font-medium text-gray-200">
                          {report.role}
                        </td>
                        <td className="p-4 text-gray-400 text-sm">
                          {formatDate(report.createdAt)}
                        </td>
                         <td className="p-4 text-center">
                           <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${
                             report.status === "pending" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse" :
                             report.status === "failed" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                             report.overallScore >= 80 ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                             report.overallScore >= 50 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                             "bg-red-500/20 text-red-400 border border-red-500/30"
                           }`}>
                             {report.status === "pending" ? "Evaluating..." : report.status === "failed" ? "Failed" : `${report.overallScore}%`}
                           </span>
                        </td>
                         <td className="p-4 text-right flex justify-end gap-2">
                          {report.status === "failed" && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await api.post(`/report/retry-evaluation/${report.reportId}`);
                                  // Refresh reports
                                  const reportsRes = await getUserReports();
                                  setReports(reportsRes.reports || []);
                                } catch (err) {
                                  alert("Retry failed: " + err.message);
                                }
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-all shadow-md"
                            >
                              Retry Evaluation
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/candidate/report/${report.reportId}`)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                              report.status === "completed" 
                                ? "bg-gray-800 hover:bg-gray-700 text-indigo-400 hover:text-indigo-300 group-hover:shadow-md" 
                                : "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                            }`}
                            disabled={report.status !== "completed"}
                          >
                            View Report
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Mobile View for Reports */}
            {!loading && !error && reports.length > 0 && (
              <div className="md:hidden space-y-4">
                {reports.map((report) => (
                  <div key={report.reportId} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5 hover:bg-gray-800/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-gray-200">{report.role}</h3>
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${
                         report.status === "pending" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse" :
                         report.status === "failed" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                         report.overallScore >= 80 ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                         report.overallScore >= 50 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                         "bg-red-500/20 text-red-400 border border-red-500/30"
                       }`}>
                         {report.status === "pending" ? "Evaluating..." : report.status === "failed" ? "Failed" : `${report.overallScore}%`}
                       </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{formatDate(report.createdAt)}</p>
                    <div className="flex flex-col gap-2">
                      {report.status === "failed" && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await api.post(`/report/retry-evaluation/${report.reportId}`);
                              const reportsRes = await getUserReports();
                              setReports(reportsRes.reports || []);
                            } catch (err) {
                              alert("Retry failed: " + err.message);
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-all shadow-md"
                        >
                          Retry Evaluation
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/candidate/report/${report.reportId}`)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                          report.status === "completed" 
                            ? "bg-gray-800 hover:bg-gray-700 text-indigo-400" 
                            : "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={report.status !== "completed"}
                      >
                        {report.status === "completed" ? "View Full Report" : "Processing..."}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDashboard;
