// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { Badge } from '../../components/ui/badge'

import { Label } from '../../components/ui/label'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { postJob } from '../../services/jobServices'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import useGetAllCompanies from '../../hooks/useGetAllCompanies'

const PostJob = () => {
    useGetAllCompanies();

    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        position: 0,
        companyId: "",
        expiresAt: ""
    });

    const [assessmentEnabled, setAssessmentEnabled] = useState(false);
    const [assessmentData, setAssessmentData] = useState({
        title: "",
        description: "",
        questions: []
    });

    const [aiInterviewEnabled, setAiInterviewEnabled] = useState(false);
    const [aiInterviewData, setAiInterviewData] = useState({
        title: "",
        description: ""
    });

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading]= useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector(/** @type {any} */ store => store.company);
    const { user } = useSelector(/** @type {any} */ store => store.auth);

    const recruiterCompanyId = user?.company || user?.profile?.company;

    useEffect(() => {
        if (companies && companies.length === 1 && !input.companyId) {
            setInput(prev => ({ ...prev, companyId: companies[0]._id }));
        } else if (companies && companies.length > 0 && recruiterCompanyId && !input.companyId) {
            const recruiterCompany = companies.find(c => c._id === recruiterCompanyId);
            if (recruiterCompany) setInput(prev => ({ ...prev, companyId: recruiterCompany._id }));
        }
    }, [companies, user, input.companyId, recruiterCompanyId]);

    // Fetch questions for recruiter
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const codingService = (await import('../../services/coding.service')).default;
                const res = await codingService.getAllProblems();
                if (res.success) {
                    setQuestions(res.problems);
                }
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            }
        };
        fetchQuestions();
    }, []);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const toggleQuestion = (id) => {
        setAssessmentData(prev => {
            const isSelected = prev.questions.includes(id);
            if (isSelected) {
                return { ...prev, questions: prev.questions.filter(q => q !== id) };
            } else {
                if (prev.questions.length >= 10) {
                    toast.error("Maximum 10 questions allowed.");
                    return prev;
                }
                return { ...prev, questions: [...prev.questions, id] };
            }
        });
    };

    // Calculate live stats
    const selectedQuestionsData = questions.filter(q => assessmentData.questions.includes(q._id));
    const liveStats = selectedQuestionsData.reduce((acc, q) => {
        const difficulty = (q.difficulty || "Medium").toLowerCase();
        let score = 30;
        if (difficulty === "easy") score = 15;
        else if (difficulty === "medium") score = 30;
        else if (difficulty === "hard") score = 45;

        acc.maxScore += score;
        acc.duration += 30;
        return acc;
    }, { maxScore: 0, duration: 0 });

    const submitHandler = async (e) => {
        e.preventDefault();
        const { title, description, requirements, salary, location, jobType, experience, position, companyId, expiresAt } = input;
        
        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId || !expiresAt) {
            toast.error("Please fill in all required fields including expiration date.");
            return;
        }

        if (assessmentEnabled && assessmentData.questions.length === 0) {
            toast.error("Please select at least one question for the assessment.");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...input,
                assessment: {
                    enabled: assessmentEnabled,
                    ...assessmentData
                },
                enableCompanyAIInterview: aiInterviewEnabled,
                aiInterviewTitle: aiInterviewData.title,
                aiInterviewDescription: aiInterviewData.description
            };
            const res = await postJob(payload);
            if(res.data.success){
                toast.success(res.data.message);
                navigate("/recruiter/jobs");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to post job");
        } finally{
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 px-4 md:px-8 pb-12 font-sans relative flex items-start justify-center">
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

            <div className='max-w-4xl w-full mx-auto relative z-10 mt-8'>
                <form onSubmit={submitHandler} className='bg-gray-900/60 border border-gray-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl'>
                    <div className="mb-8 border-b border-gray-800 pb-6">
                        <h1 className="text-3xl font-bold">Post a New Job</h1>
                        <p className="text-gray-400 mt-2">Publish a job for your company.</p>
                    </div>
                
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Job Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
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
                            <Label className="text-gray-300">Requirements (Comma Separated)</Label>
                            <Input
                                type="text"
                                name="requirements"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Salary Range</Label>
                            <Input
                                type="text"
                                name="salary"
                                value={input.salary}
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
                        <div className="space-y-2">
                            <Label className="text-gray-300">Job Type</Label>
                            <Input
                                type="text"
                                name="jobType"
                                value={input.jobType}
                                onChange={changeEventHandler}
                                className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Experience Level</Label>
                            <Input
                                type="text"
                                name="experience"
                                value={input.experience}
                                onChange={changeEventHandler}
                                className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">No of Positions</Label>
                            <Input
                                type="number"
                                name="position"
                                value={input.position}
                                onChange={changeEventHandler}
                                className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Expiration Date</Label>
                            <Input
                                type="date"
                                name="expiresAt"
                                value={input.expiresAt}
                                onChange={changeEventHandler}
                                className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Company</Label>
                            {recruiterCompanyId ? (
                                <div className="p-2.5 bg-gray-800/30 border border-indigo-500/20 rounded-xl flex items-center justify-between">
                                    <span className="text-indigo-400 font-bold">
                                        {companies.find(c => c._id === recruiterCompanyId)?.name || "Loading..."}
                                    </span>
                                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px]">
                                        Assigned
                                    </Badge>
                                </div>
                            ) : companies.length > 0 ? (
                                <Select onValueChange={(value) => setInput({...input, companyId: value})} value={input.companyId}>
                                    <SelectTrigger className="w-full bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500 rounded-xl">
                                        <SelectValue placeholder="Select a Company" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-901 border-gray-800 text-white">
                                        <SelectGroup>
                                            {companies.map((company) => (
                                                <SelectItem key={company._id} value={company._id} className="hover:bg-gray-800 focus:bg-gray-800">
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className='text-red-400 text-sm'>Please register a company first.</p>
                            )}
                        </div>

                        {/* Assessment Section */}
                        <div className="md:col-span-2 mt-8 pt-8 border-t border-gray-800">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">Assessment Setup</h2>
                                    <p className="text-gray-400 text-sm">Enable automatic candidate evaluation.</p>
                                </div>
                                <div 
                                    onClick={() => setAssessmentEnabled(!assessmentEnabled)}
                                    className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${assessmentEnabled ? 'bg-indigo-600' : 'bg-gray-700'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${assessmentEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                                </div>
                            </div>

                            {assessmentEnabled && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Assessment Title</Label>
                                            <Input
                                                type="text"
                                                placeholder="e.g. Technical Screening"
                                                value={assessmentData.title}
                                                onChange={(e) => setAssessmentData({...assessmentData, title: e.target.value})}
                                                className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Description</Label>
                                            <Input
                                                type="text"
                                                placeholder="e.g. 3 coding problems"
                                                value={assessmentData.description}
                                                onChange={(e) => setAssessmentData({...assessmentData, description: e.target.value})}
                                                className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-gray-300">Select Questions (1-10)</Label>
                                        <div className="p-4 bg-gray-800/30 border border-gray-800 rounded-2xl max-h-60 overflow-y-auto custom-scrollbar">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {questions.map(q => (
                                                    <div 
                                                        key={q._id}
                                                        onClick={() => toggleQuestion(q._id)}
                                                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${assessmentData.questions.includes(q._id) ? 'bg-indigo-600/20 border-indigo-500' : 'bg-gray-900/40 border-gray-700 hover:border-gray-500'}`}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm font-medium ${assessmentData.questions.includes(q._id) ? 'text-white' : 'text-gray-300'}`}>{q.title}</span>
                                                            <span className={`text-[10px] uppercase font-bold ${q.difficulty === 'Easy' ? 'text-green-400' : q.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                                                                {q.difficulty}
                                                            </span>
                                                        </div>
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${assessmentData.questions.includes(q._id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-600'}`}>
                                                            {assessmentData.questions.includes(q._id) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Stats */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl text-center">
                                            <p className="text-gray-400 text-xs uppercase font-bold">Selected</p>
                                            <p className="text-2xl font-bold text-white mt-1">{assessmentData.questions.length}</p>
                                        </div>
                                        <div className="bg-purple-600/10 border border-purple-500/20 p-4 rounded-2xl text-center">
                                            <p className="text-gray-400 text-xs uppercase font-bold">Duration</p>
                                            <p className="text-2xl font-bold text-white mt-1">{liveStats.duration}m</p>
                                        </div>
                                        <div className="bg-pink-600/10 border border-pink-500/20 p-4 rounded-2xl text-center">
                                            <p className="text-gray-400 text-xs uppercase font-bold">Max Score</p>
                                            <p className="text-2xl font-bold text-white mt-1">{liveStats.maxScore}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Company AI Interview Section */}
                        <div className="md:col-span-2 mt-8 pt-8 border-t border-gray-800">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">Company Technical AI Interview</h2>
                                    <p className="text-gray-400 text-sm">Automated technical interview for passing candidates.</p>
                                </div>
                                <div 
                                    onClick={() => setAiInterviewEnabled(!aiInterviewEnabled)}
                                    className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${aiInterviewEnabled ? 'bg-indigo-600' : 'bg-gray-700'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${aiInterviewEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                                </div>
                            </div>

                            {aiInterviewEnabled && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Interview Title</Label>
                                            <Input
                                                type="text"
                                                placeholder="e.g. Frontend Architecture Interview"
                                                value={aiInterviewData.title}
                                                onChange={(e) => setAiInterviewData({...aiInterviewData, title: e.target.value})}
                                                className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Description / Focus Areas</Label>
                                            <Input
                                                type="text"
                                                placeholder="e.g. React, Redux, Systems Design"
                                                value={aiInterviewData.description}
                                                onChange={(e) => setAiInterviewData({...aiInterviewData, description: e.target.value})}
                                                className="bg-gray-800/50 border-gray-700 text-white focus:border-indigo-500 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl">
                                        <p className="text-xs text-indigo-300 leading-relaxed uppercase font-bold mb-1">How it works</p>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Candidates meeting the **75% assessment threshold** will unlock this interview. The AI will use your job description, resume, and these focus areas to generate relevant technical questions.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div> 

                    {
                        loading 
                        ? <Button className="w-full mt-8 bg-indigo-600 text-white rounded-xl py-4 hover:bg-indigo-600" disabled> <Loader2 className='mr-2 h-5 w-5 animate-spin' /> Posting... </Button> 
                        : <Button type="submit" disabled={companies.length === 0} className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-4 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50">Post New Job</Button>
                    }
                </form>
            </div>
        </div>
    )
}

export default PostJob