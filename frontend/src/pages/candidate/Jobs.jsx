import React from 'react'
import { Briefcase } from 'lucide-react'
import FilterCard from '../../components/FilterCard'
import Job from '../../components/Job';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import useGetAllJobs from '../../hooks/useGetAllJobs';
import useGetAppliedJobs from '../../hooks/useGetAppliedJobs';

const Jobs = () => {
    useGetAllJobs();
    useGetAppliedJobs();
    const { allJobs = [] } = useSelector(store => store.job || {});

    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 px-4 md:px-8 pb-12 font-sans overflow-x-hidden relative">
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[80px] opacity-70 pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[80px] opacity-70 pointer-events-none" />
            
            <div className='max-w-[1400px] mx-auto relative z-10'>
                <div className='flex flex-row gap-8'>
                    {/* Left Column: Filter (30%) */}
                    <div className='w-[30%] min-w-[280px] max-w-[350px] flex-shrink-0'>
                        <div className="sticky top-24">
                            <FilterCard />
                        </div>
                    </div>

                    {/* Right Column: Jobs (70%) */}
                    <div className='flex-1'>
                        {
                            allJobs.length <= 0 ? (
                                <div className='flex flex-col items-center justify-center p-20 text-slate-500 bg-[#111b27]/50 rounded-3xl border border-slate-800/50 text-center'>
                                    <Briefcase className="w-16 h-16 mb-4 opacity-10" />
                                    <h2 className='text-xl font-semibold text-slate-400'>No jobs found</h2>
                                    <p className='text-sm mt-2'>Try adjusting your filters or search criteria.</p>
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10'>
                                    {
                                        allJobs.map((job) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                key={job?._id}>
                                                <Job job={job} />
                                            </motion.div>
                                        ))
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Jobs