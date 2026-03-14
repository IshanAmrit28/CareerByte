import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Award, BookOpen, CheckCircle, ExternalLink, PlayCircle } from 'lucide-react'
import { topicsData } from '../../data/topicsData'
import './TopicDetail.css'

const ContentRenderer = ({ content }) => {
    // Helper to process inline formatting (bold, code)
    const processInline = (text) => {
        const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
        return parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={idx}>{part.slice(1, -1)}</code>;
            }
            return part;
        });
    };

    // Split content by code blocks first
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
        <div className="section-content">
            {parts.map((part, mainIdx) => {
                // Return code blocks directly
                if (part.startsWith('```') && part.endsWith('```')) {
                    const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
                    const lang = match ? match[1] : '';
                    const code = match ? match[2] : part.slice(3, -3);
                    return (
                        <pre key={mainIdx}>
                            <code className={`language-${lang}`}>{code.trim()}</code>
                        </pre>
                    );
                }

                // Process standard text (lists and paragraphs)
                // Filter out empty strings from split
                if (!part.trim()) return null;

                const lines = part.split('\n');
                let inList = false;
                let listItems = [];
                const nodes = [];

                lines.forEach((line, lineIdx) => {
                    const isListItem = line.trim().startsWith('- ') || line.trim().startsWith('* ');

                    if (isListItem) {
                        if (!inList) {
                            inList = true;
                        }
                        listItems.push(line.trim().substring(2));
                    } else {
                        if (inList) {
                            // Flush list
                            nodes.push(
                                <ul key={`${mainIdx}-list-${lineIdx}`}>
                                    {listItems.map((item, i) => (
                                        <li key={i}>{processInline(item)}</li>
                                    ))}
                                </ul>
                            );
                            listItems = [];
                            inList = false;
                        }
                        // Add paragraph if not empty
                        if (line.trim()) {
                            nodes.push(
                                <p key={`${mainIdx}-p-${lineIdx}`} style={{ marginBottom: 12 }}>
                                    {processInline(line)}
                                </p>
                            );
                        }
                    }
                });

                // Flush remaining list
                if (inList) {
                    nodes.push(
                        <ul key={`${mainIdx}-list-end`}>
                            {listItems.map((item, i) => (
                                <li key={i}>{processInline(item)}</li>
                            ))}
                        </ul>
                    );
                }

                return nodes;
            })}
        </div>
    );
};

function TopicDetail() {
    const { topicId } = useParams()
    const navigate = useNavigate()
    const topic = topicsData[topicId]

    if (!topic) {
        return (
            <div className="topic-detail-container">
                <div style={{ textAlign: 'center', padding: 60, color: 'white' }}>
                    <h2>Topic Not Found</h2>
                    <br />
                    <Link to="/candidate/dashboard" className="back-btn">← Back to Dashboard</Link>
                </div>
            </div>
        )
    }

    const handleComplete = () => {
        alert(`Congratulations! You've completed "${topic.title}" and earned 50 XP!`)
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 px-4 md:px-8 pb-12 font-sans overflow-x-hidden relative">
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[80px] opacity-70 pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[80px] opacity-70 pointer-events-none" />
            
            <div className="max-w-7xl mx-auto relative z-10 w-full">
                {/* Header */}
                <div className="topic-header glass-card" style={{ marginTop: 24 }}>
                    <button onClick={() => navigate('/candidate/dashboard')} className="back-btn">
                        <ArrowLeft size={18} /> Back to Dashboard
                    </button>

                    <div className="topic-title-section">
                        <h1 className="topic-title">{topic.title}</h1>
                        <p className="topic-description">{topic.description}</p>
                    </div>

                    <div className="topic-meta">
                        <span className={`meta-badge badge-${topic.difficulty === 'Hard' ? 'orange' : topic.difficulty === 'Medium' ? 'blue' : 'green'}`}>
                            {topic.difficulty}
                        </span>
                        <span className="meta-badge badge-purple">{topic.category}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                            <Clock size={14} /> {topic.time}
                        </span>
                    </div>
                </div>

                {/* Overview */}
                <div className="glass-card" style={{ marginBottom: 32 }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
                        <Award size={20} className="text-primary" /> What You'll Learn
                    </h3>
                    <p style={{ margin: '0 0 24px 0', lineHeight: 1.8, color: 'var(--text-secondary)' }}>{topic.overview}</p>
                    <div className="section-content">
                        <ul>
                            {topic.keyPoints.map((point, idx) => (
                                <li key={point}>{point}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="topic-content">
                    {topic.sections.map((section, idx) => (
                        <div key={section.title} className="content-section glass-card">
                            <h2 className="section-title">{section.title}</h2>
                            <ContentRenderer content={section.content} />
                        </div>
                    ))}
                </div>

                {/* Two Column Layout */}
                <div className="topic-sidebar-layout">

                    {/* Practice Problems */}
                    <div className="sidebar-section">
                        <h3>Practice Problems</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {topic.practiceProblems.map((problem, idx) => (
                                <a
                                    key={problem.title}
                                    href={problem.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="practice-card-item"
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600, fontSize: 15 }}>{problem.title}</span>
                                        <span className={`meta-badge badge-${problem.difficulty === 'Hard' ? 'orange' : problem.difficulty === 'Medium' ? 'blue' : 'green'}`} style={{ fontSize: 11 }}>
                                            {problem.difficulty}
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Resources */}
                    <div className="sidebar-section">
                        <h3>Resources</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {topic.resources.map((resource, idx) => (
                                <a
                                    key={resource.link}
                                    href={resource.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="resource-card-item"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div className="resource-icon-wrapper">
                                            <BookOpen size={20} />
                                        </div>
                                        <div style={{ flexGrow: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{resource.title}</div>
                                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{resource.type}</div>
                                        </div>
                                        <ExternalLink size={16} color="var(--text-muted)" />
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* Complete Button */}
                        <button
                            onClick={handleComplete}
                            className="complete-btn"
                            style={{
                                marginTop: 32
                            }}
                        >
                            <CheckCircle size={20} /> Mark as Complete
                        </button>
                    </div>


                </div>

                {/* Video Tutorials Section */}
                {topic.videos && topic.videos.length > 0 && (
                    <div className="glass-card" style={{ marginTop: 32 }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
                            <PlayCircle size={20} className="text-secondary" /> Video Tutorials
                        </h3>
                        <div className="video-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                            {topic.videos.map((video, idx) => (
                                <a
                                    key={video.link}
                                    href={video.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="video-card"
                                    style={{
                                        textDecoration: 'none',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 12,
                                        overflow: 'hidden',
                                        transition: 'transform 0.2s',
                                        display: 'block'
                                    }}
                                >
                                    <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                                        {/* Thumbnail placeholder or actual image if provided */}
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', background: `url(https://img.youtube.com/vi/${getYouTubeId(video.link)}/hqdefault.jpg) center/cover no-repeat`
                                        }}>
                                            <div style={{
                                                background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: 12
                                            }}>
                                                <PlayCircle size={32} fill="white" stroke="white" />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ padding: 12 }}>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.title}</h4>
                                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{video.channel || 'YouTube'}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function getYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export default TopicDetail
