import React, { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { useNavigate, useParams } from 'react-router-dom';
import { Play, ClipboardCheck, Briefcase, ArrowLeft } from 'lucide-react';
import { applyJob } from '../../services/applicationServices';
import { getJobById } from '../../services/jobServices';
import { setSingleJob } from '../../redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const JobDescription = ({ jobId: propJobId }) => {
    const navigate = useNavigate();
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);

    const params = useParams();
    const jobId = propJobId || params.id;
    const dispatch = useDispatch();

    const applyJobHandler = async () => {
        try {
            const res = await applyJob(jobId);

            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] }
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await getJobById(jobId);
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => application.applicant === user?._id))
                }
            } catch (error) {
                console.log(error);
            }
        }
        if (jobId) fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    if (!jobId) {
        return (
            <div className='flex flex-col items-center justify-center h-full text-slate-500'>
                <Briefcase className='w-16 h-16 mb-4 opacity-20' />
                <h2 className='text-xl font-semibold text-slate-400'>Select a job to view details</h2>
                <p className='text-sm'>Browse the list on the left to see more information.</p>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#09090b] text-white pt-24 pb-20 px-4 md:px-8 font-sans overflow-x-hidden relative'>
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[80px] opacity-70 pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[80px] opacity-70 pointer-events-none" />

            <div className='max-w-7xl mx-auto relative z-10'>
            <Button 
                onClick={() => navigate('/candidate/jobs')} 
                variant="ghost" 
                className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800/50 mb-6 transition-all duration-300"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Jobs
            </Button>

            {/* Hero Section */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-8'>
                <div>
                    <h1 className='font-extrabold text-3xl text-white tracking-tight'>{singleJob?.title}</h1>
                    <div className='flex flex-wrap items-center gap-3 mt-4'>
                        <Badge className='bg-blue-500/10 text-blue-400 border-none px-3 py-1' variant="outline">{singleJob?.postion} Positions</Badge>
                        <Badge className='bg-orange-500/10 text-orange-400 border-none px-3 py-1' variant="outline">{singleJob?.jobType}</Badge>
                        <Badge className='bg-purple-500/10 text-purple-400 border-none px-3 py-1' variant="outline">{singleJob?.salary} LPA</Badge>
                    </div>
                </div>
                <Button
                    onClick={isApplied ? null : applyJobHandler}
                    disabled={isApplied}
                    className={`rounded-xl px-8 h-12 text-md font-bold transition-all duration-300 ${isApplied ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'}`}>
                    {isApplied ? 'Already Applied' : 'Apply Now'}
                </Button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10'>
                <div className='lg:col-span-2 space-y-10'>
                    {/* Information Grid */}
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4 bg-slate-900/40 p-8 rounded-3xl border border-slate-800/50'>
                        <div className='space-y-1'>
                            <p className='text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider'>Role</p>
                            <p className='text-slate-200 font-medium'>{singleJob?.title}</p>
                        </div>
                        <div className='space-y-1'>
                            <p className='text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider'>Experience</p>
                            <p className='text-slate-200 font-medium'>{singleJob?.experience} Years</p>
                        </div>
                        <div className='space-y-1'>
                            <p className='text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider'>Location</p>
                            <p className='text-slate-200 font-medium'>{singleJob?.location || 'Remote/India'}</p>
                        </div>
                        <div className='space-y-1'>
                            <p className='text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider'>Salary</p>
                            <p className='text-slate-200 font-medium'>{singleJob?.salary} LPA</p>
                        </div>
                        <div className='space-y-1'>
                            <p className='text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider'>Applicants</p>
                            <p className='text-slate-200 font-medium'>{singleJob?.applications?.length || 0}</p>
                        </div>
                        <div className='space-y-1'>
                            <p className='text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider'>Posted Date</p>
                            <p className='text-slate-200 font-medium'>{singleJob?.createdAt ? singleJob.createdAt.split("T")[0] : "Recently"}</p>
                        </div>
                    </div>

                    {/* Job Description */}
                    <div className='space-y-4'>
                        <h2 className='text-xl font-bold text-white flex items-center gap-2'>
                            <div className='w-1.5 h-6 bg-blue-500 rounded-full'></div>
                            Job Description
                        </h2>
                        <div className='text-slate-300 leading-relaxed bg-[#111b27] p-8 rounded-3xl border border-slate-800 shadow-xl'>
                            {singleJob?.description || "No description provided for this role."}
                        </div>
                    </div>
                </div>

                {/* Sidebar Section */}
                <div className='space-y-6'>
                    {/* Assessment Card */}
                    {isApplied && singleJob?.assessment && (
                        <div className='sticky top-24 p-6 bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border border-indigo-500/30 rounded-3xl backdrop-blur-md shadow-2xl'>
                            <div className='space-y-6'>
                                <div className='space-y-2'>
                                    <h3 className='text-xl font-bold text-indigo-300 flex items-center gap-2'>
                                        <ClipboardCheck className="w-5 h-5" />
                                        Coding Assessment
                                    </h3>
                                    <p className='text-sm text-slate-400'>
                                        Complete the technical evaluation to move to the next stage.
                                    </p>
                                </div>
                                
                                <div className='grid grid-cols-2 gap-3 py-4 border-y border-slate-800/50'>
                                    <div className='flex items-center gap-2 text-slate-300'>
                                        <div className='p-2 bg-slate-800 rounded-lg'>
                                            <Play className="w-3 h-3 text-indigo-400" />
                                        </div>
                                        <span className='text-xs font-medium'>{singleJob.assessment.duration} Mins</span>
                                    </div>
                                    <div className='flex items-center gap-2 text-slate-300'>
                                        <div className='p-2 bg-slate-800 rounded-lg'>
                                            <ClipboardCheck className="w-3 h-3 text-indigo-400" />
                                        </div>
                                        <span className='text-xs font-medium'>Coding</span>
                                    </div>
                                </div>

                                {singleJob?.isAssessmentCompleted ? (
                                    <div className='flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-bold text-sm w-full'>
                                        <ClipboardCheck className="w-4 h-4" />
                                        Assessment Completed
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => navigate(`/candidate/assessment/${singleJob.assessment._id}`)}
                                        className='w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-95'
                                    >
                                        <Play className="fill-current w-5 h-5" />
                                        Start Assessment
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
    )
}

export default JobDescription