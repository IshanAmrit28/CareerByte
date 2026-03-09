import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { updateStatus } from '../../services/applicationServices';

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
    const { applicants } = useSelector(/** @type {any} */ (store) => store.application || {});

    const statusHandler = async (status, id) => {
        console.log('called');
        try {
            const res = await updateStatus(id, status);
            console.log(res);
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    return (
        <div>
            <Table>
                <TableCaption className="text-gray-400">A list of your recent applied users</TableCaption>
                <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-800/50">
                        <TableHead className="text-gray-300">FullName</TableHead>
                        <TableHead className="text-gray-300">Email</TableHead>
                        <TableHead className="text-gray-300">Contact</TableHead>
                        <TableHead className="text-gray-300">Resume</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300 text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        applicants && applicants?.applications?.map((item) => (
                            <TableRow key={item._id} className="border-gray-800 hover:bg-gray-800/50 text-gray-200">
                                <TableCell className="font-medium">{item?.applicant?.fullname}</TableCell>
                                <TableCell>{item?.applicant?.email}</TableCell>
                                <TableCell>{item?.applicant?.phoneNumber}</TableCell>
                                <TableCell >
                                    {
                                        item.applicant?.profile?.resume ? <a className="text-indigo-400 hover:text-indigo-300 transition-colors underline cursor-pointer" href={item?.applicant?.profile?.resume} target="_blank" rel="noopener noreferrer">{item?.applicant?.profile?.resumeOriginalName}</a> : <span className="text-gray-500">NA</span>
                                    }
                                </TableCell>
                                <TableCell>{item?.applicant.createdAt.split("T")[0]}</TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger>
                                            <MoreHorizontal className="text-gray-400 hover:text-white transition-colors" />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-32 bg-gray-900 border-gray-800 text-gray-200 shadow-xl">
                                            {
                                                shortlistingStatus.map((status, index) => {
                                                    return (
                                                        <div onClick={() => statusHandler(status, item?._id)} key={status} className='flex w-full items-center my-1 p-2 hover:bg-gray-800 rounded-md transition-colors cursor-pointer'>
                                                            <span>{status}</span>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </PopoverContent>
                                    </Popover>

                                </TableCell>

                            </TableRow>
                        ))
                    }

                </TableBody>

            </Table>
        </div>
    )
}

export default ApplicantsTable