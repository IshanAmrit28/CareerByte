import { useState } from 'react'
import { Calendar, Download, ArrowRight, CheckCircle } from 'lucide-react'
import Button from '../../components/Button'

import './StudyPlan.css'

// Expanded mock data for different roles
const ROLE_PLANS = {
    'SDE-1': [
        { week: 1, topic: 'Arrays & Hashing', focus: 'Two Pointers, Sliding Window, Prefix Sum', resources: 'LeetCode Blind 75' },
        { week: 2, topic: 'Linked Lists & Stacks', focus: 'Fast/Slow Pointers, Monotonic Stack', resources: 'Cracking the Coding Interview Ch.2' },
        { week: 3, topic: 'Trees & Graphs', focus: 'DFS, BFS, Binary Search Trees', resources: 'NeetCode Trees Playlist' },
        { week: 4, topic: 'Dynamic Programming', focus: '1D DP, Knapsack, LCS', resources: 'Aditya Verma DP Series' },
        { week: 5, topic: 'System Design Basics', focus: 'Scalability, Load Balancers, Caching', resources: 'System Design Primer (GitHub)' },
        { week: 6, topic: 'Mock Interviews', focus: 'Full-stack problems, Behavioral prep', resources: 'Pramp, Interviewing.io' }
    ],
    'Data Analyst': [
        { week: 1, topic: 'SQL Fundamentals', focus: 'Joins, Aggregations, Window Functions', resources: 'Mode Analytics SQL Tutorial' },
        { week: 2, topic: 'Python for Data', focus: 'Pandas, NumPy, Data Cleaning', resources: 'Kaggle Learn' },
        { week: 3, topic: 'Statistics & Probability', focus: 'Hypothesis Testing, Distributions', resources: 'Khan Academy Statistics' },
        { week: 4, topic: 'Data Visualization', focus: 'Matplotlib, Seaborn, Tableau', resources: 'Storytelling with Data (Book)' },
        { week: 5, topic: 'Case Studies', focus: 'A/B Testing, Cohort Analysis', resources: 'DataCamp Projects' },
        { week: 6, topic: 'Interview Prep', focus: 'SQL challenges, Take-home assignments', resources: 'StrataScratch' }
    ],
    'Frontend Dev': [
        { week: 1, topic: 'JavaScript Deep Dive', focus: 'Closures, Promises, Event Loop', resources: 'JavaScript.info' },
        { week: 2, topic: 'React Fundamentals', focus: 'Hooks, Context, Component Design', resources: 'React Docs (Beta)' },
        { week: 3, topic: 'State Management', focus: 'Redux, Zustand, React Query', resources: 'Egghead.io Redux Course' },
        { week: 4, topic: 'CSS & Responsive Design', focus: 'Flexbox, Grid, Mobile-first', resources: 'CSS Tricks, Kevin Powell' },
        { week: 5, topic: 'Performance & Accessibility', focus: 'Lighthouse, ARIA, Code Splitting', resources: 'web.dev' },
        { week: 6, topic: 'Build Projects', focus: 'Portfolio site, E-commerce clone', resources: 'Frontend Mentor' }
    ],
    'Backend Engineer': [
        { week: 1, topic: 'REST API Design', focus: 'HTTP Methods, Status Codes, Versioning', resources: 'RESTful API Design (Book)' },
        { week: 2, topic: 'Database Design', focus: 'Normalization, Indexing, Transactions', resources: 'Use The Index, Luke' },
        { week: 3, topic: 'Authentication & Security', focus: 'JWT, OAuth, HTTPS', resources: 'OWASP Top 10' },
        { week: 4, topic: 'Microservices Basics', focus: 'Service Communication, API Gateway', resources: 'Martin Fowler Articles' },
        { week: 5, topic: 'Caching & Queues', focus: 'Redis, RabbitMQ, Message Brokers', resources: 'Redis University' },
        { week: 6, topic: 'System Design', focus: 'Design Twitter, URL Shortener', resources: 'Grokking System Design' }
    ]
}

function StudyPlan() {
    const [role, setRole] = useState('')
    const [generated, setGenerated] = useState(false)

    const handleGenerate = () => {
        if (!role) return
        setGenerated(true)
    }

    const currentPlan = ROLE_PLANS[role] || ROLE_PLANS['SDE-1']

    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 px-4 md:px-8 pb-12 font-sans overflow-x-hidden relative">
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[80px] opacity-70 pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[80px] opacity-70 pointer-events-none" />
            
            <div className="max-w-[1440px] mx-auto relative z-10 w-full">

            {/* Input Section */}
            {!generated ? (
                <div className="max-w-[600px] mx-auto w-full">
                    <div className="dense-card p-6 md:p-10 w-full bg-[#111b27] border border-slate-800 rounded-3xl backdrop-blur-md shadow-xl">
                        <h3 className="mb-4 text-lg font-bold">Select your target role</h3>

                        <div className="plan-selector">
                            {Object.keys(ROLE_PLANS).map(r => (
                                <button
                                    key={r}
                                    className={`role-chip ${role === r ? 'active' : ''}`}
                                    onClick={() => setRole(r)}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <input
                            type="text"
                            placeholder="Or type a custom role..."
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full p-3 border border-[var(--border-main)] rounded-[var(--radius-md)] bg-[var(--bg-subtle)] color-[var(--text-main)] text-sm mb-6"
                        />

                        <Button variant="primary" size="large" onClick={handleGenerate} disabled={!role}>
                            Generate Study Plan <ArrowRight size={18} />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto w-full">
                    <div className="dense-card p-6 md:p-10 bg-[#111b27] border border-slate-800 rounded-3xl backdrop-blur-md shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold mb-2">
                                    {role} Preparation Plan
                                </h2>
                                <div className="flex gap-4 text-sm text-[var(--text-muted)]">
                                    <span>📅 Duration: 6 Weeks</span>
                                    <span>⚡ Intensity: High</span>
                                    <span>🎯 Focus: Interview Ready</span>
                                </div>
                            </div>
                            <Button variant="ghost" size="small">
                                <Download size={16} /> Export
                            </Button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {currentPlan.map((week) => (
                                <div key={week.week} className="week-card">
                                    <div className="week-number">{week.week}</div>
                                    <div className="week-content" style={{ flexGrow: 1 }}>
                                        <h4>Week {week.week}: {week.topic}</h4>
                                        <p style={{ marginBottom: 8 }}>
                                            <strong>Focus:</strong> {week.focus}
                                        </p>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span className="badge badge-blue">{week.resources}</span>
                                        </p>
                                    </div>
                                    <button
                                        className="bg-transparent border border-[var(--border-main)] rounded px-3 py-1.5 cursor-pointer text-xs text-[var(--text-muted)]"
                                    >
                                        <CheckCircle size={14} style={{ marginRight: 4 }} /> Mark Done
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-5 bg-[var(--bg-subtle)] rounded-lg text-center">
                            <p className="m-0 mb-3 text-sm text-[var(--text-muted)]">
                                Need a different plan?
                            </p>
                            <Button variant="ghost" onClick={() => setGenerated(false)}>
                                Regenerate Study Plan
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
    )
}

export default StudyPlan
