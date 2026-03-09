import React, { useEffect, useState } from 'react'

import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button' 
import { useNavigate } from 'react-router-dom' 
import { useDispatch } from 'react-redux' 
import AdminJobsTable from '../../components/recruiter/RecruiterJobsTable'
import useGetAllAdminJobs from '../../hooks/useGetAllAdminJobs'
import { setSearchJobByText } from '../../redux/jobSlice'

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input]);
  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-24 px-4 md:px-8 pb-12 font-sans relative">
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

      <div className='max-w-6xl mx-auto my-10 relative z-10'>
        <div className='flex items-center justify-between my-5'>
          <Input
            className="w-fit bg-gray-800/50 border-gray-700 focus:border-indigo-500 text-white"
            placeholder="Filter by name, role"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={() => navigate("/recruiter/jobs/create")} className="bg-indigo-600 hover:bg-indigo-700 text-white">New Jobs</Button>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
           <AdminJobsTable />
        </div>
      </div>
    </div>
  )
}

export default AdminJobs