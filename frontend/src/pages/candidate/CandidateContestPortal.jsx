import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Clock, Trophy, AlertCircle, ArrowRight, X } from 'lucide-react';

const CandidateContestPortal = () => {
    const { contestId } = useParams();
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rankings, setRankings] = useState([]);
    const [showRankings, setShowRankings] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchContest = async () => {
            try {
                const res = await api.get(`/contests/${contestId}`);
                if (res.data.success) {
                    setContest(res.data.contest);
                    
                    // If contest ended, fetch rankings automatically
                    const now = new Date();
                    if (now > new Date(res.data.contest.endTime)) {
                        fetchRankings();
                    }
                }
            } catch (error) {
                toast.error("Failed to load contest");
                navigate('/candidate/contests');
            } finally {
                setLoading(false);
            }
        };

        const fetchRankings = async () => {
            try {
                const res = await api.get(`/contests/${contestId}/rankings`);
                if (res.data.success) {
                    setRankings(res.data.rankings);
                }
            } catch (error) {
                console.error("Rankings fetch error:", error);
            }
        };

        fetchContest();
    }, [contestId, navigate]);

    const getStatus = () => {
        if (!contest) return null;
        const now = new Date();
        const start = new Date(contest.startTime);
        const end = new Date(contest.endTime);

        if (now < start) return 'upcoming';
        if (now > end) return 'ended';
        return 'active';
    };

    if (loading) return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
            <div className="animate-spin h-10 w-10 border-t-2 border-indigo-500 rounded-full" />
        </div>
    );

    const status = getStatus();

    return (
        <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6 pt-24">
            <div className="relative max-w-3xl w-full bg-gray-900/60 border border-gray-800 rounded-3xl p-10 backdrop-blur-md shadow-2xl">
                {/* Close Button */}
                <button 
                    onClick={() => navigate('/candidate/contests')}
                    className="absolute top-6 left-6 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-gray-700"
                    title="Back to contests"
                >
                    <X size={20} />
                </button>

                <div className="flex justify-between items-start mb-8 pl-12">
                    <div>
                        <h1 className="text-4xl font-extrabold mb-2">{contest?.title}</h1>
                        <p className="text-gray-400">{contest?.description}</p>
                    </div>
                    <div className="p-4 bg-indigo-500/10 rounded-2xl shrink-0">
                        <Trophy className="text-indigo-500 w-8 h-8" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                        <div className="flex items-center gap-3 text-indigo-400 mb-2 font-bold uppercase text-xs tracking-widest">
                            <Clock size={16} />
                            Schedule
                        </div>
                        <p className="text-sm text-gray-300">
                            Starts: {new Date(contest?.startTime).toLocaleString()}<br />
                            Ends: {new Date(contest?.endTime).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                        <div className="flex items-center gap-3 text-yellow-400 mb-2 font-bold uppercase text-xs tracking-widest">
                            <AlertCircle size={16} />
                            Status
                        </div>
                        <p className="text-sm text-gray-300 capitalize">
                            {status === 'active' ? 'Contest is currently live!' : 
                             status === 'upcoming' ? 'Contest has not started yet.' : 
                             'Contest has ended.'}
                        </p>
                    </div>
                </div>

                <div className="mb-10">
                    <h3 className="text-lg font-bold mb-4">Questions in this contest</h3>
                    <div className="space-y-3">
                        {contest?.questions ? contest.questions.map((q, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl">
                                <span className="font-medium">{q.title}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                                    q.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                    'bg-red-500/10 text-red-400'
                                }`}>
                                    {q.difficulty}
                                </span>
                            </div>
                        )) : (
                            <p className="text-gray-500 italic text-sm">Questions will be revealed when the contest starts.</p>
                        )}
                    </div>
                </div>

                {status === 'active' ? (
                    <button 
                        onClick={() => navigate(`/candidate/contest/${contestId}/solve/${contest.questions[0]._id}`)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
                    >
                        Start Solving
                        <ArrowRight size={20} />
                    </button>
                ) : status === 'ended' ? (
                    <div className="space-y-4">
                        <button 
                            onClick={() => setShowRankings(!showRankings)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                        >
                            {showRankings ? 'Hide Rankings' : 'View Standings'}
                            <Trophy size={20} />
                        </button>
                        
                        {showRankings && (
                            <div className="mt-8 overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/30">
                                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                                    <h3 className="font-bold text-xl flex items-center gap-2">
                                        <Trophy className="text-yellow-500" size={20} />
                                        Final Leaderboard
                                    </h3>
                                    <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">{rankings.length} Participants</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-900/50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                                <th className="px-6 py-4">Rank</th>
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4 text-center">Solved</th>
                                                <th className="px-6 py-4 text-right">Points</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800/50">
                                            {rankings.length > 0 ? rankings.map((r, i) => (
                                                <tr key={i} className={`hover:bg-white/[0.02] transition-colors ${r.user?._id === api.userId ? 'bg-indigo-500/5' : ''}`}>
                                                    <td className="px-6 py-4 font-bold text-gray-400">
                                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold">{r.user?.userName || 'Anonymous'}</span>
                                                        {r.user?._id === api.userId && (
                                                            <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30 uppercase">You</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-mono text-sm">
                                                        {r.solvedProblems?.length || 0} / {contest.questions?.length}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-indigo-400">
                                                        {r.totalPoints || 0}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic">No submissions for this contest yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button 
                        disabled
                        className="w-full bg-gray-800 text-gray-500 py-4 rounded-2xl font-bold text-lg cursor-not-allowed border border-gray-700"
                    >
                        Waiting for Start...
                    </button>
                )}
            </div>
        </div>
    );
};

export default CandidateContestPortal;
