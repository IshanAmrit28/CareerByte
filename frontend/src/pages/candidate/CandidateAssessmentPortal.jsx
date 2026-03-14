import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import CodingInterface from './CodingInterface'; // Assuming we can reuse parts or embed it

const CandidateAssessmentPortal = () => {
    const { assessmentId } = useParams();
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isStarted, setIsStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                const res = await api.get(`/assessments/candidate/${assessmentId}`);
                if (res.data.success) {
                    const { assessment: fetchedAssessment, startTime } = res.data;
                    setAssessment(fetchedAssessment);
                    
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
        // Implement auto-submit logic here
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
            const submissions = [];
            const languages = ['cpp', 'java', 'python', 'javascript', 'kotlin', 'php', 'perl', 'golang', 'c'];
            
            for (const q of assessment.questions) {
                let savedCode = "";
                let savedLang = "cpp"; // Default

                for (const lang of languages) {
                    const code = localStorage.getItem(`assessment_${assessmentId}_code_${q._id}_${lang}`);
                    if (code) {
                        savedCode = code;
                        savedLang = lang;
                        break;
                    }
                }
                
                submissions.push({
                    problemId: q._id,
                    code: savedCode,
                    language: savedLang,
                    passedCases: 0,
                    totalCases: 0
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
                                    <li key={i}>{q.title} ({q.difficulty})</li>
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
                    className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all"
                >
                    <CheckCircle size={18} />
                    Submit Final
                </button>
            </div>

            {/* Main Content - Simplified placeholder for the coding interface */}
            <div className="flex-1 flex overflow-hidden">
                {/* Questions Sidebar */}
                <div className="w-80 bg-gray-900/40 border-r border-gray-800 p-6 space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Questions</h3>
                    {assessment?.questions.map((q, i) => (
                        <button 
                            key={i}
                            onClick={() => setCurrentQuestionIndex(i)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all ${
                                currentQuestionIndex === i 
                                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                                : 'bg-gray-800/20 border-gray-800 text-gray-400 hover:border-gray-700'
                            }`}
                        >
                            <span className="text-xs font-bold block mb-1">Problem {i+1}</span>
                            <span className="font-bold block truncate">{q.title}</span>
                        </button>
                    ))}
                </div>

                {/* Integration of CodingInterface would happen here */}
                {/* For now, we'll show a message or redirect to the actual coding page with assessment context */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                assessment?.questions[currentQuestionIndex].difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                                assessment?.questions[currentQuestionIndex].difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                'bg-red-500/10 text-red-400'
                            }`}>
                                {assessment?.questions[currentQuestionIndex].difficulty}
                            </span>
                            <h1 className="text-4xl font-bold mt-4 mb-6">{assessment?.questions[currentQuestionIndex].title}</h1>
                            <div className="prose prose-invert max-w-none text-gray-300">
                                {assessment?.questions[currentQuestionIndex].description}
                            </div>
                        </div>
                        
                        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-10 text-center">
                            <p className="text-indigo-400 font-bold mb-6">Coding Environment Ready</p>
                            <button 
                                onClick={() => navigate(`/candidate/assessment/${assessmentId}/solve/${assessment.questions[currentQuestionIndex]._id}`)}
                                className="bg-indigo-600 hover:bg-indigo-700 px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20"
                            >
                                Launch Code Editor (Ctrl + Alt + E)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateAssessmentPortal;
