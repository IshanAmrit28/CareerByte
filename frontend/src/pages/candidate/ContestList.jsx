import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Trophy, Calendar, Clock, ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContestList = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const res = await api.get('/contests/visible');
                if (res.data.success) {
                    const allContests = res.data.contests;
                    setContests(allContests);
                }
            } catch (error) {
                toast.error("Failed to fetch contests");
            } finally {
                setLoading(false);
            }
        };
        fetchContests();
    }, []);

    const getStatus = (start, end) => {
        const now = new Date();
        if (now < new Date(start)) return { label: 'Upcoming', class: 'bg-blue-500/10 text-blue-400', active: false, type: 'upcoming' };
        if (now > new Date(end)) return { label: 'Ended', class: 'bg-red-500/10 text-red-400', active: false, type: 'past' };
        return { label: 'Active', class: 'bg-green-500/10 text-green-400', active: true, type: 'active' };
    };

    const activeAndUpcoming = contests.filter(c => {
        const status = getStatus(c.startTime, c.endTime);
        return status.type === 'active' || status.type === 'upcoming';
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    const pastContests = contests.filter(c => {
        const status = getStatus(c.startTime, c.endTime);
        return status.type === 'past';
    }).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    return (
        <div className="p-8 bg-[#09090b] min-h-screen text-white pt-24">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-3xl font-extrabold mb-4">Weekly Contests</h1>
                    <p className="text-gray-400 text-lg">Challenge yourself and climb the leaderboard</p>
                </div>

                {loading ? (
                    <div className="flex gap-6 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 flex-1 bg-gray-900/50 rounded-3xl" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* Current & Upcoming Section */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Clock className="text-indigo-500" />
                                Current & Upcoming
                            </h2>
                            {activeAndUpcoming.length === 0 ? (
                                <div className="text-center py-12 bg-gray-900/20 rounded-3xl border border-gray-800 border-dashed">
                                    <p className="text-gray-500">No ongoing or upcoming contests. Check back later!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {activeAndUpcoming.map((contest) => {
                                        const status = getStatus(contest.startTime, contest.endTime);
                                        return (
                                            <div key={contest._id} className="group relative bg-gray-900/40 border border-gray-800 rounded-3xl p-8 hover:bg-gray-900/60 transition-all duration-300 overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all" />
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:scale-110 transition-all duration-500">
                                                        <Trophy className="text-indigo-500" />
                                                    </div>
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border border-current/20 ${status.class}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-bold mb-3 group-hover:text-indigo-400 transition-colors">{contest.title}</h3>
                                                <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">{contest.description}</p>
                                                <div className="space-y-3 mb-8">
                                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                                        <Calendar size={16} className="text-indigo-500" />
                                                        <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                                        <Clock size={16} className="text-indigo-500" />
                                                        <span>{new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(contest.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                                {status.type === 'active' ? (
                                                    <Link to={`/candidate/contest/${contest._id}`} className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-bold transition-all transform hover:translate-y-[-2px] shadow-xl shadow-indigo-600/20">
                                                        Enter Contest <ArrowRight size={18} />
                                                    </Link>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2 w-full bg-gray-800 text-gray-400 py-4 rounded-2xl font-bold cursor-not-allowed border border-gray-700">
                                                        <Lock size={18} /> Starts Soon
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Past Contests Section */}
                        {pastContests.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <Trophy className="text-gray-500" />
                                    Past Contests
                                </h2>
                                <div className="space-y-4">
                                    {pastContests.map((contest) => (
                                        <div key={contest._id} className="group flex flex-col md:flex-row items-center justify-between bg-gray-900/30 border border-gray-800/50 rounded-2xl p-6 hover:bg-gray-900/50 transition-all duration-300 gap-6">
                                            <div className="flex items-center gap-6 flex-1">
                                                <div className="p-3 bg-gray-800 rounded-xl group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
                                                    <Trophy size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold mb-1 group-hover:text-white transition-colors">{contest.title}</h3>
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={14} />
                                                            <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={14} />
                                                            <span>{new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <Link 
                                                to={`/candidate/contest/${contest._id}`}
                                                className="w-full md:w-auto px-8 py-3 bg-gray-800 hover:bg-indigo-600 text-gray-300 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                                            >
                                                View Results
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestList;
