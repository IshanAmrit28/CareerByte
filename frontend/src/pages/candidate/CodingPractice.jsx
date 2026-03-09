import { useState } from 'react'
import { Code, Briefcase, CheckCircle2, ChevronRight, Target, BookOpen, AlertCircle } from 'lucide-react'

import Button from '../../components/Button'
import './CodingPractice.css'

const interviewQuestionsByRole = {
    'Frontend Developer': {
        icon: '⚛️',
        color: '#61dafb',
        technical: [
            'Explain the Virtual DOM and how React uses it for efficient rendering.',
            'What is the difference between controlled and uncontrolled components in React?',
            'Explain closures in JavaScript with a practical example.',
            'What are React Hooks? Explain useState, useEffect, and useContext.',
            'How does event delegation work in JavaScript?',
            'Explain the difference between == and === in JavaScript.',
            'What is CSS specificity and how is it calculated?',
            'Describe different ways to center a div in CSS.',
            'What are promises in JavaScript? Explain async/await.',
            'Explain the concept of hoisting in JavaScript.',
            'What is the box model in CSS?',
            'Describe different methods of state management in React (Context API, Redux, Zustand).',
            'What are Higher Order Components (HOC) in React?',
            'Explain debouncing and throttling with use cases.',
            'How would you optimize the performance of a React application?'
        ],
        behavioral: [
            'Describe a challenging UI/UX problem you solved.',
            'How do you ensure your code is accessible?',
            'Tell me about a time you had to refactor legacy frontend code.',
            'How do you stay updated with the latest frontend technologies?',
            'Describe your approach to responsive design.',
            'How do you handle browser compatibility issues?'
        ],
        coding: [
            'Implement a debounce function from scratch.',
            'Create a custom React hook for fetching data with loading states.',
            'Build a simple todo list with add, delete, and toggle functionality.',
            'Implement infinite scrolling in React.',
            'Create a component that renders nested comments (like Reddit).'
        ]
    },
    'Backend Developer': {
        icon: '⚙️',
        color: '#68a063',
        technical: [
            'Explain the difference between SQL and NoSQL databases.',
            'What is RESTful API? What are its key principles?',
            'Describe how authentication works (JWT, OAuth, Session-based).',
            'What is the N+1 query problem and how do you solve it?',
            'Explain ACID properties in databases.',
            'What are database indexes and when should you use them?',
            'Describe microservices architecture and its advantages.',
            'What is a message queue? Give examples of use cases.',
            'Explain the CAP theorem.',
            'What are the different types of database relationships?',
            'Describe caching strategies (Redis, Memcached).',
            'What is API rate limiting and how do you implement it?',
            'Explain vertical vs horizontal scaling.',
            'What are database transactions and isolation levels?',
            'Describe different HTTP methods and their idempotency.'
        ],
        behavioral: [
            'Describe a time you optimized database queries for better performance.',
            'How do you handle production incidents?',
            'Tell me about a complex system you designed from scratch.',
            'How do you ensure API security?',
            'Describe your testing strategy for backend services.',
            'How do you handle backward compatibility in APIs?'
        ],
        coding: [
            'Design a URL shortening service like bit.ly.',
            'Implement rate limiting for an API.',
            'Write a function to detect cycles in a linked list.',
            'Design a basic authentication system with JWT.',
            'Implement a simple caching mechanism with TTL.'
        ]
    },
    'Full Stack Developer': {
        icon: '🚀',
        color: '#f39c12',
        technical: [
            'How would you design a scalable web application from scratch?',
            'Explain the request-response lifecycle in a web application.',
            'What is CORS and how do you handle it?',
            'Describe your experience with CI/CD pipelines.',
            'How do you handle errors and logging in a full-stack application?',
            'Explain WebSockets and when you would use them.',
            'What is server-side rendering (SSR) vs client-side rendering (CSR)?',
            'Describe your approach to API versioning.',
            'How do you handle file uploads in a web application?',
            'Explain different deployment strategies (blue-green, canary, rolling).',
            'What are environment variables and how do you manage them?',
            'Describe your experience with Docker and containerization.',
            'How do you implement real-time features in web applications?',
            'Explain the concept of middleware in backend frameworks.',
            'What security best practices do you follow for web applications?'
        ],
        behavioral: [
            'Describe a full-stack project you built end-to-end.',
            'How do you prioritize between frontend and backend tasks?',
            'Tell me about a time you had to learn a new technology quickly.',
            'How do you ensure consistency between frontend and backend?',
            'Describe your debugging process for full-stack issues.',
            'How do you handle technical debt in a codebase?'
        ],
        coding: [
            'Build a simple chat application with real-time messaging.',
            'Implement user authentication with email verification.',
            'Create a REST API with CRUD operations and connect it to a React frontend.',
            'Design a file upload system with progress tracking.',
            'Implement pagination for a large dataset on both frontend and backend.'
        ]
    },
    'Data Analyst': {
        icon: '📊',
        color: '#3498db',
        technical: [
            'Explain the difference between WHERE and HAVING clauses in SQL.',
            'What are window functions in SQL? Give examples.',
            'Describe different types of JOINs and when to use them.',
            'What is a CTE (Common Table Expression) and why use it?',
            'Explain the difference between UNION and UNION ALL.',
            'What are aggregate functions? Name at least 5.',
            'Describe your experience with data visualization tools (Tableau, Power BI).',
            'How do you handle missing data in a dataset?',
            'Explain A/B testing and how to analyze results.',
            'What is cohort analysis and when would you use it?',
            'Describe different types of data distributions.',
            'What is the difference between correlation and causation?',
            'Explain different sampling techniques.',
            'How do you identify and handle outliers in data?',
            'What are key performance indicators (KPIs) you have worked with?'
        ],
        behavioral: [
            'Describe a complex data analysis project you completed.',
            'How do you communicate technical findings to non-technical stakeholders?',
            'Tell me about a time your analysis led to a business decision.',
            'How do you ensure data quality and accuracy?',
            'Describe your process for exploring a new dataset.',
            'How do you prioritize which metrics to track?'
        ],
        coding: [
            'Write SQL query to find the second highest salary.',
            'Calculate month-over-month growth rate from a sales table.',
            'Find the top 5 customers by revenue with their purchase counts.',
            'Write a query to detect duplicate records.',
            'Calculate running total using window functions.'
        ]
    },
    'DevOps Engineer': {
        icon: '🔧',
        color: '#e74c3c',
        technical: [
            'Explain the CI/CD pipeline and its components.',
            'What is Infrastructure as Code (IaC)? Name tools you have used.',
            'Describe Docker containers and their benefits.',
            'What is Kubernetes and why is it used?',
            'Explain the difference between horizontal and vertical scaling.',
            'What are the key principles of the 12-factor app?',
            'Describe monitoring and logging strategies.',
            'What is blue-green deployment?',
            'Explain the concept of immutable infrastructure.',
            'What are the benefits of using configuration management tools?',
            'Describe your experience with cloud platforms (AWS, Azure, GCP).',
            'What is a load balancer and how does it work?',
            'Explain the concept of service mesh.',
            'What are secrets management tools and why are they important?',
            'Describe different backup and disaster recovery strategies.'
        ],
        behavioral: [
            'Describe a time you improved deployment processes.',
            'How do you handle production outages?',
            'Tell me about automating a manual process.',
            'How do you ensure system security?',
            'Describe your approach to capacity planning.',
            'How do you balance speed and stability in deployments?'
        ],
        coding: [
            'Write a bash script to monitor disk usage and send alerts.',
            'Create a Dockerfile for a Node.js application.',
            'Write a script to automate backup of a database.',
            'Implement health checks for a web service.',
            'Create a basic CI/CD pipeline configuration.'
        ]
    }
}

function CodingPractice() {
    const [selectedRole, setSelectedRole] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState('technical')
    const [expandedQuestion, setExpandedQuestion] = useState(null)

    const roles = Object.keys(interviewQuestionsByRole)

    const handleRoleSelect = (role) => {
        setSelectedRole(role)
        setSelectedCategory('technical')
        setExpandedQuestion(null)
    }

    const currentRoleData = selectedRole ? interviewQuestionsByRole[selectedRole] : null
    const currentQuestions = currentRoleData ? currentRoleData[selectedCategory] : []

    return (
        <div className="app-container">


            {!selectedRole ? (
                /* Role Selection */
                <div>
                    <div className="section-header" style={{ marginBottom: 32, textAlign: 'center' }}>
                        <h2 style={{ fontSize: 24, marginBottom: 12 }}>Select Your Target Role</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                            Choose a role to view curated interview questions
                        </p>
                    </div>

                    <div className="role-selection-grid">
                        {roles.map(role => {
                            const roleData = interviewQuestionsByRole[role]
                            const totalQuestions = roleData.technical.length + roleData.behavioral.length + roleData.coding.length
                            return (
                                <button
                                    key={role}
                                    className="role-card"
                                    onClick={() => handleRoleSelect(role)}
                                    style={/** @type {any} */ ({ '--role-color': roleData.color })}
                                >
                                    <div className="role-icon" style={{ background: roleData.color }}>
                                        {roleData.icon}
                                    </div>
                                    <h3>{role}</h3>
                                    <div className="role-stats">
                                        <span className="badge badge-blue">{roleData.technical.length} Technical</span>
                                        <span className="badge badge-purple">{roleData.behavioral.length} Behavioral</span>
                                        <span className="badge badge-green">{roleData.coding.length} Coding</span>
                                    </div>
                                    <div className="role-total">{totalQuestions} Questions Total</div>
                                    <ChevronRight className="role-arrow" size={20} />
                                </button>
                            )
                        })}
                    </div>
                </div>
            ) : (
                /* Questions Display */
                <div>
                    <div className="selected-role-header">
                        <button className="back-to-roles" onClick={() => setSelectedRole(null)}>
                            ← Back to Roles
                        </button>
                        <div className="role-title-section">
                            <span className="role-icon-large" style={{ background: currentRoleData.color }}>
                                {currentRoleData.icon}
                            </span>
                            <div>
                                <h2>{selectedRole}</h2>
                                <p>{currentRoleData.technical.length + currentRoleData.behavioral.length + currentRoleData.coding.length} Questions Available</p>
                            </div>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="category-tabs">
                        <button
                            className={`category-tab ${selectedCategory === 'technical' ? 'active' : ''}`}
                            onClick={() => { setSelectedCategory('technical'); setExpandedQuestion(null); }}
                        >
                            <BookOpen size={18} />
                            Technical ({currentRoleData.technical.length})
                        </button>
                        <button
                            className={`category-tab ${selectedCategory === 'behavioral' ? 'active' : ''}`}
                            onClick={() => { setSelectedCategory('behavioral'); setExpandedQuestion(null); }}
                        >
                            <Target size={18} />
                            Behavioral ({currentRoleData.behavioral.length})
                        </button>
                        <button
                            className={`category-tab ${selectedCategory === 'coding' ? 'active' : ''}`}
                            onClick={() => { setSelectedCategory('coding'); setExpandedQuestion(null); }}
                        >
                            <Code size={18} />
                            Coding ({currentRoleData.coding.length})
                        </button>
                    </div>

                    {/* Questions List */}
                    <div className="questions-container">
                        <div className="questions-list">
                            {currentQuestions.map((question, idx) => (
                                <div key={idx} className="question-card">
                                    <div className="question-header-row">
                                        <div className="question-number">Q{idx + 1}</div>
                                        <div className="question-text">{question}</div>
                                        <button
                                            className="expand-btn"
                                            onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                                        >
                                            {expandedQuestion === idx ? '−' : '+'}
                                        </button>
                                    </div>
                                    {expandedQuestion === idx && (
                                        <div className="question-expanded">
                                            <div className="tip-section">
                                                <AlertCircle size={16} />
                                                <div>
                                                    <strong>Tips for answering:</strong>
                                                    <ul>
                                                        <li>Take a moment to think before answering</li>
                                                        <li>Provide specific examples from your experience</li>
                                                        <li>Structure your answer clearly (STAR method for behavioral)</li>
                                                        <li>Be honest about what you know and don't know</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="practice-actions">
                                                <button className="practice-btn">
                                                    <CheckCircle2 size={16} />
                                                    Mark as Practiced
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Sidebar Tips */}
                        <div className="questions-sidebar-tips">
                            <div className="tip-card">
                                <h4>💡 Preparation Tips</h4>
                                <ul>
                                    <li>Practice explaining concepts out loud</li>
                                    <li>Use the STAR method for behavioral questions</li>
                                    <li>Prepare real examples from your experience</li>
                                    <li>Review these questions daily</li>
                                    <li>Mock interview with peers</li>
                                </ul>
                            </div>

                            <div className="tip-card">
                                <h4>📚 Study Resources</h4>
                                <p>Check out the <strong>Notes</strong> section for detailed study materials on each topic.</p>
                                <p>Use the <strong>Mock Interview</strong> feature to practice these questions with AI.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CodingPractice
