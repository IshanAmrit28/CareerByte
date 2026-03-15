import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Loader2, 
  ArrowLeft, 
  Trophy, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Star,
  FileText
} from 'lucide-react';
import DocumentViewer from '../../components/shared/DocumentViewer';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './UserDashboard.css';
import ProgressGraph from '../../components/ProgressGraph';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // Resume Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState({ url: '', name: '' });

  const openResume = (e) => {
    e.preventDefault();
    if (profileData.resume) {
      setSelectedResume({ url: profileData.resume, name: profileData.resumeOriginalName || 'Resume.pdf' });
      setViewerOpen(true);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    // If viewing own profile, redirect to private dashboard
    if (user.id === id || user._id === id) {
       navigate('/candidate/profile');
       return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get(`/dashboard/public/${id}`);
        
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

  // Re-calculate heatmap data locally to ensure correctly bucketed for user's local day
  const heatmapData = useMemo(() => {
    const activityDates = profileData?.activityDates;
    const backendHeatmapData = profileData?.heatmapData;

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
  }, [profileData?.activityDates, profileData?.heatmapData]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090b] pt-32 px-8 text-white flex flex-col items-center">
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-8 rounded-2xl text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Profile Unavailable</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={() => navigate('/candidate/leaderboard')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition font-medium flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
          </button>
        </div>
      </div>
    );
  }

  const { userName, profilePhoto: pPhoto, profileData: stats, bio, resume, resumeOriginalName } = profileData || {};
  
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

  const isUnrated = (stats?.rating || 0) === 0;
  const ratingColors = isUnrated ? 'text-gray-500' :
                       stats.rating >= 2000 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' :
                       stats.rating >= 1500 ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]' :
                       'text-gray-700 dark:text-gray-300';

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-24 px-4 md:px-8 pb-12 font-sans overflow-x-hidden relative">
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        <button onClick={() => navigate('/candidate/leaderboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition group w-max">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Standings</span>
        </button>

        <div className="flex flex-col gap-8 w-full">
              
              {/* Header section with Ranking */}
              <div className="bg-[#111b27]/60 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                 {/* Decorative glow */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
                 
                 <div className="flex-shrink-0 relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center text-3xl font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300 overflow-hidden">
                    {profileData.profilePhoto ? (
                          <img src={profileData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          userName?.substring(0, 2) || "U"
                        )}
                      </div>
                    </div>
                    {stats?.rank <= 3 && stats?.rank > 0 && (
                       <div className={`absolute -top-3 -right-3 p-2.5 rounded-full border backdrop-blur-sm animate-bounce shadow-xl ${
                          stats.rank === 1 ? 'bg-yellow-500/20 border-yellow-500/50' : 
                          stats.rank === 2 ? 'bg-gray-300/20 border-gray-300/50' : 
                          'bg-amber-700/20 border-amber-700/50'
                       }`}>
                          <Trophy className={`w-6 h-6 ${
                            stats.rank === 1 ? 'text-yellow-400' : 
                            stats.rank === 2 ? 'text-gray-300' : 
                            'text-amber-600'
                          }`} />
                       </div>
                    )}
                 </div>

                 <div className="text-center md:text-left z-10 w-full">
                    <h1 className="text-2xl md:text-3xl font-extrabold mb-1">{userName}</h1>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center md:justify-start gap-2 text-sm mb-6">
                        <Star className="w-4 h-4" /> Global Talent Profile
                    </p>

                    {bio && (
                      <div className="max-w-xl mb-6">
                        <p className="text-gray-400 text-sm italic leading-relaxed">
                          "{bio}"
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-6">
                       <div className="flex flex-col gap-1">
                          <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-tighter font-bold">CareerByte Rating</span>
                          <div className={`text-2xl md:text-3xl font-black tracking-tighter ${ratingColors}`}>
                             {isUnrated ? "Unrated" : stats?.rating?.toFixed(1) || "0.0"}
                          </div>
                       </div>

                       <div className="flex flex-col gap-1 pl-6 border-l border-slate-200 dark:border-slate-800">
                          <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-tighter font-bold">Global Rank</span>
                          <div className="flex items-center gap-2">
                             <div className="text-2xl md:text-3xl font-black text-gray-100 italic">
                                {isUnrated ? "-" : `#${stats?.rank || 0}`}
                             </div>
                             {!isUnrated && (
                             <div className="text-[10px] text-indigo-400 font-bold px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                Top {stats?.percentile || 0}%
                             </div>
                             )}
                          </div>
                       </div>
                    </div>

                    {resume && (
                      <div className="mt-6 flex justify-center md:justify-start">
                         <button 
                            onClick={openResume}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
                         >
                            <FileText className="w-4 h-4" />
                            View Candidate Resume
                         </button>
                      </div>
                    )}
                 </div>
              </div>

              {/* Performance Area Chart */}
              <div className="bg-[#111b27]/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl">
                 <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-lg font-bold">Performance History</h2>
                    </div>
                 </div>
                 
                 <div className="w-full">
                    <ProgressGraph 
                        contestHistory={profileData.contestHistory} 
                        currentRating={stats?.rating || 0}
                    />
                 </div>
              </div>

              {/* Activity Heatmap */}
              <div className="bg-[#111b27]/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl overflow-hidden flex flex-col justify-center">
                 <div className="flex items-center justify-between w-full mb-6">
                    <div className="flex items-center gap-3">
                       <CalendarIcon className="w-5 h-5 text-pink-400" />
                       <div>
                          <h2 className="text-sm uppercase tracking-wider font-bold text-gray-300">Activity Grid</h2>
                          <p className="text-xs text-gray-400">1-Year History</p>
                       </div>
                    </div>
                 </div>

                 <div className="w-full heatmap-stretched-wrapper">
                    <div className="text-xs">
                       <CalendarHeatmap
                          startDate={startDate}
                          endDate={endDate}
                          values={heatmapData || []}
                          classForValue={getHeatmapClassForValue}
                          showWeekdayLabels={true}
                       />
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

export default PublicProfile;
