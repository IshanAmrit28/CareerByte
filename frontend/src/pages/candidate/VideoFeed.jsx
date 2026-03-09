import { useState } from 'react';
import { Search, Play, ExternalLink, Loader, Youtube, TrendingUp } from 'lucide-react';
import { searchVideos, formatViewCount, formatPublishDate, formatDuration } from '../../utils/youtubeService';
import AnimatedBackground from '../../components/AnimatedBackground';
import './VideoFeed.css';

function VideoFeed() {
    const [searchQuery, setSearchQuery] = useState('');
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            setError('Please enter a skill or course name');
            return;
        }

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const results = await searchVideos(searchQuery, 20);
            setVideos(results);

            if (results.length === 0) {
                setError('No videos found. Try a different search term.');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch videos. Please try again.');
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoClick = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="video-feed-page">
            <AnimatedBackground />

            <div className="video-feed-container">
                {/* Header Section */}
                <div className="video-feed-header">
                    <div className="header-content">
                        <div className="header-icon">
                            <Youtube size={32} />
                        </div>
                        <div className="header-text">
                            <h1>Video Learning Hub</h1>
                            <p>Discover top educational videos for any skill or course</p>
                        </div>
                    </div>
                </div>

                {/* Search Section */}
                <div className="search-section">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-input-wrapper">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search for skills, courses, or topics (e.g., React Tutorial, Python Programming)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className="search-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader className="spinner" size={20} />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Search size={20} />
                                    Search
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="loading-state">
                        <Loader className="spinner-large" size={48} />
                        <p>Finding the best videos for you...</p>
                    </div>
                )}

                {/* Empty State */}
                {!hasSearched && !loading && (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <TrendingUp size={64} />
                        </div>
                        <h2>Start Your Learning Journey</h2>
                        <p>Search for any skill or course to discover curated video tutorials</p>
                        <div className="suggested-searches">
                            <p className="suggested-label">Popular searches:</p>
                            <div className="suggested-tags">
                                {['React Tutorial', 'Python Programming', 'Machine Learning', 'Web Development', 'Data Structures'].map((tag) => (
                                    <button
                                        key={tag}
                                        className="suggested-tag"
                                        onClick={() => {
                                            setSearchQuery(tag);
                                            // Trigger search after setting query
                                            setTimeout(() => {
                                                const form = document.querySelector('.search-form');
                                                form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                                            }, 100);
                                        }}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Video Results */}
                {!loading && videos.length > 0 && (
                    <div className="video-results">
                        <div className="results-header">
                            <h2>Top {videos.length} Results</h2>
                            <p>for "{searchQuery}"</p>
                        </div>

                        <div className="videos-grid">
                            {videos.map((video) => (
                                <div
                                    key={video.id}
                                    className="video-card"
                                    onClick={() => handleVideoClick(video.url)}
                                >
                                    <div className="video-thumbnail">
                                        <img src={video.thumbnail} alt={video.title} />
                                        <div className="play-overlay">
                                            <Play size={48} fill="white" />
                                        </div>
                                        {video.duration !== 'N/A' && (
                                            <div className="video-duration">
                                                {formatDuration(video.duration)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="video-info">
                                        <h3 className="video-title">{video.title}</h3>

                                        <div className="video-channel">
                                            <span>{video.channelTitle}</span>
                                        </div>

                                        <div className="video-meta">
                                            <span className="video-views">
                                                {formatViewCount(video.viewCount)}
                                            </span>
                                            <span className="video-separator">•</span>
                                            <span className="video-date">
                                                {formatPublishDate(video.publishedAt)}
                                            </span>
                                        </div>

                                        <div className="video-action">
                                            <ExternalLink size={16} />
                                            <span>Watch on YouTube</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results State */}
                {!loading && hasSearched && videos.length === 0 && !error && (
                    <div className="no-results-state">
                        <h2>No videos found</h2>
                        <p>Try searching with different keywords</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VideoFeed;
