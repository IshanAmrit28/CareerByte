import React, { useEffect } from 'react'

import ApplicantsTable from '../../components/recruiter/ApplicantsTable'
import { useParams } from 'react-router-dom';
import { getApplicants } from '../../services/applicationServices';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '../../redux/applicationSlice';

const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const {applicants} = useSelector(store=>store.application);

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                const res = await getApplicants(params.id);
                dispatch(setAllApplicants(res.data.job));
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllApplicants();
    }, []);
    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 px-4 md:px-8 pb-12 font-sans relative">
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

            <div className='max-w-7xl mx-auto my-10 relative z-10'>
                <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
                    <h1 className='font-bold text-2xl mb-6'>Applicants ({applicants?.applications?.length || 0})</h1>
                    <ApplicantsTable />
                </div>
            </div>
        </div>
    )
}

export default Applicants