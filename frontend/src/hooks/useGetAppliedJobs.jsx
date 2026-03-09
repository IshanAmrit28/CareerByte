import { setAllAppliedJobs } from "../redux/jobSlice";
import { getAppliedJobs } from "../services/applicationServices";
import { useEffect } from "react"
import { useDispatch } from "react-redux"

const useGetAppliedJobs = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            try {
                const res = await getAppliedJobs();

                if (res.data.success) {
                    dispatch(setAllAppliedJobs(res.data.application));
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchAppliedJobs();
    }, [dispatch])
};
export default useGetAppliedJobs;
