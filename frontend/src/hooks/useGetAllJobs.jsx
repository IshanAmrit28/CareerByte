import { setAllJobs } from '../redux/jobSlice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import api from '../services/api'
import { JOB_API_END_POINT } from '../utils/constant'

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const { filterCriteria } = useSelector((store) => store.job || {});
    
    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                // Constructing query string from filterCriteria
                const params = new URLSearchParams();
                if (filterCriteria?.keyword) params.append('keyword', filterCriteria.keyword);
                if (filterCriteria?.location) params.append('location', filterCriteria.location);
                if (filterCriteria?.company) params.append('company', filterCriteria.company);
                if (filterCriteria?.experience) params.append('experience', filterCriteria.experience);
                if (filterCriteria?.salary) params.append('salary', filterCriteria.salary);
                if (filterCriteria?.isExternal) params.append('source', 'external');

                const res = await api.get(`${JOB_API_END_POINT}/get?${params.toString()}`);
                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllJobs();
    }, [filterCriteria, dispatch])
}

export default useGetAllJobs
