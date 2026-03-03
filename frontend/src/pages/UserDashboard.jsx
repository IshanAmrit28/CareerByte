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
  Search
} from 'lucide-react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { 
  BarChart, Bar, Legend, Cell, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import ProgressGraph from '../components/ProgressGraph';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

import './UserDashboard.css';
import { API_BASE_URL as BASE_URL } from '../constants';

const API_BASE_URL = `${BASE_URL}/api`;

const UserDashboard = () => {
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

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/dashboard/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
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
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/leaderboard?page=${leaderboardPage}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-xl shadow-xl backdrop-blur-sm">
          <p className="text-indigo-400 font-bold">{payload[0].payload.subject}</p>
          <p className="text-gray-200">Score: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020817] pt-24 px-8 text-white flex flex-col items-center">
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
    return 'text-gray-400 font-medium'; // Base
  };

  const { profileData, heatmapData, sectorScores } = dashboardData;
  const ratingColors = profileData.rating >= 2000 ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]' :
                       profileData.rating >= 1500 ? 'text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]' :
                       'text-gray-300';
                       
  // Generate bar colors dynamically to make it beautiful
  const barColors = ['#8b5cf6', '#3b82f6', '#10b981'];

  return (
    <div className="min-h-screen bg-[#020817] text-white pt-24 px-4 md:px-8 pb-12 font-sans overflow-x-hidden relative">
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 items-start">
           {/* Main Left Content Area */}
           <div className="xl:col-span-2 flex flex-col gap-6 lg:gap-8">
              
              {/* Header section with Ranking */}
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-gray-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                 {/* Decorative glow */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
                 
                 <div className="flex-shrink-0 relative">
                   <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1">
                     <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center text-3xl font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-purple-300">
                       {user?.userName?.substring(0, 2) || "U"}
                     </div>
                   </div>
                   {profileData.rank === 1 && (
                      <div className="absolute -top-3 -right-3 bg-yellow-500/20 p-2.5 rounded-full border border-yellow-500/50 backdrop-blur-sm animate-pulse">
                         <Trophy className="w-6 h-6 text-yellow-400" />
                      </div>
                   )}
                 </div>

                 <div className="text-center md:text-left z-10 w-full">
                    <h1 className="text-2xl md:text-4xl font-extrabold mb-1">{user?.userName}</h1>
                    <p className="text-gray-400 mb-6 flex items-center justify-center md:justify-start gap-2 text-sm">
                      <Star className="w-4 h-4" /> Global Talent Profile
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                       <div className="group relative">
                         <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">InterVerse Rating</div>
                         <div className={`text-4xl font-black ${ratingColors}`}>
                            {profileData.rating}
                         </div>
                       </div>
                       
                       <div className="h-10 w-px bg-gray-700/50 hidden md:block"></div>
                       
                       <div>
                         <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Global Rank</div>
                         <div className="text-2xl font-bold flex items-baseline gap-1">
                            <span className="text-white">#{profileData.rank}</span>
                            <span className="text-sm text-gray-500 font-normal">/ {profileData.totalRankedUsers}</span>
                         </div>
                         <div className="text-xs text-indigo-400 font-medium mt-1 bg-indigo-500/10 inline-block px-2 py-0.5 rounded border border-indigo-500/20">
                            Top {100 - profileData.percentile}%
                         </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Smaller Analytics Row (Quick Stats + Mastery side by side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quick Stats side cards inside 1 box */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col justify-center text-center items-center">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                           <Activity className="w-4 h-4 text-blue-400" />
                           <h3 className="font-semibold text-xs uppercase tracking-wider">Interviews</h3>
                        </div>
                        <div className="text-3xl font-black text-gray-100">{dashboardData.reports.length}</div>
                     </div>
                     
                     <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col justify-center text-center items-center">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                           <Target className="w-4 h-4 text-emerald-400" />
                           <h3 className="font-semibold text-xs uppercase tracking-wider">Top Section</h3>
                        </div>
                        {sectorScores.length > 0 ? (() => {
                          const topSector = [...sectorScores].sort((a,b) => b.score - a.score)[0];
                          return (
                            <div className="w-full">
                              <div className="text-lg font-bold text-gray-100 truncate w-full">{topSector.subject}</div>
                              <div className="text-xs text-emerald-400 mt-1">{topSector.score}% Acc</div>
                            </div>
                          );
                        })() : (
                          <div className="text-gray-500 text-sm italic">No data</div>
                        )}
                     </div>
                  </div>

                  {/* Shrunken Section Mastery Bar Chart */}
                  <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 backdrop-blur-md shadow-xl">
                     <div className="flex items-center gap-2 mb-4">
                        <Target className="w-4 h-4 text-purple-400" />
                        <h2 className="text-sm uppercase tracking-wider font-bold text-gray-300">Section Mastery</h2>
                     </div>
                     
                     <div className="h-28 w-full relative">
                       {sectorScores.length === 0 ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-xs text-center border border-dashed border-gray-700/50 rounded-lg">
                            <p>No section data found.</p>
                          </div>
                       ) : (
                         <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={sectorScores} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barSize={20}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.2} />
                             <XAxis dataKey="subject" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dy={5} />
                             <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                             <RechartsTooltip content={<CustomTooltipBar active={false} payload={[]} />} cursor={{ fill: '#374151', opacity: 0.2 }} />
                             <Bar dataKey="score" radius={[4, 4, 0, 0]} animationDuration={1000}>
                               {sectorScores.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                               ))}
                             </Bar>
                           </BarChart>
                         </ResponsiveContainer>
                       )}
                     </div>
                  </div>
              </div>

              {/* Performance Area Chart */}
              <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-lg font-bold">Performance History</h2>
                    </div>
                 </div>
                 
                 <div className="-mx-4 md:mx-0">
                    <ProgressGraph reports={dashboardData.reports} />
                 </div>
              </div>

              {/* Activity Heatmap */}
              <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl overflow-hidden">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-800/50 pb-4">
                    <div className="flex items-center gap-3">
                       <CalendarIcon className="w-5 h-5 text-pink-400" />
                       <div>
                          <h2 className="text-lg font-bold">Activity Grid</h2>
                          <p className="text-xs text-gray-400">1-Year History</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700">
                       <span>Less</span>
                       <div className="w-2.5 h-2.5 rounded-[2px] bg-[#1e293b]"></div>
                       <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-900"></div>
                       <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-700"></div>
                       <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-500"></div>
                       <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-400"></div>
                       <span>More</span>
                    </div>
                 </div>

                 {/* Compact Heatmap Container */}
                 <div className="w-full overflow-x-auto heatmap-compact-wrapper">
                    <div className="min-w-[700px] text-xs">
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

           </div>

           {/* Vertical Right Side Panel (Leaderboard Widget) */}
           <div className="xl:col-span-1 border border-gray-800/80 bg-gray-900/50 rounded-3xl backdrop-blur-md shadow-2xl overflow-hidden flex flex-col h-fit">
              <div className="p-6 border-b border-gray-800/80 bg-gray-900/80 flex flex-col gap-1">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Top 10 Rankings
                    </h2>
                 </div>
                 <p className="text-xs text-gray-400">Global Standings</p>
              </div>

              <div className="overflow-y-auto custom-scrollbar p-2 max-h-[380px]">
                  {leaderboardError ? (
                     <div className="text-red-400 p-6 text-center text-sm">{leaderboardError}</div>
                  ) : leaderboardLoading && leaderboardData.leaderboard.length === 0 ? (
                     <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                     </div>
                  ) : (
                     <div className="flex flex-col gap-1">
                        {leaderboardData.leaderboard.map((u) => {
                           const isCurrentUser = user && u.email === user.email;
                           return (
                             <div 
                               key={u.id}
                               onClick={() => { if (!isCurrentUser) navigate(`/profile/${u.id}`); }} 
                               className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                                  isCurrentUser ? 'bg-indigo-900/20 border border-indigo-500/30' : 'hover:bg-gray-800/40 cursor-pointer border border-transparent'
                               }`}
                             >
                                <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                      u.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 
                                      u.rank === 2 ? 'bg-gray-300/20 text-gray-300 border border-gray-300/40' :
                                      u.rank === 3 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40' :
                                      'bg-gray-800 text-gray-500'
                                   }`}>
                                      {u.rank}
                                   </div>
                                   <div>
                                      <div className={`font-medium text-sm flex items-center gap-2 ${getRatingColor(u.rating)}`}>
                                         <span className="truncate max-w-[120px]">{u.userName}</span>
                                         {isCurrentUser && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">You</span>}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-0.5">{u.totalInterviews} mock sessions</div>
                                   </div>
                                </div>
                                <div className={`text-sm font-black tracking-wide ${getRatingColor(u.rating)} bg-gray-900/50 px-2.5 py-1 rounded-lg border border-gray-800/80 shadow-inner`}>
                                   {u.rating}
                                </div>
                             </div>
                           );
                        })}
                     </div>
                  )}
              </div>

              {/* Link to Full Leaderboard */}
              <div className="bg-gray-900/80 border-t border-gray-800/80 p-3 flex justify-center items-center">
                 <button 
                   onClick={() => navigate('/leaderboard')}
                   className="w-full py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 text-sm font-semibold rounded-lg border border-indigo-500/20 transition-colors flex items-center justify-center gap-2"
                 >
                   View Full Leaderboard
                   <ChevronRight className="w-4 h-4 text-indigo-400" />
                 </button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
