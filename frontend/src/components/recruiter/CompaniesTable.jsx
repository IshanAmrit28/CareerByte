import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, MoreHorizontal } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const CompaniesTable = () => {
    const { companies, searchCompanyByText } = useSelector(/** @type {any} */ (store) => store.company || {});
    const [filterCompany, setFilterCompany] = useState(companies);
    const navigate = useNavigate();
    useEffect(()=>{
        const filteredCompany = (companies || []).filter((company)=>{
            if(!searchCompanyByText){
                return true
            };
            return company?.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());

        });
        setFilterCompany(filteredCompany);
    },[companies,searchCompanyByText])
    return (
        <div>
            <Table>
                <TableCaption className="text-gray-400">A list of your recent registered companies</TableCaption>
                <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-800/50">
                        <TableHead className="text-gray-300">Logo</TableHead>
                        <TableHead className="text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300 text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        (!filterCompany || filterCompany.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                    No companies created yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filterCompany?.map((company) => (
                                <TableRow key={company._id} className="border-gray-800 hover:bg-gray-800/50 text-gray-200">
                                    <TableCell>
                                        <Avatar className="h-10 w-10 border border-gray-700">
                                            <AvatarImage src={company.logo} className="object-cover"/>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{company.name}</TableCell>
                                    <TableCell>{company.createdAt.split("T")[0]}</TableCell>
                                    <TableCell className="text-right cursor-pointer">
                                        <Popover>
                                            <PopoverTrigger><MoreHorizontal className="text-gray-400 hover:text-white transition-colors" /></PopoverTrigger>
                                            <PopoverContent className="w-32 bg-gray-900 border-gray-800 text-gray-200 shadow-xl">
                                                <div onClick={()=> navigate(`/recruiter/companies/${company._id}`)} className='flex items-center gap-2 w-full cursor-pointer hover:bg-gray-800 p-2 rounded-md transition-colors'>
                                                    <Edit2 className='w-4 text-indigo-400' />
                                                    <span>Edit</span>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </TableRow>
                            ))
                        )
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default CompaniesTable