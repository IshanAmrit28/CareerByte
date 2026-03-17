import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Target, Zap, Award, BookOpen, Code, BrainCircuit, PlayCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './Landing.css'
import LatestJobs from '../../components/LatestJobs'

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
            {/* Ultra Premium Hero Section */}
            <section className="landing-hero">
                <div className="hero-background-modern">
                    <div className="mesh-gradient"></div>
                    <div className="noise-overlay"></div>
                    
                    {/* Floating Orbs for depth */}
                    <div className="ambient-orb orb-primary"></div>
                    <div className="ambient-orb orb-secondary"></div>
                    <div className="ambient-orb orb-accent"></div>
                </div>

                <div className="hero-content-wrapper">
                    <div className="hero-badge-container">
                        <div className="hero-badge">
                            <Sparkles size={16} className="badge-icon" />
                            <span>The Next Generation Interview Platform</span>
                        </div>
                    </div>

                    <h1 className="hero-title-modern">
                        Hack Your Career.<br />
                        <span className="text-reveal-gradient">Master the Interview.</span>
                    </h1>

                    <p className="hero-description-modern">
                        Stop guessing what they'll ask. CareerByte provides AI-driven mock interviews, interactive coding challenges, and a smart study system to land your dream role in tech.
                    </p>

                    <div className="hero-actions">
                        <button onClick={handleStartPracticing} className="btn-modern btn-primary-glow">
                            Start Practicing Free
                            <ArrowRight size={20} className="btn-icon-right" />
                        </button>
                        <Link to="/candidate/coding-problems" className="btn-modern btn-outline-glass">
                            <Code size={20} className="btn-icon-left" />
                            Solve Problems
                        </Link>
                    </div>

                    <div className="hero-social-proof">
                        <div className="avatars-group">
                            <div className="avatar"></div>
                            <div className="avatar"></div>
                            <div className="avatar"></div>
                            <div className="avatar"></div>
                            <div className="avatar-more">+2k</div>
                        </div>
                        <span className="proof-text">Developers landed jobs this year</span>
                    </div>
                </div>
                
                {/* Decorative Bottom Fade */}
                <div className="hero-bottom-fade"></div>
            </section>

            <LatestJobs />

            {/* Bento Grid Features Section */}
            <section className="landing-bento">
                <div className="bento-container">
                    <div className="section-header-modern">
                        <h2 className="section-title">Everything essential, <br/><span className="text-highlight">beautifully integrated.</span></h2>
                        <p className="section-subtitle">A central hub for all your preparation needs, intelligently tied together.</p>
                    </div>

                    <div className="bento-grid">
                        {/* Large Tile - AI Mock Interview */}
                        <div className="bento-card bento-large bento-ai">
                            <div className="bento-content">
                                <div className="bento-icon-wrapper" style={{background: 'var(--bento-ai-color)'}}>
                                    <BrainCircuit size={28} />
                                </div>
                                <h3>AI-Powered Mock Interviews</h3>
                                <p>Experience realistic technical and behavioral interviews with real-time feedback and dynamic follow-up questions tailored to your target role.</p>
                            </div>
                            <div className="bento-visual visual-ai"></div>
                        </div>

                        {/* Medium Tile 1 - Coding Practice */}
                        <div className="bento-card bento-medium bento-code">
                            <div className="bento-content">
                                <div className="bento-icon-wrapper" style={{background: 'var(--bento-code-color)'}}>
                                    <Code size={24} />
                                </div>
                                <h3>Coding Challenges</h3>
                                <p>Curated problems by role and difficulty.</p>
                            </div>
                            <div className="bento-visual visual-code"></div>
                        </div>

                        {/* Medium Tile 2 - Roadmaps */}
                        <div className="bento-card bento-medium bento-path">
                            <div className="bento-content">
                                <div className="bento-icon-wrapper" style={{background: 'var(--bento-path-color)'}}>
                                    <Target size={24} />
                                </div>
                                <h3>Dynamic Study Plans</h3>
                                <p>Custom learning paths based on your performance.</p>
                            </div>
                            <div className="bento-visual visual-path"></div>
                        </div>

                        {/* Small Tile 1 - Video Feed */}
                        <div className="bento-card bento-small bento-video">
                            <div className="bento-content">
                                <div className="bento-icon-wrapper mini" style={{color: 'var(--bento-video-color)'}}>
                                    <PlayCircle size={24} />
                                </div>
                                <h4>Tech Video Feed</h4>
                                <p>Short-form learning clips.</p>
                            </div>
                        </div>

                        {/* Small Tile 2 - Notes */}
                        <div className="bento-card bento-small bento-notes">
                            <div className="bento-content">
                                <div className="bento-icon-wrapper mini" style={{color: 'var(--bento-notes-color)'}}>
                                    <BookOpen size={24} />
                                </div>
                                <h4>Smart Notes</h4>
                                <p>Auto-generated from practice.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modern CTA Section */}
            <section className="landing-cta-modern">
                <div className="cta-glow-bg"></div>
                <div className="cta-content-wrapper">
                    <h2 className="cta-headline">Stop Preparing. Start Acing.</h2>
                    <p className="cta-subheadline">Join the platform designed to mirror real-world tech interviews.</p>
                    <button onClick={handleStartPracticing} className="btn-modern btn-cta-massive">
                        Get Started Now
                        <Zap size={20} className="btn-icon-right" />
                    </button>
                </div>
            </section>
        </div>
    )
}

export default Landing
