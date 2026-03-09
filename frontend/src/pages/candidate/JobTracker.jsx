import { useState, useEffect } from 'react'
import { Plus, Briefcase, Calendar, MapPin, DollarSign, Trash2, Edit2, Filter } from 'lucide-react'
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
            <div className="job-stats">
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
            <div className="job-list">
                {filteredJobs.length === 0 ? (
                    <div className="empty-state">
                        <Briefcase size={64} color="var(--text-muted)" />
                        <h3>No applications yet</h3>
                        <p>Start tracking your job applications by clicking "Add Application"</p>
                    </div>
                ) : (
                    filteredJobs.map(job => (
                        <div key={job._id} className="job-card">
                            <div className="job-card-header">
                                <div>
                                    <h3>{job.roleTitle}</h3>
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
                                <div className="job-notes">
                                    <strong>Notes:</strong> {job.notes}
                                </div>
                            )}
                            <div className="job-card-actions">
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
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingJob ? 'Edit Application' : 'Add New Application'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Company *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Position *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.roleTitle}
                                        onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Salary Range</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., $80k-$100k"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Status *</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        {statuses.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Applied Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.dateApplied}
                                        onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Add any notes about this application..."
                                />
                            </div>
                            <div className="modal-actions">
                                <Button type="submit" variant="primary" onClick={() => {}}>
                                    {editingJob ? 'Update' : 'Add'} Application
                                </Button>
                                <Button type="button" variant="ghost" onClick={resetForm}>
                                    Cancel
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
