import { setAllAppliedJobs } from "@/redux/jobSlice";
import { MOCK_APPLICATIONS, MOCK_JOBS } from "@/utils/constant"; // Import MOCK_APPLICATIONS and MOCK_JOBS
import axios from "axios"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

const useGetAppliedJobs = () => {
    const dispatch = useDispatch();
    const MOCK_CURRENT_APPLICANT_ID = "67fb029a43745ead342f2ba2"; // Use a mock user ID for filtering

    useEffect(()=>{
        const fetchAppliedJobs = async () => {
            try {
                // const res = await axios.get(`${APPLICATION_API_END_POINT}/get`, {withCredentials:true});
                // MOCK DATA USAGE: Simulate API response by filtering applications for one user and populating job data
                await new Promise(resolve => setTimeout(resolve, 500)); 
                
                const userApplications = MOCK_APPLICATIONS
                    .filter(app => app.applicant === MOCK_CURRENT_APPLICANT_ID)
                    .map(app => {
                        const jobDetails = MOCK_JOBS.find(job => job._id === app.job);
                        // Mock the structure as if the API populated the job object
                        return { 
                            ...app, 
                            job: jobDetails, 
                            applicant: MOCK_CURRENT_APPLICANT_ID // simplified
                        };
                    });

                const mockRes = {
                    data: {
                        success: true,
                        application: userApplications
                    }
                };

                console.log(mockRes.data);
                if(mockRes.data.success){
                    dispatch(setAllAppliedJobs(mockRes.data.application));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAppliedJobs();
    },[dispatch])
};
export default useGetAppliedJobs;
