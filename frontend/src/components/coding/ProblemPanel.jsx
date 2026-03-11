import React from 'react';
import ReactMarkdown from 'react-markdown';

const ProblemPanel = ({ problem }) => {
    if (!problem) return <div className="p-6">Loading problem...</div>;

    const difficultyColor = {
        'Easy': 'text-green-500',
        'Medium': 'text-yellow-500',
        'Hard': 'text-red-500'
    }[problem.difficulty] || 'text-gray-500';

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-y-auto p-6 border-r border-gray-200 dark:border-gray-800">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{problem.title}</h1>
                <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${difficultyColor}`}>{problem.difficulty}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        Time: {problem.timeLimit}s | Memory: {problem.memoryLimit}MB
                    </span>
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                <ReactMarkdown>{problem.description}</ReactMarkdown>
            </div>

            {problem.testCases && problem.testCases.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Example Test Cases</h3>
                    {problem.testCases.map((tc, index) => (
                        <div key={index} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase">Input</span>
                                <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                                    {tc.input}
                                </pre>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase">Output</span>
                                <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                                    {tc.expectedOutput}
                                </pre>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProblemPanel;
