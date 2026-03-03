import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, CheckCircle, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL as BASE_URL } from '../constants';

const API_BASE_URL = `${BASE_URL}/api`;

const Leaderboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ leaderboard: [], currentPage: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/leaderboard?page=${page}&limit=50`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
           setData(response.data.data);
        } else {
           setError("Failed to fetch leaderboard");
        }
      } catch (err) {
         setError(err.response?.data?.message || "Server Error");
      } finally {
         setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [user, authLoading, navigate, page]);

  const handleNextPage = () => {
    if (page < data.totalPages) setPage(p => p + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
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

  return (
    <div className="min-h-screen bg-[#020817] text-white pt-24 px-4 md:px-8 pb-12 font-sans relative">
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
               <h1 className="text-3xl font-extrabold flex items-center gap-3">
                 <Trophy className="w-8 h-8 text-yellow-400" />
                 Global Leaderboard
               </h1>
               <p className="text-gray-400 mt-1 pl-11 text-sm">Compare your performance rating with other candidates.</p>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2 flex items-center gap-2">
               <Search className="w-4 h-4 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Find user..." 
                 className="bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-500 w-32 focus:w-48 transition-all"
               />
            </div>
         </div>

         {error ? (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-2xl text-center">
              <p>{error}</p>
            </div>
         ) : loading && data.leaderboard.length === 0 ? (
            <div className="flex justify-center items-center h-64">
               <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
         ) : (
           <div className="bg-gray-900/60 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-800/80 border-b border-gray-700">
                     <th className="px-6 py-4 font-semibold text-gray-300 w-24">Rank</th>
                     <th className="px-6 py-4 font-semibold text-gray-300">Candidate</th>
                     <th className="px-6 py-4 font-semibold text-gray-300 text-center">Total Interviews</th>
                     <th className="px-6 py-4 font-semibold text-gray-300 text-right">Rating</th>
                   </tr>
                 </thead>
                 <tbody>
                   {data.leaderboard.map((u, i) => (
                     <tr 
                       key={u.id}
                       onClick={() => navigate(`/profile/${u.id}`)} 
                       className={`border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors ${u.email === user.email ? 'bg-indigo-900/10 hover:bg-indigo-900/20' : ''}`}
                     >
                       <td className="px-6 py-4 font-medium text-gray-400">
                         {u.rank === 1 ? <span className="text-yellow-400 font-bold tracking-widest pl-1">1</span> : 
                          u.rank <= 3 ? <span className="text-gray-200 font-bold pl-1">{u.rank}</span> : 
                          u.rank}
                       </td>
                       <td className="px-6 py-4 font-medium">
                          <span className={`${getRatingColor(u.rating)}`}>{u.userName}</span>
                          {u.email === user.email && (
                             <span className="ml-3 text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">You</span>
                          )}
                       </td>
                       <td className="px-6 py-4 text-gray-400 text-center">{u.totalInterviews}</td>
                       <td className={`px-6 py-4 text-right tracking-wide ${getRatingColor(u.rating)}`}>
                          {u.rating}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             
             {/* Pagination */}
             {data.totalPages > 1 && (
                <div className="bg-gray-800/50 border-t border-gray-700 p-4 flex justify-between items-center">
                   <div className="text-sm text-gray-400">
                      Page <span className="font-medium text-white">{data.currentPage}</span> of <span className="font-medium text-white">{data.totalPages}</span>
                   </div>
                   <div className="flex gap-2">
                       <button 
                         onClick={handlePrevPage}
                         disabled={page === 1 || loading}
                         className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                       >
                         <ChevronLeft className="w-5 h-5 text-gray-300" />
                       </button>
                       <button 
                         onClick={handleNextPage}
                         disabled={page === data.totalPages || loading}
                         className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                       >
                         <ChevronRight className="w-5 h-5 text-gray-300" />
                       </button>
                   </div>
                </div>
             )}
           </div>
         )}
      </div>
    </div>
  );
};

export default Leaderboard;
