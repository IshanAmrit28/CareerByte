import { setAllJobs } from '@/redux/jobSlice'
import { MOCK_JOBS } from '@/utils/constant' // Import MOCK_JOBS
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const {searchedQuery} = useSelector(store=>store.job);
    useEffect(()=>{
        const fetchAllJobs = async () => {
            try {
                // const res = await axios.get(`${JOB_API_END_POINT}/get?keyword=${searchedQuery}`,{withCredentials:true});
                // MOCK DATA USAGE: Simulate API response and search/filter functionality
                await new Promise(resolve => setTimeout(resolve, 500)); 

                let filteredJobs = MOCK_JOBS;
                if (searchedQuery) {
                    const query = searchedQuery.toLowerCase();
                    filteredJobs = MOCK_JOBS.filter(job => 
                        job.title.toLowerCase().includes(query) || 
                        job.description.toLowerCase().includes(query) ||
                        job.location.toLowerCase().includes(query)
                    );
                }

                const mockRes = {
                    data: {
                        success: true,
                        jobs: filteredJobs
                    }
                };
                
                if(mockRes.data.success){
                    dispatch(setAllJobs(mockRes.data.jobs));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllJobs();
    },[searchedQuery, dispatch]) // Added searchedQuery and dispatch as dependencies
}

export default useGetAllJobs
