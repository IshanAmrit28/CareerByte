import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Send, Settings, Book, Terminal, Save } from 'lucide-react';
import { toast } from 'sonner';

import ProblemPanel from '../../components/coding/ProblemPanel';
import CodeEditor from '../../components/coding/CodeEditor';
import ConsolePanel from '../../components/coding/ConsolePanel';
import codingService from '../../services/coding.service';

const CodingInterface = () => {
    const { problemId } = useParams();
    const navigate = useNavigate();

    const [problem, setProblem] = useState(null);
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState('');
    const [results, setResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState('vs-dark');

    // Load problem and initial code
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const data = await codingService.getProblemById(problemId);
                setProblem(data.problem);
                
                // Set initial template
                const savedCode = localStorage.getItem(`code_${problemId}_${language}`);
                setCode(savedCode || data.problem.templates[language]);
            } catch (err) {
                toast.error("Failed to load problem");
                setError(err.message);
            }
        };
        fetchProblem();
    }, [problemId]);

    // Update code template when language changes
    useEffect(() => {
        if (problem) {
            const savedCode = localStorage.getItem(`code_${problemId}_${language}`);
            setCode(savedCode || problem.templates[language]);
        }
    }, [language, problem]);

    // Autosave functionality
    useEffect(() => {
        if (code && problemId) {
            const timer = setTimeout(() => {
                localStorage.setItem(`code_${problemId}_${language}`, code);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [code, problemId, language]);

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
            toast.error("Execution error");
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsRunning(true);
        setResults(null);
        setError(null);
        try {
            const data = await codingService.submitCode(problemId, language, code);
            setResults(data.submission.results);
            if (data.submission.status === 'Accepted') {
                toast.success("All test cases passed! Solution accepted.");
            } else {
                toast.error(`Solution rejected: ${data.submission.status}`);
            }
        } catch (err) {
            setError(err.message || "Submission failed");
            toast.error("Submission error");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 overflow-hidden">
            {/* Header */}
            <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Book className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-sm truncate max-w-[200px]">
                            {problem?.title || "Loading..."}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-800 border-none rounded-md px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                    </select>

                    <select 
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-800 border-none rounded-md px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                        <option value="vs-dark">Dark Theme</option>
                        <option value="light">Light Theme</option>
                    </select>

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

                    <button 
                        onClick={handleRun}
                        disabled={isRunning || !problem}
                        className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 rounded-md text-xs font-bold transition-all"
                    >
                        <Play className="w-3.5 h-3.5" /> Run
                    </button>

                    <button 
                        onClick={handleSubmit}
                        disabled={isRunning || !problem}
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
                    >
                        <Send className="w-3.5 h-3.5" /> Submit
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left: Problem Panel */}
                <div className="w-[40%] h-full shrink-0">
                    <ProblemPanel problem={problem} />
                </div>

                {/* Right: Editor and Console */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                    <div className="flex-1 overflow-hidden">
                        <CodeEditor 
                            language={language}
                            value={code}
                            onChange={setCode}
                            theme={theme}
                        />
                    </div>
                    
                    <div className="h-[30%] shrink-0">
                        <ConsolePanel 
                            results={results}
                            isRunning={isRunning}
                            error={error}
                        />
                    </div>
                </div>
            </main>
            
            {/* Footer / Status Bar */}
            <footer className="h-6 flex items-center justify-between px-4 bg-gray-100 dark:bg-[#121212] border-t border-gray-200 dark:border-gray-800 text-[10px] text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                        <Settings className="w-3 h-3" /> Ready
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Terminal className="w-3 h-3" /> Judge0 Connected
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                        <Save className="w-3 h-3" /> Autosaved
                    </span>
                    <span>UTF-8</span>
                    <span>Line 1, Col 1</span>
                </div>
            </footer>
        </div>
    );
};

export default CodingInterface;
