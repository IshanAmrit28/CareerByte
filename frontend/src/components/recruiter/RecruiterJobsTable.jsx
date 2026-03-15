import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, Eye, MoreHorizontal, Power, PowerOff, Trash2 } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../ui/badge'
import { updateJobStatus, deleteJob } from '../../services/jobServices'
import { setAllAdminJobs } from '../../redux/jobSlice'
import { toast } from 'sonner'

const AdminJobsTable = () => { 
    const {allAdminJobs, searchJobByText} = useSelector(/** @type {any} */ (store) => store.job || {});
    const dispatch = useDispatch();
    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const navigate = useNavigate();

    useEffect(()=>{ 
        const filteredJobs = (allAdminJobs || []).filter((job)=>{
            if(!searchJobByText){
                return true;
            };
            return job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) || job?.company?.name?.toLowerCase().includes(searchJobByText.toLowerCase());

        });
        setFilterJobs(filteredJobs);
    },[allAdminJobs,searchJobByText])

    const statusHandler = async (jobId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            const res = await updateJobStatus(jobId, newStatus);
            if (res.data.success) {
                toast.success(res.data.message);
                // Update Redux state
                const updatedJobs = allAdminJobs.map(job => 
                    job._id === jobId ? { ...job, status: newStatus } : job
                );
                dispatch(setAllAdminJobs(updatedJobs));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    }

    const deleteHandler = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;
        
        try {
            const res = await deleteJob(jobId);
            if (res.data.success) {
                toast.success(res.data.message);
                // Update Redux state
                const updatedJobs = allAdminJobs.filter(job => job._id !== jobId);
                dispatch(setAllAdminJobs(updatedJobs));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete job");
        }
    }

    return (
        <div>
            <Table>
                <TableCaption className="text-gray-400">A list of your recent posted jobs</TableCaption>
                <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-800/50">
                        <TableHead className="text-gray-300">Company Name</TableHead>
                        <TableHead className="text-gray-300">Role</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Posted By</TableHead>
                        <TableHead className="text-gray-300 text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        (!filterJobs || filterJobs.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                    No jobs posted yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filterJobs?.map((job) => (
                                <TableRow key={job._id} className="border-gray-800 hover:bg-gray-800/50 text-gray-200">
                                    <TableCell>{job?.company?.name}</TableCell>
                                    <TableCell>{job?.title}</TableCell>
                                    <TableCell>
                                        <Badge className={`${job?.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`} variant="outline">
                                            {job?.status?.toUpperCase() || 'ACTIVE'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{job?.createdAt?.split("T")[0] || "N/A"}</TableCell>
                                    <TableCell className="text-indigo-400 font-medium">
                                        {job?.created_by?.fullname || job?.created_by?.userName || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-right cursor-pointer">
                                        <Popover>
                                            <PopoverTrigger><MoreHorizontal className="text-gray-400 hover:text-white transition-colors" /></PopoverTrigger>
                                            <PopoverContent className="w-40 bg-gray-900 border-gray-800 text-gray-200 shadow-xl">
                                                    <div onClick={() => statusHandler(job._id, job.status || 'active')} className='flex items-center w-full gap-2 cursor-pointer mt-1 hover:bg-gray-800 p-2 rounded-md transition-colors'>
                                                        {job.status === 'inactive' ? (
                                                            <>
                                                                <Power className='w-4 text-green-400'/>
                                                                <span>Activate</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <PowerOff className='w-4 text-red-400'/>
                                                                <span>Deactivate</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div onClick={() => deleteHandler(job._id)} className='flex items-center w-full gap-2 cursor-pointer mt-1 hover:bg-gray-800 p-2 rounded-md transition-colors text-red-400 hover:text-red-300'>
                                                        <Trash2 className='w-4'/>
                                                        <span>Delete</span>
                                                    </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </TableRow>

                            ))
                        )
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AdminJobsTable;
