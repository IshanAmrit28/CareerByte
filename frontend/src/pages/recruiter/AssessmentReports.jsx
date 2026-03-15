import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { User, Award, CheckCircle, XCircle, Code, ChevronRight, X, FileText, Check, X as RejectIcon } from 'lucide-react';

const CodeModal = ({ isOpen, onClose, candidate, submissions }) => {
    const [activeSubIdx, setActiveSubIdx] = useState(0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10">
            <div className="bg-[#121212] border border-gray-800 rounded-3xl w-full max-w-6xl h-full flex flex-col overflow-hidden shadow-2xl">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-800 bg-[#18181b]">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                            <Code size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{candidate?.userName}'s Solutions</h2>
                            <p className="text-gray-400 text-sm">Reviewing submitted code and performance</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 hover:bg-gray-800 rounded-2xl text-gray-400 transition-all border border-gray-800 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Problem Sidebar */}
                    <div className="w-80 border-r border-gray-800 bg-[#0c0c0e] overflow-y-auto p-4 space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold px-4 mb-4">Questions</p>
                        {submissions?.map((sub, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveSubIdx(idx)}
                                className={`w-full text-left p-4 rounded-2xl transition-all border flex flex-col gap-1 ${
                                    activeSubIdx === idx 
                                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                                    : 'border-transparent hover:bg-white/5 text-gray-400 hover:text-white'
                                }`}
                            >
                                <span className="text-xs font-bold uppercase opacity-50">Problem {idx + 1}</span>
                                <span className="font-bold truncate">{sub.problem?.title || "Unknown Problem"}</span>
                                <span className={`text-[10px] self-start px-2 py-0.5 rounded-full mt-1 ${sub.isNotSubmitted ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-gray-400'}`}>
                                    {sub.isNotSubmitted ? 'No Submission' : `${sub.score} / ${sub.totalTestCases} Passed`}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Code Display Area */}
                    <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
                        {submissions?.[activeSubIdx] ? (
                            <>
                                <div className="px-6 py-3 bg-black/20 flex items-center justify-between border-b border-gray-800">
                                    <span className="text-xs font-mono text-indigo-400 uppercase font-bold tracking-widest">
                                        Language: {submissions[activeSubIdx].language || "N/A"}
                                    </span>
                                    {!submissions[activeSubIdx].isNotSubmitted && (
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${submissions[activeSubIdx].score === submissions[activeSubIdx].totalTestCases ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                {submissions[activeSubIdx].score === submissions[activeSubIdx].totalTestCases ? 'Full Success' : 'Partial Implementation'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-800">
                                    <pre className="text-gray-300">
                                        <code>{submissions[activeSubIdx].code || "// No code submitted for this problem"}</code>
                                    </pre>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-800 m-8 rounded-3xl">
                                <Code size={48} className="opacity-20 mb-4" />
                                <p>Select a problem to view submission</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AssessmentReports = () => {
    const { assessmentId } = useParams();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchReports = async () => {
        try {
            const res = await api.get(`/assessments/reports/${assessmentId}`);
            if (res.data.success) setReports(res.data.reports);
        } catch (error) {
            toast.error("Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [assessmentId]);

    const handleStatusUpdate = async (applicationId, status) => {
        if (!window.confirm(`Are you sure you want to set this candidate as ${status}?`)) return;
        
        try {
            const res = await api.post(`/application/status/${applicationId}/update`, { status });
            if (res.data.success) {
                toast.success(`Candidate ${status === 'accepted' ? 'Accepted' : 'Rejected'} successfully`);
                fetchReports(); // Refresh results
            }
        } catch (error) {
            toast.error("Failed to update candidate status");
        }
    };

    return (
        <div className="p-8 bg-[#09090b] min-h-screen text-white pt-24 pb-20">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Assessment Results</h1>
                        <p className="text-gray-400">Evaluate performance and manage candidate applications</p>
                    </div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-3 hover:bg-gray-800 rounded-2xl text-gray-400 transition-all border border-gray-800 hover:text-white group"
                        title="Back to Assessments"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/40 rounded-3xl border border-gray-800 border-dashed">
                        <User size={48} className="mx-auto text-gray-700 mb-4" />
                        <p className="text-gray-500 font-medium">No candidate submissions yet for this assessment.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {reports.map((report, idx) => (
                                <div key={report._id} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex items-center justify-between gap-4 hover:bg-gray-900/80 transition-all border-l-4 border-l-transparent group">
                                    <div className="flex items-center gap-4 min-w-[250px]">
                                        <div className="h-10 w-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 font-bold text-lg border border-indigo-500/20">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold flex items-center gap-2">
                                                {report.candidate?.userName}
                                                {report.applicationStatus === 'accepted' && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-black border border-green-500/20">Selected</span>}
                                                {report.applicationStatus === 'rejected' && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-black border border-red-500/20">Rejected</span>}
                                            </h3>
                                            <p className="text-gray-400 text-xs font-medium">{report.candidate?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex items-center justify-around gap-4">
                                        <div className="text-center">
                                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-0.5 opacity-60">Coding</p>
                                            <p className="text-lg font-black text-indigo-400">
                                                {report.totalScore} 
                                                <span className="text-gray-600 text-[10px] font-bold ml-1">/ {report.maxPossibleScore}</span>
                                            </p>
                                        </div>
                                        <div className="text-center border-l border-gray-800/50 pl-4">
                                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-0.5 opacity-60">Interview</p>
                                            <p className="text-lg font-black text-purple-400">
                                                {report.interviewScore || 0}
                                                <span className="text-gray-600 text-[10px] font-bold ml-1">/ 100</span>
                                            </p>
                                        </div>
                                        <div className="text-center border-l border-gray-800/50 pl-4">
                                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-0.5 opacity-60">Total</p>
                                            <p className="text-xl font-black text-white">
                                                {report.totalScore + (report.interviewScore || 0)}
                                                <span className="text-gray-600 text-[10px] font-bold ml-1">/ {report.maxPossibleScore + 100}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Resume Button */}
                                        {report.candidate?.profile?.resume && (
                                            <button 
                                                onClick={() => window.open(report.candidate.profile.resume, '_blank')}
                                                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all border border-gray-700"
                                                title="View Resume"
                                            >
                                                <FileText size={16} />
                                            </button>
                                        )}
                                        
                                        {/* Code Review Button */}
                                        <button 
                                            onClick={() => {
                                                setSelectedReport(report);
                                                setIsModalOpen(true);
                                            }}
                                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg font-bold transition-all shadow-lg shadow-indigo-500/10 text-xs"
                                        >
                                            <Code size={16} /> View Code
                                        </button>
                                        
                                        {/* Interview Report Link (if applicable) */}
                                        {report.interviewReportId && (
                                            <button 
                                                onClick={() => navigate(`/recruiter/report/${report.interviewReportId}`)}
                                                className="flex items-center gap-1.5 bg-purple-600/10 border border-purple-500/30 text-purple-400 hover:bg-purple-600 hover:text-white px-3 py-2 rounded-lg font-bold transition-all text-xs"
                                                title="View Technical Interview Report"
                                            >
                                                <FileText size={16} /> Report
                                            </button>
                                        )}

                                    {/* Status Actions */}
                                    {report.applicationId && (
                                        <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-800">
                                            <button 
                                                onClick={() => handleStatusUpdate(report.applicationId, 'accepted')}
                                                className={`p-2.5 rounded-xl transition-all border ${report.applicationStatus === 'accepted' ? 'bg-green-500 text-white border-green-500' : 'bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border-green-500/20'}`}
                                                title="Accept Candidate"
                                            >
                                                <Check size={20} />
                                            </button>
                                            <button 
                                                onClick={() => handleStatusUpdate(report.applicationId, 'rejected')}
                                                className={`p-2.5 rounded-xl transition-all border ${report.applicationStatus === 'rejected' ? 'bg-red-500 text-white border-red-500' : 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border-red-500/20'}`}
                                                title="Reject Candidate"
                                            >
                                                <RejectIcon size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CodeModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                candidate={selectedReport?.candidate}
                submissions={selectedReport?.submissions}
            />
        </div>
    );
};

export default AssessmentReports;
