import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Activity, 
  Target, 
  TrendingUp, 
  Star, 
  Calendar as CalendarIcon, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  FileText
} from 'lucide-react';
import DocumentViewer from '../../components/shared/DocumentViewer';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './UserDashboard.css';
import { 
  BarChart, Bar, Legend, Cell, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import ProgressGraph from '../../components/ProgressGraph';
import AppliedJobTable from '../../components/AppliedJobTable';
import useGetAppliedJobs from '../../hooks/useGetAppliedJobs';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const UserDashboard = () => {
  useGetAppliedJobs();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Leaderboard state
  const [leaderboardData, setLeaderboardData] = useState({ leaderboard: [], currentPage: 1, totalPages: 1 });
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState(null);
  // Resume Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState({ url: '', name: '' });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await api.get(`/dashboard/profile`);
        
        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError("Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.response?.data?.message || "Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, authLoading, navigate]);

  // Fetch Leaderboard Data
  useEffect(() => {
    if (authLoading || !user) return;

    const fetchLeaderboard = async () => {
      setLeaderboardLoading(true);
      setLeaderboardError(null);
      try {
        const response = await api.get(`/leaderboard?page=${leaderboardPage}&limit=10`);
        if (response.data.success) {
           setLeaderboardData(response.data.data);
        } else {
           setLeaderboardError("Failed to fetch leaderboard");
        }
      } catch (err) {
         setLeaderboardError(err.response?.data?.message || "Server Error");
      } finally {
         setLeaderboardLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [user, authLoading, leaderboardPage]);

  const handleNextPage = () => {
    if (leaderboardPage < leaderboardData.totalPages) setLeaderboardPage(p => p + 1);
  };

  const handlePrevPage = () => {
    if (leaderboardPage > 1) setLeaderboardPage(p => p - 1);
  };

  // Removed performanceData since ProgressGraph handles it.

  // Configure heatmap dates (Show last 12 months)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);

  const getHeatmapClassForValue = (value) => {
    if (!value) return 'color-empty';
    if (value.count === 1) return 'color-scale-1';
    if (value.count === 2) return 'color-scale-2';
    if (value.count === 3) return 'color-scale-3';
    return 'color-scale-4';
  };

  // CustomTooltipArea removed

  const CustomTooltipBar = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#09090b] dark:bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-md dark:shadow-xl backdrop-blur-sm">
          <p className="text-indigo-400 font-bold">{payload[0].payload.subject}</p>
          <p className="text-gray-800 dark:text-gray-200">Score: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  // Re-calculate heatmap data locally to ensure correctly bucketed for user's local day
  const heatmapData = useMemo(() => {
    const activityDates = dashboardData?.activityDates;
    const backendHeatmapData = dashboardData?.heatmapData;

    if (!activityDates || activityDates.length === 0) return backendHeatmapData || [];
    
    const localMap = {};
    activityDates.forEach(dateStr => {
      const d = new Date(dateStr);
      const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      localMap[ymd] = (localMap[ymd] || 0) + 1;
    });

    return Object.keys(localMap).map(date => ({
      date,
      count: localMap[date]
    }));
  }, [dashboardData?.activityDates, dashboardData?.heatmapData]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090b] pt-24 px-8 text-white flex flex-col items-center">
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-6 rounded-2xl text-center max-w-md w-full">
          <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getRatingColor = (rating) => {
    if (rating >= 2000) return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] font-black'; // Tier 1
    if (rating >= 1800) return 'text-purple-400 font-bold'; // Tier 2
    if (rating >= 1500) return 'text-blue-400 font-bold'; // Tier 3
    if (rating >= 1200) return 'text-emerald-400 font-semibold'; // Tier 4
    return 'text-gray-600 dark:text-gray-400 font-medium'; // Base
  };

  if (!dashboardData) return null;
  const { profileData, sectorScores, isUnrated } = dashboardData;

  // Resume Viewer Logic (Moved here to have access to profileData)
  const openResume = (e) => {
    e.preventDefault();
    if (profileData.resume) {
      setSelectedResume({ url: profileData.resume, name: profileData.resumeOriginalName || 'Resume.pdf' });
      setViewerOpen(true);
    }
  };

  const ratingColors = isUnrated ? 'text-gray-500' :
                       profileData.rating >= 2000 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' :
                       profileData.rating >= 1500 ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]' :
                       'text-gray-700 dark:text-gray-300';
                       
   const barColors = ['#8b5cf6', '#3b82f6', '#10b981'];

   // Calculate Heatmap Stats (Streak & Contributions)
   const totalContributions = heatmapData?.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0;
   const longestStreak = (() => {
       if (!heatmapData || heatmapData.length === 0) return 0;
       let max = 0;
       let current = 0;
       // Sort by date to calculate streak accurately
       const sorted = [...heatmapData].sort((a,b) => new Date(a.date) - new Date(b.date));
       sorted.forEach(d => {
           if (d.count > 0) {
               current++;
               if (current > max) max = current;
           } else {
               current = 0;
           }
       });
       return max;
   })();

   return (
    <div className="min-h-screen bg-[#09090b] text-white pt-24 px-4 md:px-8 pb-12 font-sans overflow-x-hidden relative">
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[80px] opacity-70 dark:opacity-100 pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[80px] opacity-70 dark:opacity-100 pointer-events-none" />
      
      <div className="max-w-[1440px] mx-auto relative z-10 space-y-8">
        {/* --- HERO SECTION: PROFILE & RANKINGS (Merged) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
           {/* Profile Card - 8/12 */}
           <div className="lg:col-span-8 bg-[#111b27]/60 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
              
              <div className="flex-shrink-0 relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 flex items-center justify-center overflow-hidden shadow-lg">
                  <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center text-3xl font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300 overflow-hidden">
                    {user?.profile?.profilePhoto ? (
                      <img src={user.profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.userName?.substring(0, 2) || "U"
                    )}
                  </div>
                </div>
                {profileData.rank <= 3 && profileData.rank > 0 && (
                   <div className={`absolute -top-3 -right-3 p-2.5 rounded-full border backdrop-blur-sm animate-bounce shadow-xl ${
                      profileData.rank === 1 ? 'bg-yellow-500/20 border-yellow-500/50' : 
                      profileData.rank === 2 ? 'bg-gray-300/20 border-gray-300/50' : 
                      'bg-amber-700/20 border-amber-700/50'
                   }`}>
                      <Trophy className={`w-6 h-6 ${
                        profileData.rank === 1 ? 'text-yellow-400' : 
                        profileData.rank === 2 ? 'text-gray-300' : 
                        'text-amber-600'
                      }`} />
                   </div>
                )}
              </div>

              <div className="text-center z-10 w-full flex-grow">
                 <div className="flex flex-col items-center justify-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black mb-1 tracking-tight">{user?.userName}</h1>
                        <p className="text-gray-400 flex items-center justify-center gap-2 text-sm font-medium">
                          <Star className="w-4 h-4 text-yellow-500" /> Top {profileData.percentile}% Candidates
                        </p>
                    </div>
                    <button
                      onClick={() => navigate('/candidate/profile/edit')}
                      className="px-6 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                    >
                      Update Profile
                    </button>
                 </div>
                 
                  {profileData.bio && (
                    <div className="max-w-2xl text-center mb-8 px-4">
                      <p className="text-gray-400 text-sm leading-relaxed italic">
                        "{profileData.bio}"
                      </p>
                    </div>
                  )}

                  {profileData.resume && (
                    <div className="mb-8">
                       <button 
                          onClick={openResume}
                          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
                       >
                          <FileText className="w-4 h-4" />
                          View My Resume
                       </button>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5 w-full">
                    <div className="flex flex-col items-center gap-1">
                       <span className="text-gray-500 text-[10px] uppercase tracking-widest font-black">Current Rating</span>
                       <div className={`text-3xl font-black tracking-tighter ${ratingColors}`}>
                          {isUnrated ? "Unrated" : profileData.rating.toFixed(1)}
                       </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 border-l border-white/5">
                       <span className="text-gray-500 text-[10px] uppercase tracking-widest font-black">Global Standing</span>
                       <div className="text-3xl font-black text-white italic drop-shadow-md">
                          {isUnrated ? "-" : `#${profileData.rank}`}
                       </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 border-l border-white/5">
                       <span className="text-gray-500 text-[10px] uppercase tracking-widest font-black">Skill Percentile</span>
                       <div className="text-3xl font-black text-indigo-400">
                          {isUnrated ? "0%" : `${(100 - profileData.percentile).toFixed(0)}%`}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Rankings Card - 4/12 */}
           <div className="lg:col-span-4 border border-slate-800 bg-[#111b27]/50 rounded-3xl backdrop-blur-md shadow-2xl overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-slate-800 bg-[#111b27]/80 flex items-center justify-between">
                 <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      Global Top 10
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Real-time Standings</p>
                 </div>
                 <button 
                   onClick={() => navigate('/candidate/leaderboard')}
                   className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                   title="View Full Leaderboard"
                 >
                   <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-indigo-400" />
                 </button>
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-1 max-h-[420px]">
                  {leaderboardError ? (
                     <div className="text-red-400 p-6 text-center text-xs">{leaderboardError}</div>
                  ) : (
                     leaderboardData.leaderboard.slice(0, 10).map((u) => {
                        const isCurrentUser = user && u.email === user.email;
                        return (
                          <div 
                            key={u._id}
                            className={`flex items-center justify-between p-2.5 rounded-xl transition-all border ${
                               isCurrentUser ? 'bg-indigo-900/30 border-indigo-500/40 shadow-lg' : 'hover:bg-white/5 border-transparent'
                            }`}
                          >
                             <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                                   u.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : 
                                   u.rank === 2 ? 'bg-gray-300/20 text-gray-300' :
                                   u.rank === 3 ? 'bg-amber-700/20 text-amber-600' :
                                   'bg-white/5 text-gray-500'
                                }`}>
                                   {u.rank}
                                </div>
                                <div className={`font-bold text-xs truncate max-w-[100px] ${getRatingColor(u.rating)}`}>
                                   {u.userName}
                                </div>
                             </div>
                             <div className="text-[11px] font-black text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                {u.rating.toFixed(0)}
                             </div>
                          </div>
                        );
                     })
                  )}
              </div>
           </div>
        </div>



        {/* --- INSIGHTS SECTION: PERFORMANCE & JOBS (Side-by-Side) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
           {/* Performance Journey - 8/12 */}
           <div className="lg:col-span-8 bg-[#111b27]/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl overflow-hidden relative">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                     <TrendingUp className="w-5 h-5 text-indigo-400" />
                     <div>
                        <h2 className="text-lg font-bold">Performance History</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Rating progression</p>
                     </div>
                 </div>
                 {!isUnrated && (
                    <div className="text-right">
                       <div className="text-xs text-gray-500 mb-0.5">Peak Rating</div>
                       <div className="text-lg font-black text-indigo-400">
                          {Math.max(...dashboardData.contestHistory.map(h => h.rating), profileData.rating).toFixed(0)}
                       </div>
                    </div>
                 )}
              </div>
              
              <div className="w-full h-[320px]">
                 <ProgressGraph 
                     contestHistory={dashboardData.contestHistory} 
                     isUnrated={isUnrated}
                     currentRating={profileData.rating}
                     variant="minimal"
                     hideHeader={true}
                 />
              </div>
           </div>

           {/* Compact Job Tracking - 4/12 */}
           <div className="lg:col-span-4 bg-[#111b27]/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <div>
                       <h2 className="text-lg font-bold">Job Tracking</h2>
                       <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Apply Status</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => navigate('/candidate/applied-jobs')}
                   className="p-1.5 hover:bg-white/5 rounded-lg transition-colors group"
                 >
                   <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
                 </button>
              </div>

              <div className="flex-grow">
                 <AppliedJobTable limit={4} variant="sidebar" />
              </div>

              <button 
                 onClick={() => navigate('/candidate/applied-jobs')}
                 className="mt-4 w-full py-2.5 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-widest rounded-xl border border-blue-500/20 transition-all active:scale-95"
              >
                 Detailed History
              </button>
           </div>
        </div>

        {/* --- BOTTOM SECTION: FULL WIDTH ACTIVITY GRID --- */}
        <div className="bg-[#111b27]/40 border border-slate-800 rounded-3xl p-4 md:p-6 lg:p-8 backdrop-blur-md shadow-xl overflow-hidden overflow-x-auto">
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-6 min-w-max">
              <div className="flex items-center gap-3">
                 <CalendarIcon className="w-5 h-5 text-pink-400" />
                 <div>
                    <h2 className="text-xl font-bold">Activity Grid</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Your annual engagement record</p>
                 </div>
              </div>
           </div>

           <div className="w-full flex justify-start md:justify-center py-4 min-w-[600px] overflow-x-auto">
              <div className="w-full max-w-[1240px] heatmap-stretched-wrapper">
                 <div className="text-xs">
                    <CalendarHeatmap
                       startDate={startDate}
                       endDate={endDate}
                       values={heatmapData}
                       classForValue={getHeatmapClassForValue}
                       showWeekdayLabels={true}
                    />
                 </div>
              </div>
           </div>

           {/* Legend & Stats Focused Area */}
           <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-6">
              <div className="flex items-center gap-8">
                 <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Total Contributions</span>
                    <span className="text-lg font-black text-indigo-400">{totalContributions}</span>
                 </div>
                 <div className="flex flex-col px-8 border-l border-white/5">
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Longest Streak</span>
                    <span className="text-lg font-black text-pink-400">{longestStreak} Days</span>
                 </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                 <div className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Consistency Legend</div>
                 <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-white/5 dark:bg-black/20 px-4 py-2 rounded-full border border-white/10">
                    <span className="opacity-60 font-bold">Less</span>
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#1e293b]"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#3730a3]"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#4338ca]"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#6366f1]"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#a5b4fc]"></div>
                    <span className="opacity-60 font-bold">More</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
      <DocumentViewer 
        isOpen={viewerOpen} 
        onClose={() => setViewerOpen(false)} 
        fileUrl={selectedResume.url} 
        fileName={selectedResume.name} 
      />
    </div>
  );
};

export default UserDashboard;
