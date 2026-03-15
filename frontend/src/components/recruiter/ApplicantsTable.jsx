import React, { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal, FileText, ExternalLink } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { updateStatus } from '../../services/applicationServices';
import { Badge } from '../ui/badge';
import { updateApplicantStatus } from '../../redux/applicationSlice';
import DocumentViewer from '../shared/DocumentViewer';

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
    const { applicants } = useSelector(/** @type {any} */ (store) => store.application || {});
    const dispatch = useDispatch();
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedResume, setSelectedResume] = useState({ url: '', name: '' });

    const openResume = (url, name) => {
        setSelectedResume({ url, name });
        setViewerOpen(true);
    };

    const statusHandler = async (status, id) => {
        try {
            const res = await updateStatus(id, status);
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(updateApplicantStatus({ id, status }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    }


    return (
        <div className="rounded-xl border border-gray-800 bg-[#09090b] overflow-hidden">
            <Table>
                <TableCaption className="text-gray-500 pb-4">A list of your recent applied users</TableCaption>
                <TableHeader className="bg-gray-900/50">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-semibold">FullName</TableHead>
                        <TableHead className="text-gray-400 font-semibold">Email</TableHead>
                        <TableHead className="text-gray-400 font-semibold">Assessment %</TableHead>
                        <TableHead className="text-gray-400 font-semibold">Interview Score</TableHead>
                        <TableHead className="text-gray-400 font-semibold">Interview Status</TableHead>
                        <TableHead className="text-gray-400 font-semibold">Status</TableHead>
                        <TableHead className="text-gray-400 font-semibold text-right">Action</TableHead>
                        <TableHead className="text-gray-400 font-semibold">Updated By</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        applicants && applicants?.applications?.map((item) => (
                            <TableRow key={item._id} className="border-gray-800 hover:bg-gray-800/30 text-gray-300 transition-colors">
                                <TableCell className="font-medium text-white">{item?.applicant?.fullname}</TableCell>
                                <TableCell>{item?.applicant?.email}</TableCell>
                                <TableCell>{item?.applicant?.email}</TableCell>
                                <TableCell>
                                    {item?.assessmentPercentage ? (
                                        <span className={`font-bold ${item.assessmentPercentage >= 75 ? 'text-green-400' : 'text-red-400'}`}>
                                            {Math.round(item.assessmentPercentage)}%
                                        </span>
                                    ) : <span className="text-gray-600">--</span>}
                                </TableCell>
                                <TableCell>
                                    {item?.interviewScore ? (
                                        <span className="font-bold text-indigo-400">{item.interviewScore}</span>
                                    ) : <span className="text-gray-600">--</span>}
                                </TableCell>
                                <TableCell>
                                    {item?.interviewStatus === 'locked' && (
                                        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Locked</Badge>
                                    )}
                                    {item?.interviewStatus === 'eligible' && (
                                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Eligible</Badge>
                                    )}
                                    {item?.interviewStatus === 'in_progress' && (
                                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">In Progress</Badge>
                                    )}
                                    {item?.interviewStatus === 'completed' && (
                                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Completed</Badge>
                                    )}
                                    {!item?.interviewStatus && <span className="text-gray-600">--</span>}
                                </TableCell>
                                <TableCell>
                                    {item?.status === "pending" && (
                                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1">
                                            Pending
                                        </Badge>
                                    )}
                                    {item?.status === "accepted" && (
                                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1 font-bold">
                                            Accepted
                                        </Badge>
                                    )}
                                    {item?.status === "rejected" && (
                                        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 px-3 py-1">
                                            Rejected
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>{item?.applicant?.createdAt?.split("T")[0] || "N/A"}</TableCell>
                                <TableCell className="text-right">
                                    <Popover>
                                        <PopoverTrigger>
                                            <div className="p-2 hover:bg-gray-800 rounded-full transition-colors w-max ml-auto">
                                                <MoreHorizontal className="text-gray-400 hover:text-white" />
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-40 bg-gray-900 border-gray-800 text-gray-200 shadow-2xl p-1 rounded-xl">
                                            <div className="px-2 py-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Set Status
                                            </div>
                                            {
                                                shortlistingStatus.map((status) => {
                                                    return (
                                                        <div 
                                                            onClick={() => statusHandler(status, item?._id)} 
                                                            key={status} 
                                                            className={`flex w-full items-center m-0.5 p-2.5 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer text-sm ${status === "Accepted" ? "hover:text-green-400" : "hover:text-red-400"}`}
                                                        >
                                                            <span>{status}</span>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                                <TableCell className="text-gray-400 text-sm">
                                    {item?.status !== "pending" && item?.updatedBy ? (
                                        <span className="flex flex-col">
                                            <span className="text-xs text-gray-500">Modified by</span>
                                            <span className="text-indigo-400 font-medium">{item.updatedBy.fullname || item.updatedBy.userName}</span>
                                        </span>
                                    ) : (
                                        <span className="text-gray-600 italic">--</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
            <DocumentViewer 
                isOpen={viewerOpen} 
                onClose={() => setViewerOpen(false)} 
                fileUrl={selectedResume.url ? (selectedResume.url.startsWith('http') ? selectedResume.url : encodeURI(selectedResume.url)) : ''} 
                fileName={selectedResume.name} 
            />
        </div>
    )
}

export default ApplicantsTable
