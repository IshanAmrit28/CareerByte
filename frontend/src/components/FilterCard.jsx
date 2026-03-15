import React, { useState, useEffect } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useDispatch, useSelector } from 'react-redux'
import { setFilterCriteria, clearFilters } from '../redux/jobSlice'
import { X, MapPin, Briefcase, Building2 } from 'lucide-react'
import api from '@/services/api'
import { JOB_API_END_POINT } from '@/utils/constant'

const FilterCard = () => {
    const dispatch = useDispatch();
    const { filterCriteria = { location: "", company: "", salary: "" } } = useSelector(store => store.job || {});
    
    const [locations, setLocations] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                setLoading(true);
                const [locationRes, companyRes] = await Promise.all([
                    api.get(`${JOB_API_END_POINT}/filters/locations`),
                    api.get(`${JOB_API_END_POINT}/filters/companies`)
                ]);

                if (locationRes.data.success) {
                    setLocations(locationRes.data.locations);
                }
                if (companyRes.data.success) {
                    setCompanies(companyRes.data.companies);
                }
            } catch (error) {
                console.error("Error fetching filter options:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFilters();
    }, []);

    const handleSelectChange = (field, value) => {
        // 'all' is our custom clear value
        if (value === 'all') {
            dispatch(setFilterCriteria({ [field]: "" }));
        } else {
            dispatch(setFilterCriteria({ [field]: value }));
        }
    }

    const handleClearAll = () => {
        dispatch(clearFilters());
    }

    const hasFilters = filterCriteria ? Object.values(filterCriteria).some(v => v !== "") : false;

    if (loading) {
        return (
            <div className='w-full bg-[#111b27] p-5 rounded-2xl border border-slate-800 text-white shadow-2xl animate-pulse'>
                <div className="h-6 bg-slate-800 rounded w-1/2 mb-6"></div>
                <div className="space-y-4">
                    <div className="h-10 bg-slate-800 rounded w-full"></div>
                    <div className="h-10 bg-slate-800 rounded w-full"></div>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full bg-[#111b27] p-5 rounded-2xl border border-slate-800 text-white shadow-2xl sticky top-24'>
            <div className='flex items-center justify-between mb-5'>
                <h1 className='font-bold text-lg tracking-tight'>Filter Jobs</h1>
                {hasFilters && (
                    <button 
                        onClick={handleClearAll}
                        className='text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors'
                    >
                        <X size={12} /> Clear all
                    </button>
                )}
            </div>

            <div className='space-y-4'>
                {/* Source Toggle */}
                <div className='flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-700'>
                    <span className='text-[12px] font-medium text-slate-300'>External Jobs</span>
                    <button 
                        onClick={() => handleSelectChange('isExternal', !filterCriteria.isExternal)}
                        className={`w-9 h-5 rounded-full transition-colors relative ${filterCriteria.isExternal ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${filterCriteria.isExternal ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Location Filter */}
                <div className='space-y-1.5'>
                    <label className='text-[12px] font-medium text-slate-300 flex items-center gap-2'>
                        <MapPin size={14} className="text-blue-500" /> Location
                    </label>
                    <Select value={filterCriteria.location || ""} onValueChange={(value) => handleSelectChange('location', value)}>
                        <SelectTrigger className="w-full h-9 bg-slate-900 border-slate-700 text-slate-200 focus:ring-blue-500 text-[12px]">
                            <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                            <SelectGroup>
                                <SelectItem value="all" className="focus:bg-slate-800 focus:text-white text-[12px]">All Locations</SelectItem>
                                {locations.map((loc) => (
                                    <SelectItem key={loc} value={loc} className="focus:bg-slate-800 focus:text-white text-[12px]">{loc}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                {/* Company Filter */}
                <div className='space-y-1.5'>
                    <label className='text-[12px] font-medium text-slate-300 flex items-center gap-2'>
                        <Building2 size={14} className="text-green-500" /> Company
                    </label>
                    <Select value={filterCriteria.company || ""} onValueChange={(value) => handleSelectChange('company', value)}>
                        <SelectTrigger className="w-full h-9 bg-slate-900 border-slate-700 text-slate-200 focus:ring-green-500 text-[12px]">
                            <SelectValue placeholder="All Companies" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                            <SelectGroup>
                                <SelectItem value="all" className="focus:bg-slate-800 focus:text-white text-[12px]">All Companies</SelectItem>
                                {companies.map((comp) => (
                                    <SelectItem key={comp._id} value={comp._id} className="focus:bg-slate-800 focus:text-white text-[12px]">{comp.name}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}

export default FilterCard