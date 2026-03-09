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
        <div className="app-container">


            {/* Input Section */}
            {!generated ? (
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <div className="dense-card" style={{ padding: 40 }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Select your target role</h3>

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
                            style={{
                                width: '100%',
                                padding: 12,
                                border: '1px solid var(--border-main)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-subtle)',
                                color: 'var(--text-main)',
                                fontSize: 14,
                                marginBottom: 24
                            }}
                        />

                        <Button variant="primary" size="large" onClick={handleGenerate} disabled={!role}>
                            Generate Roadmap <ArrowRight size={18} />
                        </Button>
                    </div>
                </div>
            ) : (
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <div className="dense-card" style={{ padding: 40 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                            <div>
                                <h2 style={{ fontSize: 20, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
                                    {role} Preparation Plan
                                </h2>
                                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
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
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid var(--border-main)',
                                            borderRadius: 4,
                                            padding: '6px 12px',
                                            cursor: 'pointer',
                                            fontSize: 12,
                                            color: 'var(--text-muted)'
                                        }}
                                    >
                                        <CheckCircle size={14} style={{ marginRight: 4 }} /> Mark Done
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 32, padding: 20, background: 'var(--bg-subtle)', borderRadius: 8, textAlign: 'center' }}>
                            <p style={{ margin: '0 0 12px 0', fontSize: 13, color: 'var(--text-muted)' }}>
                                Need a different plan?
                            </p>
                            <Button variant="ghost" onClick={() => setGenerated(false)}>
                                Regenerate Roadmap
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudyPlan
