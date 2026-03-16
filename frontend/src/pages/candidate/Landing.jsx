import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Terminal, Code, Trophy, BrainCircuit, CheckSquare, Bot, Briefcase, Activity, Target, Award, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './Landing.css'

function Landing() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleStartPracticing = (e) => {
        e.preventDefault();
        if (user) {
            navigate('/candidate/dashboard');
        } else {
            navigate('/login');
        }
    };
    
    return (
        <div className="landing-page">
            {/* 1. HERO SECTION */}
            <section className="hero-section">
                <div className="hero-bg-elements">
                    <div className="glow-orb orb-1"></div>
                    <div className="glow-orb orb-2"></div>
                    <div className="glow-orb orb-3"></div>
                    <div className="grid-overlay"></div>
                </div>
                
                <div className="container hero-content">
                    <div className="hero-badge">
                        <Terminal size={14} className="badge-icon" />
                        <span>The Developer Preparation Ecosystem</span>
                    </div>
                    <h1 className="hero-title">
                        Practice, Compete, and <br/>
                        <span className="text-gradient">Master Your Craft.</span>
                    </h1>
                    <p className="hero-subtitle">
                        A unified platform where developers practice coding problems, test their knowledge with quizzes, compete in contests, simulate real interviews, and discover their next job opportunity.
                    </p>
                    <div className="hero-actions">
                        <button onClick={handleStartPracticing} className="btn btn-primary btn-large">
                            Start Practicing
                            <ArrowRight size={18} />
                        </button>
                        <Link to="/candidate/coding-problems" className="btn btn-secondary btn-large">
                            <Code size={18} />
                            Browse Problems
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. DEVELOPER PREPARATION SECTION */}
            <section className="preparation-section">
                <div className="container">
                    <div className="prep-grid">
                        <div className="prep-text">
                            <h2 className="section-heading">Real Growth Requires Structure</h2>
                            <p className="section-description" style={{margin: 0}}>
                                Getting better at software engineering isn't just about reading solutions. It demands consistent coding practice, validating your knowledge, solving problems under pressure, and realistic interview preparation. CareerByte brings these activities into one cohesive ecosystem.
                            </p>
                        </div>
                        <div className="prep-features">
                            <div className="prep-item">
                                <div className="prep-icon-wrapper"><Activity size={20} /></div>
                                <div>
                                    <h4>Consistent Practice</h4>
                                    <p>Build muscle memory with daily coding challenges.</p>
                                </div>
                            </div>
                            <div className="prep-item">
                                <div className="prep-icon-wrapper"><Target size={20} /></div>
                                <div>
                                    <h4>Knowledge Testing</h4>
                                    <p>Identify blank spots in your technical foundations.</p>
                                </div>
                            </div>
                            <div className="prep-item">
                                <div className="prep-icon-wrapper"><Zap size={20} /></div>
                                <div>
                                    <h4>Pressure Simulation</h4>
                                    <p>Perform optimally when the clock is ticking.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. PLATFORM CAPABILITIES */}
            <section className="capabilities-section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-heading">Platform Capabilities</h2>
                        <p className="section-description">Everything you need to level up your technical skills.</p>
                    </div>
                    
                    <div className="caps-grid">
                        <div className="cap-card">
                            <div className="cap-icon code-icon"><Code size={24} /></div>
                            <h3>Coding Problems</h3>
                            <p>An extensive library of algorithmic challenges categorized by difficulty and topic.</p>
                        </div>
                        <div className="cap-card">
                            <div className="cap-icon contest-icon"><Trophy size={24} /></div>
                            <h3>Coding Contests</h3>
                            <p>Compete against other developers in timed environments to climb the global leaderboard.</p>
                        </div>
                        <div className="cap-card">
                            <div className="cap-icon ai-icon"><BrainCircuit size={24} /></div>
                            <h3>AI Mock Interviews</h3>
                            <p>Simulate technical and behavioral rounds with an intelligent, voice-enabled assistant.</p>
                        </div>
                        <div className="cap-card">
                            <div className="cap-icon quiz-icon"><CheckSquare size={24} /></div>
                            <h3>Technical Quizzes</h3>
                            <p>Test your deeper understanding of language specifics, system design, and computer science concepts.</p>
                        </div>
                        <div className="cap-card">
                            <div className="cap-icon bot-icon"><Bot size={24} /></div>
                            <h3>AI Developer Assistant</h3>
                            <p>Receive real-time hints and code explanations when you get stuck on difficult problems.</p>
                        </div>
                        <div className="cap-card">
                            <div className="cap-icon jobs-icon"><Briefcase size={24} /></div>
                            <h3>Developer Job Board</h3>
                            <p>Find exclusive opportunities matching your skill profile and preparation metrics.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. HOW DEVELOPERS USE CAREERBYTE */}
            <section className="journey-section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-heading">The Developer's Journey</h2>
                        <p className="section-description">A systematic approach to technical mastery.</p>
                    </div>
                    
                    <div className="steps-container">
                        <div className="step-item">
                            <div className="step-number">01</div>
                            <h3>Practice</h3>
                            <p>Solve coding problems</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-item">
                            <div className="step-number">02</div>
                            <h3>Test</h3>
                            <p>Validate your knowledge</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-item">
                            <div className="step-number">03</div>
                            <h3>Compete</h3>
                            <p>Join timed coding contests</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-item">
                            <div className="step-number">04</div>
                            <h3>Simulate</h3>
                            <p>Interview with AI</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-item">
                            <div className="step-number">05</div>
                            <h3>Explore</h3>
                            <p>Find job opportunities</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. PRODUCT EXPERIENCE */}
            <section className="experience-section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-heading">Built for Developers</h2>
                        <p className="section-description">A modern, distraction-free environment designed for deep work.</p>
                    </div>

                    <div className="exp-grid">
                        <div className="exp-card large">
                            <div className="exp-visual workspace-visual">
                                <div className="mock-header">
                                    <div className="mock-dots"><span></span><span></span><span></span></div>
                                    <div className="mock-title">workspace.js</div>
                                </div>
                                <div className="mock-body">
                                    <code>
                                        <span className="kw">function</span> <span className="fn">solve</span>(runtime) {'{\n'}
                                        {'  '} <span className="kw">return</span> runtime.optimize();{'\n'}
                                        {'}'}
                                    </code>
                                </div>
                            </div>
                            <div className="exp-info">
                                <h3>Coding Problem Workspace</h3>
                                <p>An IDE-like experience with integrated test cases.</p>
                            </div>
                        </div>

                        <div className="exp-card">
                            <div className="exp-visual ai-visual">
                                <Bot size={40} className="floating-bot"/>
                                <div className="audio-wave">
                                    <span></span><span></span><span></span><span></span><span></span>
                                </div>
                            </div>
                            <div className="exp-info">
                                <h3>AI Interview Interface</h3>
                                <p>Real-time conversational feedback.</p>
                            </div>
                        </div>

                        <div className="exp-card">
                            <div className="exp-visual board-visual">
                                <div className="rank-bar"><span style={{width: '90%'}}></span></div>
                                <div className="rank-bar"><span style={{width: '75%'}}></span></div>
                                <div className="rank-bar"><span style={{width: '50%'}}></span></div>
                            </div>
                            <div className="exp-info">
                                <h3>Contest Leaderboard</h3>
                                <p>Track your global ranking.</p>
                            </div>
                        </div>

                        <div className="exp-card large">
                            <div className="exp-visual dash-visual">
                                <div className="stat-boxes">
                                    <div className="s-box"></div>
                                    <div className="s-box"></div>
                                    <div className="s-box"></div>
                                </div>
                                <div className="chart-line"></div>
                            </div>
                            <div className="exp-info">
                                <h3>Preparation Dashboard</h3>
                                <p>Analytics on your growth and weak points.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. CONTINUOUS LEARNING SECTION */}
            <section className="continuous-section">
                <div className="container">
                    <div className="learning-box">
                        <div className="learning-content">
                            <Award size={32} className="accent-icon" />
                            <h2 className="section-heading">Beyond the Interview</h2>
                            <p className="section-description">
                                CareerByte isn't just a crash course for your next job hop. It's built for continuous skill building. Consistently solving algorithmic puzzles and testing your breadth of knowledge leads to genuine technical confidence and long-term career readiness.
                            </p>
                            <div className="learning-tags">
                                <span>Skill Building</span>
                                <span>Consistent Problem Solving</span>
                                <span>Technical Confidence</span>
                                <span>Career Readiness</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. FINAL ACTION SECTION */}
            <section className="final-cta-section">
                <div className="cta-background"></div>
                <div className="container cta-container">
                    <h2 className="cta-headline">Ready to Elevate Your Code?</h2>
                    <p className="cta-subheadline">Join the ecosystem where developers refine their skills and achieve mastery.</p>
                    <div className="hero-actions">
                        <button onClick={handleStartPracticing} className="btn btn-primary btn-large">
                            Start Practicing
                            <ArrowRight size={20} />
                        </button>
                        <Link to="/candidate/coding-problems" className="btn btn-secondary btn-large">
                            <Code size={20} />
                            Explore Coding Problems
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Landing
