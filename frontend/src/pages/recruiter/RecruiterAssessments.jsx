import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Plus, ClipboardList, Clock, Search, ExternalLink, Trash2 } from 'lucide-react';
import QuestionSelector from '../../components/shared/QuestionSelector';

const RecruiterAssessments = () => {
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [allProblems, setAllProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAssessment, setNewAssessment] = useState({
        jobId: '',
        questions: [],
        duration: 120
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assessRes, jobsRes, problemsRes] = await Promise.all([
                api.get('/assessments/recruiter/all'),
                api.get('/job/get'), 
                api.get('/coding-problems')
            ]);

            if (assessRes.data.success) setAssessments(assessRes.data.assessments);
            if (jobsRes.data.success) setJobs(jobsRes.data.jobs);
            if (problemsRes.data.success) setAllProblems(problemsRes.data.problems);
        } catch (error) {
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/assessments/create', newAssessment);
            if (res.data.success) {
                toast.success("Assessment created successfully");
                setIsModalOpen(false);
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creating assessment");
        }
    };

    const openWindow = async (id) => {
        try {
            const res = await api.post(`/assessments/open-window/${id}`, {});
            if (res.data.success) {
                toast.success("Assessment window opened for 24 hours!");
                fetchData();
            }
        } catch (error) {
            toast.error("Failed to open window");
        }
    };

    const handleDeleteAssessment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this assessment?")) return;
        try {
            const res = await api.delete(`/assessments/${id}`);
            if (res.data.success) {
                toast.success("Assessment deleted successfully");
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete assessment");
        }
    };

    return (
        <div className="p-8 bg-[#09090b] min-h-screen text-white pt-24">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Assessments</h1>
                    <p className="text-gray-400">Create and manage coding tests for your job posts</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl font-bold transition-all"
                >
                    <Plus size={20} />
                    New Assessment
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <p>Loading...</p>
                ) : assessments.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/40 rounded-3xl border border-gray-800 border-dashed">
                        <ClipboardList size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400">No assessments created yet.</p>
                    </div>
                ) : (
                    assessments.map(assessment => (
                        <div key={assessment._id} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-indigo-500/10 p-4 rounded-xl">
                                    <ClipboardList className="text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{assessment.job?.title || "Unknown Job"}</h3>
                                    <p className="text-gray-400 text-sm">{assessment.questions?.length} Questions • {assessment.duration} Minutes</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className={`text-xs px-3 py-1 rounded-full ${
                                        assessment.visibility === 'active' ? 'bg-green-500/10 text-green-400' :
                                        assessment.visibility === 'closed' ? 'bg-red-500/10 text-red-400' :
                                        'bg-yellow-500/10 text-yellow-400'
                                    }`}>
                                        {assessment.visibility.toUpperCase()}
                                    </span>
                                    {assessment.endTime && (
                                        <p className="text-xs text-gray-500 mt-1">Ends: {new Date(assessment.endTime).toLocaleString()}</p>
                                    )}
                                </div>
                                
                                {assessment.visibility === 'draft' && (
                                    <button 
                                        onClick={() => openWindow(assessment._id)}
                                        className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-4 py-2 rounded-lg text-sm font-bold border border-indigo-500/30 transition-all"
                                    >
                                        Open 24h Window
                                    </button>
                                )}
                                
                                <button 
                                    onClick={() => navigate(`/recruiter/assessments/${assessment._id}/reports`)}
                                    className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-all flex items-center gap-2 text-xs font-bold"
                                    title="View candidate reports"
                                >
                                    <ExternalLink size={16} /> Reports
                                </button>

                                <button 
                                    onClick={() => handleDeleteAssessment(assessment._id)}
                                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                    title="Delete Assessment"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto pt-20 custom-scrollbar">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-xl p-8 shadow-2xl mb-20 relative">
                        <h2 className="text-2xl font-bold mb-6">Create Assessment</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Select Job</label>
                                <select 
                                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all"
                                    value={newAssessment.jobId}
                                    onChange={(e) => setNewAssessment({...newAssessment, jobId: e.target.value})}
                                    required
                                >
                                    <option value="">Choose a job post</option>
                                    {jobs.map(job => (
                                        <option key={job._id} value={job._id}>{job.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Duration (Minutes)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all"
                                    value={newAssessment.duration}
                                    onChange={(e) => setNewAssessment({...newAssessment, duration: parseInt(e.target.value)})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Select Questions</label>
                                <QuestionSelector 
                                    allProblems={allProblems.filter(p => p.visibilityStatus === 'private')}
                                    selectedIds={newAssessment.questions}
                                    onSelect={(id) => setNewAssessment({
                                        ...newAssessment, 
                                        questions: [...newAssessment.questions, id]
                                    })}
                                    onRemove={(id) => setNewAssessment({
                                        ...newAssessment, 
                                        questions: newAssessment.questions.filter(qid => qid !== id)
                                    })}
                                    themeColor="indigo"
                                />
                            </div>
                            <div className="flex gap-4 mt-8 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl font-bold transition-all">Cancel</button>
                                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterAssessments;
