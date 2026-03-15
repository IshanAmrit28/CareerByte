import React from 'react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const LatestJobCards = ({job}) => {
    const navigate = useNavigate();
    const { allAppliedJobs } = useSelector(store => store.job);
    const isApplied = allAppliedJobs?.some(application => application.job?._id === job?._id);

    return (
        <div onClick={() => job?.isExternal && job?.applyUrl ? window.open(job.applyUrl, '_blank') : navigate(`/candidate/description/${job._id}`)} className='p-4 rounded-lg shadow-xl bg-[#111b27] border border-slate-800 text-white cursor-pointer relative transition-all hover:border-slate-700'>
            <div className='flex items-center justify-between'>
                <div className='flex-1 pr-4'>
                    <h1 className='font-medium text-sm text-slate-300 truncate'>{job?.company?.name || job?.company}</h1>
                    <p className='text-[11px] text-gray-500'>{job?.location || 'India'}</p>
                </div>
                {isApplied && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-1.5 py-0 text-[10px]">Applied</Badge>
                )}
            </div>
            <div>
                <h1 className='font-bold text-base my-1.5 leading-tight text-white line-clamp-1'>{job?.title}</h1>
                <p className='text-xs text-gray-500 line-clamp-2 leading-relaxed'>{job?.description?.length > 100 ? job?.description?.slice(0, 100) + "..." : job?.description}</p>
            </div>
            <div className='flex flex-wrap items-center gap-1.5 mt-3'>
                {job?.isExternal ? (
                    <Badge className='text-[10px] text-blue-400 font-bold bg-blue-500/5 border-none px-2 py-0' variant="ghost">External • {job?.source}</Badge>
                ) : (
                    <Badge className='text-[10px] text-blue-500 font-bold border-none px-2 py-0' variant="ghost">{job?.position} Positions</Badge>
                )}
                <Badge className='text-[10px] text-[#F83002] font-bold border-none px-2 py-0' variant="ghost">{job?.jobType}</Badge>
                <Badge className='text-[10px] text-[#7209b7] font-bold border-none px-2 py-0' variant="ghost">{job?.salary}</Badge>
            </div>

        </div>
    )
}

export default LatestJobCards