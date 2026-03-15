import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Edit3, Calendar, Clock, Trophy } from 'lucide-react';
import QuestionSelector from '../../components/shared/QuestionSelector';

const AdminContests = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newContest, setNewContest] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        questions: []
    });
    const [allProblems, setAllProblems] = useState([]);

    useEffect(() => {
        fetchContests();
        fetchProblems();
    }, []);

    const fetchContests = async () => {
        try {
            const res = await api.get('/contests/all');
            if (res.data.success) setContests(res.data.contests);
        } catch (error) {
            toast.error("Failed to fetch contests");
        } finally {
            setLoading(false);
        }
    };

    const fetchProblems = async () => {
        try {
            const res = await api.get('/coding-problems');
            if (res.data.success) setAllProblems(res.data.problems);
        } catch (error) {
            toast.error("Failed to fetch problems");
        }
    };

    const handleCreateContest = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/contests/create', newContest);
            if (res.data.success) {
                toast.success("Contest created!");
                setIsModalOpen(false);
                fetchContests();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creating contest");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const res = await api.delete(`/contests/delete/${id}`);
            if (res.data.success) {
                toast.success("Contest deleted");
                fetchContests();
            }
        } catch (error) {
            toast.error("Failed to delete contest");
        }
    };

    return (
        <div className="p-8 bg-black/40 min-h-screen text-white font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Weekly Contests
                    </h1>
                    <p className="text-gray-400 mt-2">Manage and schedule weekly coding challenges</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-purple-500/20"
                >
                    <Plus size={20} />
                    Create Contest
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contests.map((contest) => (
                        <div key={contest._id} className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-purple-500/10 p-3 rounded-lg">
                                    <Trophy className="text-purple-500" />
                                </div>
                                <div className="flex gap-2">
                                    <button className="text-gray-400 hover:text-blue-400 p-1"><Edit3 size={18} /></button>
                                    <button onClick={() => handleDelete(contest._id)} className="text-gray-400 hover:text-red-400 p-1"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{contest.title}</h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{contest.description}</p>
                            
                            <div className="space-y-3 border-t border-gray-800 pt-4">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Calendar size={14} className="text-blue-400" />
                                    <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Clock size={14} className="text-purple-400" />
                                    <span>{new Date(contest.startTime).toLocaleTimeString()} - {new Date(contest.endTime).toLocaleTimeString()}</span>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-400">
                                    {contest.questions?.length || 0} Questions
                                </span>
                                <span className={`text-xs px-3 py-1 rounded-full ${
                                    new Date() < new Date(contest.startTime) ? 'bg-blue-500/10 text-blue-400' :
                                    new Date() > new Date(contest.endTime) ? 'bg-red-500/10 text-red-400' :
                                    'bg-green-500/10 text-green-400'
                                }`}>
                                    {new Date() < new Date(contest.startTime) ? 'Upcoming' :
                                     new Date() > new Date(contest.endTime) ? 'Ended' : 'Active'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal - Simplified for now */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto pt-20 custom-scrollbar">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl p-8 shadow-2xl mb-20 relative">
                        <h2 className="text-2xl font-bold mb-6">Create New Contest</h2>
                        <form onSubmit={handleCreateContest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-all"
                                    value={newContest.title}
                                    onChange={(e) => setNewContest({...newContest, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea 
                                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-all h-24"
                                    value={newContest.description}
                                    onChange={(e) => setNewContest({...newContest, description: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Start Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required
                                        className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-all"
                                        value={newContest.startTime}
                                        onChange={(e) => setNewContest({...newContest, startTime: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">End Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required
                                        className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-all"
                                        value={newContest.endTime}
                                        onChange={(e) => setNewContest({...newContest, endTime: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Select Questions</label>
                                <QuestionSelector 
                                    allProblems={allProblems.filter(p => p.visibilityStatus === 'contest')}
                                    selectedIds={newContest.questions}
                                    onSelect={(id) => setNewContest({
                                        ...newContest, 
                                        questions: [...newContest.questions, id]
                                    })}
                                    onRemove={(id) => setNewContest({
                                        ...newContest, 
                                        questions: newContest.questions.filter(qid => qid !== id)
                                    })}
                                    themeColor="purple"
                                />
                            </div>
                            
                            <div className="flex gap-4 mt-8">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminContests;
