import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Clock, AlertTriangle, CheckCircle, Send, Book } from 'lucide-react';
import CodingInterface from './CodingInterface'; // Assuming we can reuse parts or embed it

const CandidateAssessmentPortal = () => {
    const { assessmentId } = useParams();
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isStarted, setIsStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [attempt, setAttempt] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                const res = await api.get(`/assessments/candidate/${assessmentId}`);
                if (res.data.success) {
                    const { assessment: fetchedAssessment, startTime, attempt: fetchedAttempt } = res.data;
                    setAssessment(fetchedAssessment);
                    setAttempt(fetchedAttempt);
                    
                    if (startTime) {
                        const start = new Date(startTime).getTime();
                        const now = new Date().getTime();
                        const durationSec = fetchedAssessment.duration * 60;
                        const elapsed = Math.floor((now - start) / 1000);
                        const remaining = Math.max(0, durationSec - elapsed);
                        
                        setTimeLeft(remaining);
                        setIsStarted(true);
                    } else {
                        setTimeLeft(fetchedAssessment.duration * 60);
                    }
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to load assessment");
                navigate('/candidate/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchAssessment();
    }, [assessmentId, navigate]);

    useEffect(() => {
        if (isStarted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            handleAutoSubmit();
        }
    }, [isStarted, timeLeft]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    const handleAutoSubmit = () => {
        toast.error("Time is up! Submitting your assessment...");
        navigate('/candidate/applied-jobs');
    };

    const handleStart = async () => {
        try {
            const res = await api.post(`/assessments/start/${assessmentId}`);
            if (res.data.success) {
                setIsStarted(true);
            }
        } catch (error) {
            toast.error("Failed to start assessment");
        }
    };

    const handleSubmit = async () => {
        if (!window.confirm("Finish assessment and submit all answers?")) return;

        try {
            const savedSubmissions = JSON.parse(localStorage.getItem(`assessment_${assessmentId}_submissions`) || '{}');
            const submissions = [];
            
            for (const q of assessment.questions) {
                const problemId = q.questionId?._id || q.questionId;
                const submission = savedSubmissions[problemId] || {};
                
                submissions.push({
                    problemId: problemId,
                    code: submission.code || "",
                    language: submission.language || "cpp",
                    passedCases: submission.passedCases || 0,
                    totalCases: submission.totalCases || 0
                });
            }

            const res = await api.post('/assessments/submit', { 
                assessmentId, 
                submissions 
            });

            if (res.data.success) {
                toast.success("Assessment submitted successfully!");
                navigate('/candidate/applied-jobs');
            }
        } catch (error) {
            toast.error("Failed to submit assessment");
        }
    };

    const getQuestionStatus = (qId, difficulty) => {
        if (!attempt || !attempt.submissions) return { status: 'unattempted', score: '0.00' };
        const sub = attempt.submissions.find(s => s.problem?.toString() === qId?.toString());
        if (!sub) return { status: 'unattempted', score: '0.00' };
        
        // The backend now provides weighted scores directly.
        // We simply display the score as provided to ensure consistency.
        // Any submission (even partial) is considered 'solved' for progress tracking
        return { 
            status: 'solved', 
            score: `${sub.score}.00` 
        };
    };

    if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="animate-spin h-10 w-10 border-t-2 border-indigo-500 rounded-full"/></div>;

    if (!isStarted) {
        return (
            <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
                <div className="max-w-2xl w-full bg-gray-900/60 border border-gray-800 rounded-3xl p-10 backdrop-blur-md shadow-2xl">
                    <h1 className="text-3xl font-bold mb-4">{assessment?.job?.title} - Coding Assessment</h1>
                    <div className="space-y-6 text-gray-400">
                        <div className="flex items-center gap-4 bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                            <Clock className="text-indigo-400" />
                            <div>
                                <p className="text-white font-bold">Duration: {assessment?.duration} Minutes</p>
                                <p className="text-sm">Once started, the timer cannot be paused.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/10">
                            <AlertTriangle className="text-yellow-400" />
                            <div>
                                <p className="text-white font-bold">Rules</p>
                                <p className="text-sm">Avoid switching tabs. Your session is monitored.</p>
                            </div>
                        </div>
                        <div className="pt-6">
                            <h3 className="text-white font-bold mb-2">Questions</h3>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {assessment?.questions.map((q, i) => (
                                    <li key={i}>{q.questionId?.title || q.title} ({q.questionId?.difficulty || q.difficulty})</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <button 
                        onClick={handleStart}
                        className="w-full mt-10 bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/20"
                    >
                        Start Assessment
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
            {/* Header */}
            <div className="h-20 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-8 flex justify-between items-center z-50">
                <div className="flex items-center gap-6">
                    <h2 className="text-xl font-bold truncate max-w-md">{assessment?.job?.title} Assessment</h2>
                    <div className="bg-gray-800 px-4 py-2 rounded-xl flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Time Remaining</span>
                        <span className={`font-mono text-xl ${timeLeft < 300 ? 'text-red-500' : 'text-indigo-400'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={handleSubmit} 
                    className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-600/10"
                >
                    <CheckCircle size={18} />
                    Submit Final Assessment
                </button>
            </div>

            {/* Questions Grid */}
            <div className="flex-1 overflow-y-auto p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Assessment Dashboard</h1>
                            <p className="text-gray-400 text-lg">Select a problem to begin coding. Your progress is saved automatically.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest block mb-2">Completion</span>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-indigo-400">{attempt?.submissions?.length || 0} / {assessment?.questions?.length}</span>
                                <span className="text-gray-500">Solved</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assessment?.questions.map((q, i) => {
                            const difficulty = q.questionId?.difficulty || q.difficulty;
                            const { status, score } = getQuestionStatus(q.questionId?._id || q.questionId, difficulty);
                            
                            return (
                                <button 
                                    key={i}
                                    onClick={() => navigate(`/candidate/assessment/${assessmentId}/solve/${q._id}`)}
                                    className="group relative bg-gray-900/40 border border-gray-800 hover:border-indigo-500/50 rounded-3xl p-8 text-left transition-all hover:shadow-2xl hover:shadow-indigo-500/5 overflow-hidden"
                                >
                                    {/* Deco Background */}
                                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all opacity-0 group-hover:opacity-100" />
                                    
                                    <div className="relative flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Problem {i + 1}</span>
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                                    difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                                                    difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-red-500/10 text-red-400'
                                                }`}>
                                                    {difficulty}
                                                </span>
                                            </div>
                                            
                                            <div className={`px-3 py-1 rounded-xl flex items-center gap-2 border transition-all ${
                                                status === 'solved' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 
                                                status === 'in-progress' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                                'bg-gray-500/10 border-gray-800 text-gray-500'
                                            }`}>
                                                {status === 'solved' ? <CheckCircle size={12} /> : 
                                                 status === 'in-progress' ? <Clock size={12} /> : 
                                                 <Book size={12} />}
                                                <span className="text-[10px] font-extrabold uppercase tracking-widest">
                                                    {status === 'unattempted' ? 'Unsolved' : status.replace('-', ' ')}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold mb-4 line-clamp-2 min-h-[3.5rem] group-hover:text-indigo-400 transition-colors">
                                            {q.questionId?.title || q.title}
                                        </h3>

                                        <div className="mt-auto pt-6 border-t border-gray-800/50 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Your Score</span>
                                                <span className="font-mono text-lg font-bold text-white">
                                                    {score || '0.00'}
                                                </span>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center group-hover:bg-indigo-600 transition-all">
                                                <Send size={16} className="text-gray-400 group-hover:text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateAssessmentPortal;
