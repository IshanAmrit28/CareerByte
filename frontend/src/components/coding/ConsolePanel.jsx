import React from 'react';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Clock, HardDrive } from 'lucide-react';

const ConsolePanel = ({ results, isRunning, error }) => {
    return (
        <div className="flex flex-col h-full min-h-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Console Output</span>
                {isRunning && (
                    <div className="flex items-center gap-2 text-blue-500 text-sm">
                        <Loader2 className="animate-spin w-4 h-4" />
                        Running...
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg mb-4">
                        <p className="font-bold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Error
                        </p>
                        <p className="mt-1 leading-relaxed">{error}</p>
                    </div>
                )}

                {results && results.length > 0 ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-between shadow-sm">
                            <span className="font-bold text-gray-700 dark:text-gray-300">Execution Summary</span>
                            <span className={`font-bold px-3 py-1 rounded-full text-xs ${results.every(r => r.status === 'Accepted') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {results.filter(r => r.status === 'Accepted').length} / {results.length} Passed
                            </span>
                        </div>
                        {results.map((res, index) => (
                            <div key={index} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        {res.status === 'Accepted' ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500" />
                                        )}
                                        <span className={`font-bold ${res.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>
                                            {res.isCustom ? "Custom Test Case" : (res.isHidden ? `Hidden Test Case ${index + 1}` : `Test Case ${index + 1}`)}: {res.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {res.time}s
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <HardDrive className="w-3 h-3" /> {res.memory}KB
                                        </span>
                                    </div>
                                </div>

                                {res.isHidden && !res.isCustom ? (
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded text-center text-gray-500 italic text-xs border border-dashed border-gray-300 dark:border-gray-700">
                                        Hidden test case execution details are private.
                                    </div>
                                ) : (
                                    <>
                                        {res.compile_output && (
                                            <div className="mb-3">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Compilation Output</span>
                                                <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs text-red-400 overflow-x-auto whitespace-pre-wrap">
                                                    {res.compile_output}
                                                </pre>
                                            </div>
                                        )}

                                        {res.stderr && (
                                            <div className="mb-3">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Error Output</span>
                                                <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs text-red-400 overflow-x-auto whitespace-pre-wrap">
                                                    {res.stderr}
                                                </pre>
                                            </div>
                                        )}

                                        {res.stdout && (
                                            <div>
                                                <span className="text-xs font-bold text-gray-400 uppercase">Standard Output</span>
                                                <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap leading-tight">
                                                    {res.stdout}
                                                </pre>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : !isRunning && !error && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 italic">
                        <Loader2 className="w-8 h-8 opacity-20 mb-2" />
                        Run your code to see results here
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsolePanel;
