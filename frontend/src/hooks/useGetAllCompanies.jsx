import { setCompanies} from '@/redux/companySlice'
import { MOCK_COMPANIES} from '@/utils/constant' // Import MOCK_COMPANIES
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetAllCompanies = () => {
    const dispatch = useDispatch();
    useEffect(()=>{
        const fetchCompanies = async () => {
            try {
                // const res = await axios.get(`${COMPANY_API_END_POINT}/get`,{withCredentials:true});
                // MOCK DATA USAGE: Simulate API response
                await new Promise(resolve => setTimeout(resolve, 500)); 
                const mockRes = {
                    data: {
                        success: true,
                        companies: MOCK_COMPANIES
                    }
                };

                console.log('called');
                if(mockRes.data.success){
                    dispatch(setCompanies(mockRes.data.companies));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchCompanies();
    },[])
}

export default useGetAllCompanies
