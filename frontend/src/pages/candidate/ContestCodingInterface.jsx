import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Send, Settings, Book, Terminal, Clock, Trophy } from 'lucide-react';
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
    php: "<?php\n\n// solve here\n\n?>" ,
    perl: "use strict;\nuse warnings;\n\n# solve here\n",
    golang: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    // solve here\n}",
    c: "#include <stdio.h>\n\nint main() {\n    // solve here\n    return 0;\n}"
};

const ContestCodingInterface = () => {
    const { contestId, problemId } = useParams();
    const navigate = useNavigate();

    const [contest, setContest] = useState(null);
    const [rankings, setRankings] = useState([]);
    const [problem, setProblem] = useState(null);
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState('');
    const [results, setResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('problem'); // 'problem', 'rankings', 'submissions'

    // Load contest and timer
    useEffect(() => {
        const fetchContestData = async () => {
            try {
                const res = await api.get(`/contests/${contestId}`);
                if (res.data.success) {
                    setContest(res.data.contest);
                    
                    const end = new Date(res.data.contest.endTime).getTime();
                    const now = new Date().getTime();
                    const remaining = Math.max(0, Math.floor((end - now) / 1000));
                    setTimeLeft(remaining);

                    if (remaining === 0) {
                        toast.error("Contest has ended");
                        navigate(`/candidate/contest/${contestId}`);
                    }
                }
            } catch (err) {
                toast.error("Failed to load contest");
                navigate('/candidate/contests');
            }
        };
        fetchContestData();
    }, [contestId, navigate]);

    // Fetch Rankings
    useEffect(() => {
        const fetchRankings = async () => {
            if (activeTab === 'rankings') {
                try {
                    const res = await api.get(`/contests/${contestId}/rankings`);
                    if (res.data.success) {
                        setRankings(res.data.rankings);
                    }
                } catch (err) {
                    console.error("Failed to fetch rankings");
                }
            }
        };
        fetchRankings();
        const interval = setInterval(fetchRankings, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, [contestId, activeTab]);

    // Load problem
    useEffect(() => {
        const fetchProblem = async () => {
            setLoading(true);
            try {
                const data = await codingService.getProblemById(problemId);
                setProblem(data.problem);
                
                const savedCode = localStorage.getItem(`contest_${contestId}_code_${problemId}_${language}`);
                const templateCode = data.problem.templates?.[language] || defaultTemplates[language];
                setCode(savedCode || templateCode);
            } catch (err) {
                toast.error("Failed to load problem");
            } finally {
                setLoading(false);
            }
        };
        if (problemId) fetchProblem();
    }, [problemId, contestId, language]);

    // Reset state when problem changes to prevent leakage
    useEffect(() => {
        setCode('');
        setResults(null);
        setError(null);
    }, [problemId]);

    // Timer effect
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            toast.error("Contest ended!");
            navigate(`/candidate/contest/${contestId}`);
        }
    }, [timeLeft, contestId, navigate]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
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
            // Include contestId in submission
            const response = await api.post("/execute/submit", { 
                problemId, 
                language, 
                code,
                contestId 
            });
            
            const data = response.data;
            const submissionResults = data.submission.results;
            setResults(submissionResults);
            
            const passedCount = submissionResults.filter(r => r.status === 'Accepted').length;
            const totalCount = submissionResults.length;

            if (passedCount === totalCount) {
                toast.success(`ACCEPTED! All ${totalCount} test cases passed!`);
            } else {
                toast(`PARTIAL ACCEPTED: ${passedCount}/${totalCount} test cases passed.`, { icon: '⚠️' });
            }
        } catch (err) {
            setError(err.message || "Submission failed");
            toast.error("Submission failed");
        } finally {
            setIsRunning(false);
        }
    };

    if (loading || !contest) return <div className="h-screen bg-[#0a0a0a] flex items-center justify-center font-bold text-indigo-500">Initializing Contest Environment...</div>;

    const ProblemListView = () => (
        <div className="flex flex-col gap-2 p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Problems</h3>
            {contest.questions.map((q, i) => (
                <button
                    key={q._id}
                    onClick={() => {
                        setActiveTab('problem');
                        navigate(`/candidate/contest/${contestId}/solve/${q._id}`);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                        problemId === q._id 
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' 
                        : 'bg-gray-800/40 border-gray-700 hover:border-gray-600 text-gray-400'
                    }`}
                >
                   <div className="flex justify-between items-center">
                        <span className="font-bold truncate pr-2">{i+1}. {q.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                            q.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                        }`}>{q.difficulty}</span>
                   </div>
                </button>
            ))}
        </div>
    );

    const RankingView = () => (
        <div className="flex flex-col h-full bg-[#0a0a0a]">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">Live Standings</h2>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Updates every 30s</div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-gray-500 border-b border-gray-800 sticky top-0 bg-[#0a0a0a]">
                        <tr>
                            <th className="px-6 py-4 font-bold">Rank</th>
                            <th className="px-6 py-4 font-bold">User</th>
                            <th className="px-6 py-4 font-bold text-center">Score</th>
                            <th className="px-6 py-4 font-bold text-center">Solved</th>
                            <th className="px-6 py-4 font-bold text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankings.map((rank, i) => (
                            <tr key={rank._id} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold">
                                    {i === 0 ? <Trophy className="text-yellow-400 w-5 h-5" /> : i + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 border border-indigo-500/30">
                                            {rank.user.userName[0].toUpperCase()}
                                        </div>
                                        <span className="font-bold">{rank.user.userName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-lg font-bold">
                                        {rank.totalPoints}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-gray-400">
                                    {rank.solvedProblems.length} / {contest.questions.length}
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-gray-500">
                                    {Math.floor(rank.totalTime / 60)}m {rank.totalTime % 60}s
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden">
            {/* Immersive Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-[#121212] z-20">
                <div className="flex items-center gap-6 w-1/3">
                    <button 
                        onClick={() => navigate(`/candidate/contests`)}
                        className="p-2 hover:bg-gray-800 rounded-xl transition-all text-gray-400 hover:text-white border border-gray-700/50"
                        title="Back to Dashboard"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Contest</span>
                        <h1 className="font-bold text-sm truncate max-w-[200px]">{contest?.title}</h1>
                    </div>

                    <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span className={`font-mono font-bold text-xs ${timeLeft < 300 ? 'text-red-500' : 'text-indigo-400'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-gray-900 font-bold p-1 rounded-xl border border-gray-800">
                    <button 
                        onClick={() => setActiveTab('problem')}
                        className={`px-6 py-2 rounded-lg text-xs transition-all ${activeTab === 'problem' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        Problem
                    </button>
                    <button 
                        onClick={() => setActiveTab('rankings')}
                        className={`px-6 py-2 rounded-lg text-xs transition-all ${activeTab === 'rankings' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        Ranking
                    </button>
                </div>

                <div className="flex items-center justify-end gap-3 w-1/3">
                    <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
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
                        <option value="c">C</option>
                    </select>

                    <div className="h-8 w-px bg-gray-800 mx-1" />

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleRun}
                            disabled={isRunning || activeTab !== 'problem'}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-xl text-xs font-bold transition-all border border-gray-700"
                        >
                            <Play className="w-3.5 h-3.5" /> Run
                        </button>

                        <button 
                            onClick={handleSubmit}
                            disabled={isRunning || !problem || activeTab !== 'problem'}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-500/20"
                        >
                            <Send className="w-3.5 h-3.5" /> Submit
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-hidden flex">
                {/* Fixed Side Sidebar for problem list */}
                <div className="w-72 bg-[#0d0d0d] border-r border-gray-800 overflow-y-auto">
                    <ProblemListView />
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {activeTab === 'problem' ? (
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
                                            theme="vs-dark"
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
                    ) : (
                        <RankingView />
                    )}
                </div>
            </main>
        </div>
    );
};

export default ContestCodingInterface;
