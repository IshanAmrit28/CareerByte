import { setSingleCompany } from '../redux/companySlice'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import api from '../services/api'
import { COMPANY_API_END_POINT } from '../utils/constant'

const useGetCompanyById = (companyId) => {
    const dispatch = useDispatch();
    useEffect(()=>{
        const fetchSingleCompany = async () => {
            try {
                const res = await api.get(`${COMPANY_API_END_POINT}/get/${companyId}`);
                console.log(res.data.company);
                if(res.data.success){
                    dispatch(setSingleCompany(res.data.company));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleCompany();
    },[companyId, dispatch])
}

export default useGetCompanyById
