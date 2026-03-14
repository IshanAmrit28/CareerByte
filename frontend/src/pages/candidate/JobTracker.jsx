import { useState, useEffect } from 'react'
import { Plus, Briefcase, Calendar, MapPin, DollarSign, Trash2, Edit2, Filter, X } from 'lucide-react'
import api from '../../services/api'

import Button from '../../components/Button'
import './JobTracker.css'

function JobTracker() {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingJob, setEditingJob] = useState(null)
    const [filterStatus, setFilterStatus] = useState('all')
    const [formData, setFormData] = useState({
        companyName: '',
        roleTitle: '',
        location: '',
        salary: '',
        status: 'Applied',
        dateApplied: new Date().toISOString().split('T')[0],
        link: '',
        notes: ''
    })

    const fetchJobs = async () => {
        try {
            const res = await api.get('/job-tracker');
            setJobs(res.data)
        } catch (error) {
            console.error("Failed to fetch jobs", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    const statuses = ['Applied', 'Interview Scheduled', 'Interview Completed', 'Offer', 'Rejected']
    const statusColors = {
        'Applied': '#4facfe',
        'Interview Scheduled': '#ffa726',
        'Interview Completed': '#667eea',
        'Offer': '#10b981',
        'Rejected': '#f5576c'
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingJob) {
                const res = await api.put(`/job-tracker/${editingJob._id}`, formData);
                setJobs(jobs.map(job => job._id === editingJob._id ? res.data : job))
            } else {
                const res = await api.post(`/job-tracker`, formData);
                setJobs([res.data, ...jobs])
            }
            resetForm()
        } catch (err) {
            console.error("Failed to save job application", err)
            alert("Error saving job application")
        }
    }

    const resetForm = () => {
        setFormData({
            companyName: '',
            roleTitle: '',
            location: '',
            salary: '',
            status: 'Applied',
            dateApplied: new Date().toISOString().split('T')[0],
            link: '',
            notes: ''
        })
        setEditingJob(null)
        setShowModal(false)
    }

    const deleteJob = async (id) => {
        if (confirm('Are you sure you want to delete this application?')) {
            try {
                await api.delete(`/job-tracker/${id}`);
                setJobs(jobs.filter(job => job._id !== id))
            } catch (err) {
                console.error("Failed to delete job", err)
                alert("Failed to delete application")
            }
        }
    }

    const editJob = (job) => {
        setFormData(job)
        setEditingJob(job)
        setShowModal(true)
    }

    const filteredJobs = filterStatus === 'all'
        ? jobs
        : jobs.filter(job => job.status === filterStatus)

    const getStats = () => {
        return {
            total: jobs.length,
            applied: jobs.filter(j => j.status === 'Applied').length,
            interviews: jobs.filter(j => j.status.includes('Interview')).length,
            offers: jobs.filter(j => j.status === 'Offer').length
        }
    }

    const stats = getStats()

    return (
        <div className="app-container">


            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="stat-card-job" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Applications</div>
                </div>
                <div className="stat-card-job" style={{ background: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)' }}>
                    <div className="stat-value">{stats.interviews}</div>
                    <div className="stat-label">Interviews</div>
                </div>
                <div className="stat-card-job" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <div className="stat-value">{stats.offers}</div>
                    <div className="stat-label">Offers</div>
                </div>
            </div>

            {/* Actions */}
            <div className="job-actions">
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> Add Application
                </Button>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        All
                    </button>
                    {statuses.map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Job List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
                {filteredJobs.length === 0 ? (
                    <div className="empty-state col-span-full">
                        <Briefcase size={64} color="var(--text-muted)" />
                        <h3>No applications yet</h3>
                        <p>Start tracking your job applications by clicking "Add Application"</p>
                    </div>
                ) : (
                    filteredJobs.map(job => (
                        <div key={job._id} className="job-card flex flex-col h-full">
                            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-3 sm:gap-4 mb-4">
                                <div>
                                    <h3 className="m-0 text-base md:text-lg">{job.roleTitle}</h3>
                                    <p className="company-name">{job.companyName}</p>
                                </div>
                                <span
                                    className="status-badge"
                                    style={{ background: statusColors[job.status] }}
                                >
                                    {job.status}
                                </span>
                            </div>
                            <div className="job-card-details">
                                {job.location && (
                                    <div className="detail-item">
                                        <MapPin size={14} />
                                        <span>{job.location}</span>
                                    </div>
                                )}
                                {job.salary && (
                                    <div className="detail-item">
                                        <DollarSign size={14} />
                                        <span>{job.salary}</span>
                                    </div>
                                )}
                                <div className="detail-item">
                                    <Calendar size={14} />
                                    <span>Applied: {new Date(job.dateApplied).toLocaleDateString()}</span>
                                </div>
                            </div>
                            {job.notes && (
                                <div className="job-notes flex-grow">
                                    <strong>Notes:</strong> {job.notes}
                                </div>
                            )}
                            <div className="job-card-actions mt-auto">
                                <button className="action-btn" onClick={() => editJob(job)}>
                                    <Edit2 size={16} /> Edit
                                </button>
                                <button className="action-btn delete" onClick={() => deleteJob(job._id)}>
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]" onClick={resetForm}>
                    <div className="modal-content bg-[#111b27] border border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-[600px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-white m-0">{editingJob ? 'Edit Application' : 'Add New Application'}</h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm md:text-base">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-group flex flex-col gap-2">
                                    <label className="text-gray-300 font-semibold">Company *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2.5 text-white"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group flex flex-col gap-2">
                                    <label className="text-gray-300 font-semibold">Position *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2.5 text-white"
                                        value={formData.roleTitle}
                                        onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                                    />
                                </div>
                                <div className="form-group flex flex-col gap-2">
                                    <label className="text-gray-300 font-semibold">Location</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2.5 text-white"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="form-group flex flex-col gap-2">
                                    <label className="text-gray-300 font-semibold">Salary Range</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., $80k-$100k"
                                        className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2.5 text-white"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    />
                                </div>
                                <div className="form-group flex flex-col gap-2">
                                    <label className="text-gray-300 font-semibold">Status *</label>
                                    <select
                                        className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2.5 text-white"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        {statuses.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group flex flex-col gap-2">
                                    <label className="text-gray-300 font-semibold">Applied Date *</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2.5 text-white"
                                        value={formData.dateApplied}
                                        onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group flex flex-col gap-2 mt-2">
                                <label className="text-gray-300 font-semibold">Notes</label>
                                <textarea
                                    className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2.5 text-white"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Add any notes about this application..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <Button type="button" variant="ghost" onClick={resetForm}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary">
                                    {editingJob ? 'Update' : 'Add'} Application
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default JobTracker
