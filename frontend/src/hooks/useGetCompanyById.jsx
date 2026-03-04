import { setSingleCompany } from '@/redux/companySlice'
import { MOCK_COMPANIES } from '@/utils/constant' // Import MOCK_COMPANIES
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetCompanyById = (companyId) => {
    const dispatch = useDispatch();
    useEffect(()=>{
        const fetchSingleCompany = async () => {
            try {
                // const res = await axios.get(`${COMPANY_API_END_POINT}/get/${companyId}`,{withCredentials:true});
                // MOCK DATA USAGE: Find the company by ID
                await new Promise(resolve => setTimeout(resolve, 500)); 
                const company = MOCK_COMPANIES.find(c => c._id === companyId);
                
                const mockRes = {
                    data: {
                        success: !!company, // Success is true if company is found
                        company: company
                    }
                };

                console.log(mockRes.data.company);
                if(mockRes.data.success){
                    dispatch(setSingleCompany(mockRes.data.company));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleCompany();
    },[companyId, dispatch])
}

export default useGetCompanyById
