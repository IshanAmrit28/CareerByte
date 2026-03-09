import { setAllJobs } from '../redux/jobSlice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import api from '../services/api'
import { JOB_API_END_POINT } from '../utils/constant'

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const {searchedQuery} = useSelector(/** @type {any} */ store=>store.job);
    useEffect(()=>{
        const fetchAllJobs = async () => {
            try {
                const res = await api.get(`${JOB_API_END_POINT}/get?keyword=${searchedQuery}`);
                if(res.data.success){
                    dispatch(setAllJobs(res.data.jobs));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllJobs();
    },[searchedQuery, dispatch])
}

export default useGetAllJobs
