import React, { useState } from 'react'

import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setSingleCompany } from '@/redux/companySlice'

const CompanyCreate = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState();
    const dispatch = useDispatch();
    const registerNewCompany = async () => {
        try {
            const res = await axios.post(`${COMPANY_API_END_POINT}/register`, {companyName}, {
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res?.data?.success){
                dispatch(setSingleCompany(res.data.company));
                toast.success(res.data.message);
                const companyId = res?.data?.company?._id;
                navigate(`/admin/companies/${companyId}`);
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className="min-h-screen bg-[#020817] text-white pt-24 px-4 md:px-8 pb-12 font-sans relative flex items-center justify-center">
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

            <div className='max-w-2xl w-full mx-auto relative z-10'>
                <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                    <div className='mb-10'>
                        <h1 className='font-bold text-3xl mb-2'>Your Company Name</h1>
                        <p className='text-gray-400'>What would you like to give your company name? You can change this later.</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-300 font-medium">Company Name</Label>
                        <Input
                            type="text"
                            className="w-full bg-gray-800/50 border-gray-700 focus:border-indigo-500 text-white py-3 rounded-xl"
                            placeholder="JobHunt, Microsoft etc."
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>

                    <div className='flex items-center gap-4 mt-10'>
                        <Button 
                            variant="outline" 
                            onClick={() => navigate("/admin/companies")}
                            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={registerNewCompany}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CompanyCreate