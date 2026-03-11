import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Code2, 
    BookOpen, 
    Trophy, 
    CheckCircle2, 
    ChevronRight, 
    Zap, 
    Terminal,
    Search,
    Filter
} from 'lucide-react';
import { toast } from 'sonner';
import codingService from '../../services/coding.service';
import './CodingProblems.css';

const CodingProblems = () => {
    const navigate = useNavigate();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const data = await codingService.getAllProblems();
                setProblems(data.problems);
            } catch (err) {
                toast.error("Failed to load problems");
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    const filteredProblems = problems.filter(p => {
        const matchesFilter = filter === 'All' || p.difficulty === filter;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const difficultyColors = {
        'Easy': 'bg-green-500/10 text-green-500 border-green-500/20',
        'Medium': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        'Hard': 'bg-red-500/10 text-red-500 border-red-500/20'
    };

    return (
        <div className="coding-problems-container">
            <header className="page-header">
                <div className="header-content">
                    <div className="title-section">
                        <div className="icon-wrapper">
                            <Terminal size={32} className="text-blue-500" />
                        </div>
                        <div>
                            <h1>Master Data Structures</h1>
                            <p>Solve high-impact DSA problems with our secure development environment.</p>
                        </div>
                    </div>
                    <div className="stats-section">
                        <div className="stat-card">
                            <span className="stat-value">{problems.length}</span>
                            <span className="stat-label">Total Problems</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value text-green-500">
                                {problems.filter(p => p.difficulty === 'Easy').length}
                            </span>
                            <span className="stat-label">Easy</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value text-yellow-500">
                                {problems.filter(p => p.difficulty === 'Medium').length}
                            </span>
                            <span className="stat-label">Medium</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value text-red-500">
                                {problems.filter(p => p.difficulty === 'Hard').length}
                            </span>
                            <span className="stat-label">Hard</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="content-grid">
                <section className="controls-bar">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search problems by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filter-tabs">
                        {['All', 'Easy', 'Medium', 'Hard'].map(f => (
                            <button 
                                key={f}
                                className={`filter-tab ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </section>

                <div className="problems-list">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="problem-card skeleton" />
                        ))
                    ) : filteredProblems.length > 0 ? (
                        filteredProblems.map((problem) => (
                            <div 
                                key={problem._id} 
                                className="problem-card group"
                                onClick={() => navigate(`/candidate/practice/${problem._id}`)}
                            >
                                <div className="problem-main">
                                    <div className="status-indicator">
                                        <Code2 size={24} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    <div className="problem-info">
                                        <h3>{problem.title}</h3>
                                        <div className="problem-meta">
                                            <span className={`difficulty-badge ${difficultyColors[problem.difficulty]}`}>
                                                {problem.difficulty}
                                            </span>
                                            <span className="time-limit flex items-center gap-1">
                                                <Zap size={14} /> {problem.timeLimit}s
                                            </span>
                                            <span className="category flex items-center gap-1">
                                                <BookOpen size={14} /> DSA
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="problem-actions">
                                    <button className="solve-button">
                                        Solve Now <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <BookOpen size={48} className="empty-icon" />
                            <h3>No problems found</h3>
                            <p>Try adjusting your search or filter criteria.</p>
                        </div>
                    )}
                </div>

                <aside className="sidebar-info">
                    <div className="info-card premium-card">
                        <h4><Trophy className="text-yellow-500" /> Coding Achievement</h4>
                        <p>Complete 5 problems this week to earn a "Problem Solver" badge on your profile.</p>
                        <div className="progress-mini">
                            <div className="progress-bar" style={{ width: '40%' }}></div>
                        </div>
                    </div>
                    
                    <div className="info-card">
                        <h4>💡 Pro Tips</h4>
                        <ul className="tips-list">
                            <li>Focus on time complexity.</li>
                            <li>Write clean, modular code.</li>
                            <li>Test with edge cases.</li>
                            <li>Try multiple languages.</li>
                        </ul>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default CodingProblems;
