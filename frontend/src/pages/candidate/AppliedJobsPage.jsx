import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Briefcase } from 'lucide-react';
import Navbar from '../../components/Navbar';
import AppliedJobTable from '../../components/AppliedJobTable';
import useGetAppliedJobs from '../../hooks/useGetAppliedJobs';

const AppliedJobsPage = () => {
    useGetAppliedJobs();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 px-4 md:px-8 pb-12 font-sans overflow-x-hidden relative">
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[80px] opacity-70 dark:opacity-100 pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[80px] opacity-70 dark:opacity-100 pointer-events-none" />
            
            <div className="max-w-6xl mx-auto relative z-10 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/candidate/profile')}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                            aria-label="Back to Dashboard"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-extrabold flex items-center gap-3">
                                <Briefcase className="w-8 h-8 text-indigo-500" />
                                All Applied Jobs
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Review your job application history and track their status.</p>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-[#111b27]/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl mt-8">
                    <div className="w-full overflow-x-auto">
                        <AppliedJobTable />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppliedJobsPage;
