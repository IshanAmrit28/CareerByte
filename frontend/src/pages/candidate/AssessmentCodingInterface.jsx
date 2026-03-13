import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Send, Settings, Book, Terminal, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import ProblemPanel from '../../components/coding/ProblemPanel';
import CodeEditor from '../../components/coding/CodeEditor';
import ConsolePanel from '../../components/coding/ConsolePanel';
import codingService from '../../services/coding.service';
import api from '../../services/api';

const defaultTemplates = {
    cpp: "#include <iostream>\n\nint main() {\n    // solve here\n    return 0;\n}",
    java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // solve here\n    }\n}",
    python: "def solve():\n    # solve here\n    pass\n\nif __name__ == \"__main__\":\n    solve()",
    javascript: "function solve() {\n    // solve here\n}\n\nsolve();",
    kotlin: "import java.util.*\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    // solve here\n}",
    php: "<?php\n\n// solve here\n\n?>",
    perl: "use strict;\nuse warnings;\n\n# solve here\n",
    golang: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    // solve here\n}"
};

const AssessmentCodingInterface = () => {
    const { assessmentId, problemId } = useParams();
    const navigate = useNavigate();

    const [assessment, setAssessment] = useState(null);
    const [problem, setProblem] = useState(null);
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState('');
    const [results, setResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState('vs-dark');
    const [timeLeft, setTimeLeft] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load assessment and timer
    useEffect(() => {
        const fetchAssessmentData = async () => {
            try {
                const res = await api.get(`/assessments/candidate/${assessmentId}`);
                if (res.data.success) {
                    setAssessment(res.data.assessment);
                    
                    if (res.data.startTime) {
                        const start = new Date(res.data.startTime).getTime();
                        const now = new Date().getTime();
                        const durationSec = res.data.assessment.duration * 60;
                        const elapsed = Math.floor((now - start) / 1000);
                        const remaining = Math.max(0, durationSec - elapsed);
                        setTimeLeft(remaining);
                    } else {
                        toast.error("Assessment not started");
                        navigate(`/candidate/assessment/${assessmentId}`);
                    }
                }
            } catch (err) {
                toast.error("Failed to load assessment");
                navigate('/candidate/applied-jobs');
            }
        };
        fetchAssessmentData();
    }, [assessmentId, navigate]);

    // Load problem
    useEffect(() => {
        const fetchProblem = async () => {
            setLoading(true);
            try {
                const data = await codingService.getProblemById(problemId);
                setProblem(data.problem);
            } catch (err) {
                toast.error("Failed to load problem");
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [problemId]);

    // Update code template when language changes
    useEffect(() => {
        // Only update if we have the problem object AND it matches the current URL ID
        if (problem && problem._id === problemId) {
            const savedCode = localStorage.getItem(`assessment_${assessmentId}_code_${problemId}_${language}`);
            const templateCode = problem.templates?.[language] || defaultTemplates[language];
            setCode(savedCode || templateCode);
        }
    }, [language, problem, assessmentId, problemId]);
    
    // Reset state when problem changes to prevent leakage
    useEffect(() => {
        setCode('');
        setResults(null);
        setError(null);
    }, [problemId]);

    const handleReset = () => {
        if (window.confirm("Reset editor to default template? Your current progress for this language will be lost.")) {
            const templateCode = problem?.templates?.[language] || defaultTemplates[language];
            setCode(templateCode);
            localStorage.removeItem(`assessment_${assessmentId}_code_${problemId}_${language}`);
        }
    };

    // Timer effect
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            handleAutoSubmit();
        }
    }, [timeLeft]);

    // Autosave
    useEffect(() => {
        if (code && problemId) {
            const timer = setTimeout(() => {
                localStorage.setItem(`assessment_${assessmentId}_code_${problemId}_${language}`, code);
                console.log(`Saved to assessment_${assessmentId}_code_${problemId}_${language}`);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [code, problemId, language, assessmentId]); // Restored language dependency

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

    const handleRun = async () => {
        setIsRunning(true);
        setResults(null);
        setError(null);
        try {
            const data = await codingService.runCode(problemId, language, code);
            setResults(data.results);
            if (data.results.every(r => r.status === 'Accepted')) {
                toast.success("Sample test cases passed!");
            } else {
                toast.error("Some test cases failed");
            }
        } catch (err) {
            setError(err.message || "Execution failed");
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsRunning(true);
        setResults(null);
        setError(null);
        try {
            // Use submitCode to run all test cases (including hidden/private ones)
            const data = await codingService.submitCode(problemId, language, code);
            
            // Filter and display results
            const submissionResults = data.submission.results;
            setResults(submissionResults);
            
            const passedCount = submissionResults.filter(r => r.status === 'Accepted').length;
            const totalCount = submissionResults.length;

            if (passedCount === totalCount) {
                toast.success(`Solution Submitted: All ${totalCount} test cases passed!`);
            } else {
                toast(`Solution Submitted: ${passedCount}/${totalCount} test cases passed.`, { icon: '⚠️' });
            }

            // Save individual submission to local storage for final collection
            const submissions = JSON.parse(localStorage.getItem(`assessment_${assessmentId}_submissions`) || '{}');
            submissions[problemId] = {
                problemId,
                code,
                language,
                passedCases: passedCount,
                totalCases: totalCount
            };
            localStorage.setItem(`assessment_${assessmentId}_submissions`, JSON.stringify(submissions));

        } catch (err) {
            setError(err.message || "Submission failed");
            toast.error("Submission failed");
        } finally {
            setIsRunning(false);
        }
    };

    const handleNext = () => {
        const currentIndex = assessment.questions.findIndex(q => q._id === problemId);
        if (currentIndex < assessment.questions.length - 1) {
            const nextProblemId = assessment.questions[currentIndex + 1]._id;
            navigate(`/candidate/assessment/${assessmentId}/solve/${nextProblemId}`);
        } else {
            if (window.confirm("This is the last question. Finish and submit final?")) {
                navigate(`/candidate/assessment/${assessmentId}`);
            }
        }
    };

    const handleFinalSubmit = async () => {
        if (!window.confirm("Are you sure you want to finish the assessment? This will submit all your solutions.")) return;
        
        try {
            const savedSubmissions = JSON.parse(localStorage.getItem(`assessment_${assessmentId}_submissions`) || '{}');
            const submissionsArray = Object.values(savedSubmissions);
            
            if (submissionsArray.length === 0) {
                if (!window.confirm("You haven't submitted any problems yet. Submit empty assessment?")) return;
            }

            const res = await api.post('/assessments/submit', {
                assessmentId,
                submissions: submissionsArray
            });

            if (res.data.success) {
                toast.success("Assessment submitted successfully!");
                localStorage.removeItem(`assessment_${assessmentId}_submissions`);
                navigate('/candidate/applied-jobs');
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit final assessment");
        }
    };

    if (loading || !assessment) return <div className="h-screen bg-[#0a0a0a] flex items-center justify-center font-bold text-indigo-500">Loading Environment...</div>;

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-[#121212] z-20">
                <div className="flex items-center gap-4 w-1/3">
                    <button 
                        onClick={() => navigate(`/candidate/assessment/${assessmentId}`)}
                        className="p-2 hover:bg-gray-800 rounded-xl transition-all text-gray-400 hover:text-white border border-gray-700/50"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Problem</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm truncate max-w-[150px]">
                                {problem?.title}
                            </span>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-gray-800 mx-1" />

                    {/* Persistent Timer */}
                    <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span className={`font-mono font-bold text-xs ${timeLeft < 300 ? 'text-red-500' : 'text-indigo-400'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                <div className="flex-1" />

                <div className="flex items-center justify-end gap-3 w-1/3">
                    <select 
                        value={language}
                        onChange={(e) => {
                            const newLang = e.target.value;
                            // Explicitly save current code for current language before switching
                            if (code && problemId) {
                                localStorage.setItem(`assessment_${assessmentId}_code_${problemId}_${language}`, code);
                            }
                            setLanguage(newLang);
                        }}
                        className="bg-gray-800 border-none rounded-lg px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="kotlin">Kotlin</option>
                        <option value="php">PHP</option>
                        <option value="perl">Perl</option>
                        <option value="golang">Go</option>
                    </select>

                    <div className="h-8 w-px bg-gray-800 mx-1" />

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleReset}
                            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-red-400 transition-colors border border-gray-700/50"
                            title="Reset to Template"
                        >
                            <Settings size={14} className="animate-pulse" />
                        </button>

                        <div className="h-6 w-px bg-gray-800 mx-1" />

                        <button 
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-xl text-xs font-bold transition-all border border-gray-700"
                        >
                            <Play className="w-3.5 h-3.5" /> Run
                        </button>

                        <button 
                            onClick={handleSubmit}
                            disabled={isRunning || !problem}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-xl text-xs font-bold transition-all"
                        >
                            <Send className="w-3.5 h-3.5" /> Submit
                        </button>

                        <button 
                            onClick={handleNext}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Send className="w-3.5 h-3.5" /> Next
                        </button>

                        <div className="h-6 w-px bg-gray-800 mx-1" />

                        <button 
                            onClick={handleFinalSubmit}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-500/20"
                            title="Finish and submit entire assessment"
                        >
                            <CheckCircle className="w-3.5 h-3.5" /> Finish
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal" className="h-full w-full">
                    <Panel defaultSize={40} minSize={20} className="h-full flex flex-col min-h-0">
                        <ProblemPanel problem={problem} />
                    </Panel>
                    <PanelResizeHandle className="w-1.5 bg-gray-800 hover:bg-indigo-500 transition-colors cursor-col-resize" />
                    <Panel defaultSize={60} minSize={30} className="h-full flex flex-col min-h-0 bg-[#1e1e1e]">
                        <PanelGroup direction="vertical" className="h-full w-full">
                            <Panel defaultSize={70} className="h-full flex flex-col min-h-0">
                                <CodeEditor 
                                    key={`${problemId}-${language}`} // Force refresh to prevent sticky editor
                                    language={language}
                                    value={code}
                                    onChange={setCode}
                                    theme={theme}
                                />
                            </Panel>
                            <PanelResizeHandle className="h-1.5 bg-gray-800 hover:bg-indigo-500 transition-colors cursor-row-resize" />
                            <Panel defaultSize={30} className="h-full flex flex-col min-h-0">
                                <div className="h-full overflow-hidden flex flex-col">
                                    <div className="px-4 py-1 bg-gray-800/50 border-b border-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <Terminal size={12} /> Console
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <ConsolePanel results={results} isRunning={isRunning} error={error} />
                                    </div>
                                </div>
                            </Panel>
                        </PanelGroup>
                    </Panel>
                </PanelGroup>
            </main>
            
        </div>
    );
};

export default AssessmentCodingInterface;
