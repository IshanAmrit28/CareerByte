

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ArrowRight, 
    Terminal, 
    Trophy, 
    Bot, 
    Cpu, 
    MessageSquareCode, 
    Briefcase, 
    GitBranch, 
    Activity, 
    Layers, 
    Zap, 
    ChevronRight,
    Code2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Landing.css';

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
            <section className="landing-hero">
                <div className="hero-background-modern">
                    <div className="mesh-gradient"></div>
                    <div className="noise-overlay"></div>
                    <div className="ambient-orb orb-primary"></div>
                    <div className="ambient-orb orb-secondary"></div>
                </div>

                <div className="hero-content-wrapper">
                    <div className="hero-badge-container">
                        <div className="hero-badge">
                            <Terminal size={16} className="badge-icon" />
                            <span>v2.0 // The Developer Preparation Ecosystem</span>
                        </div>
                    </div>

                    <h1 className="hero-title-modern">
                        Build the skills that <br />
                        <span className="text-reveal-gradient">compile in the real world.</span>
                    </h1>

                    <p className="hero-description-modern">
                        Write optimal code, test your logic under pressure, and benchmark your engineering skills. CareerByte combines algorithmic practice, timed contests, and AI-driven technical interviews into a single ecosystem for continuous developer growth.
                    </p>

                    <div className="hero-actions">
                        <button onClick={handleStartPracticing} className="btn-modern btn-primary-glow">
                            Start Practicing
                            <ArrowRight size={20} className="btn-icon-right" />
                        </button>
                        <Link to="/candidate/coding-problems" className="btn-modern btn-outline-glass">
                            <Code2 size={20} className="btn-icon-left" />
                            Browse Problems
                        </Link>
                    </div>
                </div>
                <div className="hero-bottom-fade"></div>
            </section>

            {/* 2. DEVELOPER PREPARATION SECTION */}
            <section className="landing-preparation">
                <div className="prep-container">
                    <div className="prep-text-content">
                        <h2 className="section-title">Mastery requires <span className="text-highlight">reps</span>, not just reading.</h2>
                        <p className="section-subtitle">
                            Watching tutorials won't pass a technical screen. Real engineering improvement comes from consistent problem-solving, identifying edge cases, testing your knowledge against the clock, and simulating the pressure of a live interview environment. We built CareerByte to be the gym for your technical skills.
                        </p>
                    </div>
                    <div className="prep-stats-grid">
                        <div className="stat-card">
                            <Activity className="stat-icon" />
                            <h4>Consistent Practice</h4>
                            <p>Daily coding challenges to build muscle memory.</p>
                        </div>
                        <div className="stat-card">
                            <Layers className="stat-icon" />
                            <h4>Knowledge Testing</h4>
                            <p>Deep-dive quizzes on language internals.</p>
                        </div>
                        <div className="stat-card">
                            <GitBranch className="stat-icon" />
                            <h4>Pressure Simulation</h4>
                            <p>Live technical environments and timed constraints.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. PLATFORM CAPABILITIES */}
            <section className="landing-capabilities">
                <div className="capabilities-container">
                    <div className="section-header-modern">
                        <h2 className="section-title">An arsenal for <br/><span className="text-highlight">technical growth.</span></h2>
                    </div>

                    <div className="capabilities-grid">
                        <div className="cap-card">
                            <div className="cap-icon" style={{color: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)'}}>
                                <Terminal size={24} />
                            </div>
                            <h3>Algorithmic Practice</h3>
                            <p>Extensive problem sets focusing on data structures, space-time complexity, and edge-case handling.</p>
                        </div>

                        <div className="cap-card">
                            <div className="cap-icon" style={{color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)'}}>
                                <Trophy size={24} />
                            </div>
                            <h3>Timed Contests</h3>
                            <p>Compete in global leaderboards. Test your ability to write clean, optimized code under strict time limits.</p>
                        </div>

                        <div className="cap-card">
                            <div className="cap-icon" style={{color: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.1)'}}>
                                <Bot size={24} />
                            </div>
                            <h3>AI Mock Interviews</h3>
                            <p>Face an AI that acts like a senior engineer. Get grilled on system design, core concepts, and code architecture.</p>
                        </div>

                        <div className="cap-card">
                            <div className="cap-icon" style={{color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)'}}>
                                <Cpu size={24} />
                            </div>
                            <h3>Technical Quizzes</h3>
                            <p>Validate your knowledge on database scaling, API design, language-specific quirks, and networking fundamentals.</p>
                        </div>

                        <div className="cap-card">
                            <div className="cap-icon" style={{color: '#EC4899', backgroundColor: 'rgba(236, 72, 153, 0.1)'}}>
                                <MessageSquareCode size={24} />
                            </div>
                            <h3>AI Dev Assistant</h3>
                            <p>Context-aware rubber-ducking. Debug runtime errors and understand complex algorithms with an intelligent companion.</p>
                        </div>

                        <div className="cap-card">
                            <div className="cap-icon" style={{color: '#14B8A6', backgroundColor: 'rgba(20, 184, 166, 0.1)'}}>
                                <Briefcase size={24} />
                            </div>
                            <h3>Developer Job Board</h3>
                            <p>Connect with technical recruiters. Access curated roles matched to your verified coding proficiency and stack.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. HOW DEVELOPERS USE CAREERBYTE */}
            <section className="landing-workflow">
                <div className="workflow-container">
                    <h2 className="section-title text-center mb-5">The <span className="text-highlight">Developer Journey</span></h2>
                    
                    <div className="step-flow">
                        <div className="step-item">
                            <div className="step-number">01</div>
                            <div className="step-content">
                                <h4>Practice Coding Problems</h4>
                                <p>Sharpen logic across different difficulty levels.</p>
                            </div>
                        </div>
                        <div className="step-connector"><ChevronRight size={20} /></div>
                        
                        <div className="step-item">
                            <div className="step-number">02</div>
                            <div className="step-content">
                                <h4>Test Knowledge</h4>
                                <p>Expose blind spots with rapid-fire technical quizzes.</p>
                            </div>
                        </div>
                        <div className="step-connector"><ChevronRight size={20} /></div>
                        
                        <div className="step-item">
                            <div className="step-number">03</div>
                            <div className="step-content">
                                <h4>Compete in Contests</h4>
                                <p>Simulate pressure and benchmark against peers.</p>
                            </div>
                        </div>
                        <div className="step-connector"><ChevronRight size={20} /></div>
                        
                        <div className="step-item">
                            <div className="step-number">04</div>
                            <div className="step-content">
                                <h4>Simulate Interviews</h4>
                                <p>Defend your technical choices with our AI interviewer.</p>
                            </div>
                        </div>
                        <div className="step-connector"><ChevronRight size={20} /></div>

                        <div className="step-item">
                            <div className="step-number">05</div>
                            <div className="step-content">
                                <h4>Land the Role</h4>
                                <p>Apply to verified jobs with a proven track record.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. PRODUCT EXPERIENCE */}
            <section className="landing-experience">
                <div className="experience-container">
                    <div className="experience-header">
                        <h2 className="section-title">Built for <span className="text-highlight">engineers.</span></h2>
                        <p className="section-subtitle">Dark mode by default. Keyboard shortcuts included. Zero bloat.</p>
                    </div>

                    <div className="preview-grid">
                        <div className="preview-panel">
                            <div className="window-header">
                                <span className="dot dot-red"></span><span className="dot dot-yellow"></span><span className="dot dot-green"></span>
                                <span className="window-title">workspace.tsx</span>
                            </div>
                            <div className="window-body code-font">
                                <span className="code-keyword">function</span> <span className="code-function">solveProblem</span>(nums, target) {'{'} <br/>
                                &nbsp;&nbsp;<span className="code-comment">// Optimized O(n) solution</span><br/>
                                &nbsp;&nbsp;<span className="code-keyword">const</span> map = <span className="code-keyword">new</span> <span className="code-class">Map</span>();<br/>
                                &nbsp;&nbsp;<span className="code-keyword">for</span> (<span className="code-keyword">let</span> i = 0; i &lt; nums.length; i++) {'{'}<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-comment">/* implementation */</span><br/>
                                &nbsp;&nbsp;{'}'}<br/>
                                {'}'}
                            </div>
                            <div className="preview-caption">Distraction-free coding workspace with real-time evaluation.</div>
                        </div>

                        <div className="preview-panel">
                            <div className="window-header">
                                <span className="dot dot-red"></span><span className="dot dot-yellow"></span><span className="dot dot-green"></span>
                                <span className="window-title">ai_interviewer.sh</span>
                            </div>
                            <div className="window-body terminal-font">
                                <span className="term-prompt">$ System:</span> How would you scale this microservice to handle 10k requests/sec?<br/><br/>
                                <span className="term-user">&gt; I would implement a Redis caching layer and horizontally scale the Node instances...</span><br/><br/>
                                <span className="term-prompt">$ System:</span> Good. But what happens to cache consistency during deployments?
                            </div>
                            <div className="preview-caption">Dynamic AI interviews that probe your architectural decisions.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. CONTINUOUS LEARNING SECTION */}
            <section className="landing-continuous">
                <div className="continuous-container">
                    <div className="continuous-content">
                        <h2>Not just for the interview.<br/>For the <span className="text-highlight">career.</span></h2>
                        <p>Tech evolves fast. Frameworks die, languages update, and system architectures shift. CareerByte isn't just a cramming tool for your next interview—it's a continuous learning platform to maintain your technical edge, build confidence, and stay deploy-ready.</p>
                    </div>
                </div>
            </section>

            {/* 7. FINAL ACTION SECTION */}
            <section className="landing-cta-modern">
                <div className="cta-glow-bg"></div>
                <div className="cta-content-wrapper">
                    <h2 className="cta-headline">Ready to commit?</h2>
                    <p className="cta-subheadline">Join thousands of developers leveling up their technical skills every day.</p>
                    <div className="hero-actions" style={{marginBottom: 0}}>
                        <button onClick={handleStartPracticing} className="btn-modern btn-cta-massive">
                            Start Practicing
                            <Zap size={20} className="btn-icon-right" />
                        </button>
                        <Link to="/candidate/coding-problems" className="btn-modern btn-outline-glass">
                            Explore Coding Problems
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Landing;