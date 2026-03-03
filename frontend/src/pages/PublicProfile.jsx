import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Activity, Target, Calendar as CalendarIcon, Loader2, ArrowLeft } from 'lucide-react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import './UserDashboard.css';
import { API_BASE_URL as BASE_URL } from '../constants';

const API_BASE_URL = `${BASE_URL}/api`;

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    // If viewing own profile, redirect to private dashboard
    if (user.id === id || user._id === id) {
       navigate('/profile');
       return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/dashboard/public/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setProfileData(response.data.data);
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        if (err.response?.status === 404) setError("User not found or is not a candidate");
        else setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020817] pt-32 px-8 text-white flex flex-col items-center">
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-8 rounded-2xl text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Profile Unavailable</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={() => navigate('/leaderboard')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition font-medium flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
          </button>
        </div>
      </div>
    );
  }

  const { userName, profileData: stats, heatmapData, sectorScores, totalInterviews } = profileData;
  
  // Performance rating scale colors
  const getRatingColor = (rating) => {
    if (rating >= 2000) return 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]'; // Tier 1
    if (rating >= 1800) return 'text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]'; // Tier 2
    if (rating >= 1500) return 'text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]'; // Tier 3
    if (rating >= 1200) return 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]'; // Tier 4
    return 'text-gray-400'; // Base
  };

  const barColors = ['#8b5cf6', '#3b82f6', '#10b981'];
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

  return (
    <div className="min-h-screen bg-[#020817] text-white pt-24 px-4 md:px-8 pb-12 font-sans overflow-x-hidden relative">
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        <button onClick={() => navigate('/leaderboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition group w-max">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Leaderboard</span>
        </button>

        {/* Header section with Ranking */}
        <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-gray-800 rounded-3xl p-8 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center gap-8 lg:gap-12 relative overflow-hidden">
             
             <div className="flex-shrink-0 relative">
               <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-indigo-500/50 via-purple-500/50 to-pink-500/50 p-1">
                 <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center text-3xl font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-indigo-100 to-purple-200">
                   {userName?.substring(0, 2) || "U"}
                 </div>
               </div>
               {stats.rank === 1 && (
                  <div className="absolute -top-3 -right-3 bg-yellow-500/20 p-2.5 rounded-full border border-yellow-500/50 backdrop-blur-sm shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                     <Trophy className="w-6 h-6 text-yellow-400" />
                  </div>
               )}
             </div>

             <div className="text-center md:text-left z-10 w-full">
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-6 border-b border-gray-800 pb-6 w-full gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-1 tracking-tight">{userName}</h1>
                        <p className="text-gray-400 text-sm">Public Candidate Profile</p>
                    </div>
                    <div className="text-center md:text-right bg-gray-800/50 px-6 py-3 rounded-2xl border border-gray-700/50">
                        <div className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-semibold">Global Rank</div>
                        <div className="text-2xl font-bold flex items-baseline justify-center md:justify-end gap-1">
                           <span className="text-white">#{stats.rank}</span>
                           <span className="text-sm text-gray-500 font-normal">/ {stats.totalRankedUsers}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 md:gap-12 w-full">
                   <div>
                     <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Performance Rating</div>
                     <div className={`text-4xl font-black tracking-tight ${getRatingColor(stats.rating)}`}>
                        {stats.rating}
                     </div>
                   </div>
                   
                   <div className="h-10 w-px bg-gray-700/50 hidden md:block"></div>
                   
                   <div>
                     <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Total Interviews</div>
                     <div className="text-3xl font-bold text-gray-200">{totalInterviews}</div>
                   </div>
                </div>
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sectional Mastery */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                    <Target className="w-5 h-5 text-purple-400" />
                    <h2 className="text-sm uppercase tracking-wider font-bold text-gray-300">Public Section Mastery</h2>
                </div>
                
                <div className="h-40 w-full relative">
                   {sectorScores.length === 0 ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-sm border border-dashed border-gray-700/50 rounded-xl">
                        <p>No section data found.</p>
                      </div>
                   ) : (
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={sectorScores} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barSize={30}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.2} />
                         <XAxis dataKey="subject" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} dy={5} />
                         <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                         <RechartsTooltip 
                            cursor={{ fill: '#374151', opacity: 0.2 }} 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                 return (
                                   <div className="bg-gray-800 border border-gray-700 p-3 rounded-xl shadow-xl backdrop-blur-sm">
                                     <p className="text-indigo-400 font-bold text-sm">{payload[0].payload.subject}</p>
                                     <p className="text-gray-200 text-xs">Average: {payload[0].value}%</p>
                                   </div>
                                 );
                              }
                              return null;
                            }}
                         />
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

            {/* Activity Heatmap */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl overflow-hidden flex flex-col justify-center">
               <div className="flex items-center gap-3 mb-4">
                  <CalendarIcon className="w-5 h-5 text-pink-400" />
                  <div>
                     <h2 className="text-sm uppercase tracking-wider font-bold text-gray-300">Activity Grid</h2>
                     <p className="text-xs text-gray-400">1-Year History</p>
                  </div>
               </div>

               <div className="w-full overflow-x-auto heatmap-compact-wrapper">
                  <div className="min-w-[700px]">
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

      </div>
    </div>
  );
};

export default PublicProfile;
