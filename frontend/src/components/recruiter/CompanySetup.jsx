import React, { useEffect, useState } from 'react'

import { Button } from '../ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import useGetCompanyById from '@/hooks/useGetCompanyById'

const CompanySetup = () => {
    const params = useParams();
    useGetCompanyById(params.id);
    const [input, setInput] = useState({
        name: "",
        description: "",
        website: "",
        location: "",
        file: null
    });
    const {singleCompany} = useSelector(store=>store.company);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const changeFileHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", input.name);
        formData.append("description", input.description);
        formData.append("website", input.website);
        formData.append("location", input.location);
        if (input.file) {
            formData.append("file", input.file);
        }
        try {
            setLoading(true);
            const res = await axios.put(`${COMPANY_API_END_POINT}/update/${params.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/companies");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setInput({
            name: singleCompany.name || "",
            description: singleCompany.description || "",
            website: singleCompany.website || "",
            location: singleCompany.location || "",
            file: singleCompany.file || null
        })
    },[singleCompany]);

    return (
        <div className="min-h-screen bg-[#020817] text-white pt-24 px-4 md:px-8 pb-12 font-sans relative flex items-start justify-center">
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

            <div className='max-w-2xl w-full mx-auto relative z-10 mt-8'>
                <form onSubmit={submitHandler} className="bg-gray-900/60 border border-gray-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                    <div className='flex items-center gap-5 mb-8 pb-6 border-b border-gray-800'>
                        <Button 
                            onClick={() => navigate("/admin/companies")} 
                            type="button"
                            variant="outline" 
                            className="flex items-center gap-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Button>
                        <h1 className='font-bold text-2xl'>Company Setup</h1>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Company Name</Label>
                            <Input
                                type="text"
                                name="name"
                                value={input.name}
                                onChange={changeEventHandler}
                                className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Website</Label>
                            <Input
                                type="text"
                                name="website"
                                value={input.website}
                                onChange={changeEventHandler}
                                className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-gray-300">Company Logo</Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    id="logo-upload"
                                    onChange={changeFileHandler}
                                    className="hidden"
                                />
                                <label 
                                    htmlFor="logo-upload"
                                    className="cursor-pointer bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 text-gray-300 transition flex-1 text-center"
                                >
                                    {input.file ? input.file.name : "Choose a new Logo to upload"}
                                </label>
                            </div>
                        </div>
                    </div>
                    {
                        loading 
                        ? <Button className="w-full mt-8 bg-indigo-600 text-white rounded-xl py-4" disabled> <Loader2 className='mr-2 h-5 w-5 animate-spin' /> Saving... </Button> 
                        : <Button type="submit" className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-4 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(79,70,229,0.3)]">Update Company</Button>
                    }
                </form>
            </div>

        </div>
    )
}

export default CompanySetup