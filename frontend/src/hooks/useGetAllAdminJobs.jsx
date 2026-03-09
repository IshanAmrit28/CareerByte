import { setAllAdminJobs } from '../redux/jobSlice'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import api from '../services/api'
import { JOB_API_END_POINT } from '../utils/constant'

const useGetAllAdminJobs = () => {
    const dispatch = useDispatch();
    useEffect(()=>{
        const fetchAllAdminJobs = async () => {
            try {
                const res = await api.get(`${JOB_API_END_POINT}/getadminjobs`);
                if(res.data.success){
                    dispatch(setAllAdminJobs(res.data.jobs || []));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllAdminJobs();
    },[])
}

export default useGetAllAdminJobs
