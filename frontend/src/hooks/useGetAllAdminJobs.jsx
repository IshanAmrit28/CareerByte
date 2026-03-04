import { setAllAdminJobs } from '@/redux/jobSlice'
import { MOCK_JOBS } from '@/utils/constant' // Import MOCK_JOBS
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetAllAdminJobs = () => {
    const dispatch = useDispatch();
    useEffect(()=>{
        const fetchAllAdminJobs = async () => {
            try {
                // const res = await axios.get(`${JOB_API_END_POINT}/getadminjobs`,{withCredentials:true});
                // MOCK DATA USAGE: Simulate API response delay and success
                await new Promise(resolve => setTimeout(resolve, 500)); 
                const mockRes = {
                    data: {
                        success: true,
                        jobs: MOCK_JOBS.filter(job => job.created_by === '67fb0b92457895ce45ac5fdf') // Filter by a recruiter ID
                    }
                };

                if(mockRes.data.success){
                    dispatch(setAllAdminJobs(mockRes.data.jobs));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllAdminJobs();
    },[])
}

export default useGetAllAdminJobs
