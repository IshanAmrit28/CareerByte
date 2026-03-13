/**
 * YouTube API Service
 * Handles all YouTube Data API v3 interactions
 */

import { API_BASE_URL } from '../constants';

/**
 * Search for YouTube videos based on a query
 * @param {string} query - Search query (skill or course name)
 * @param {number} maxResults - Maximum number of results to return (default: 20)
 * @returns {Promise<Array>} Array of video objects
 */
export async function searchVideos(query, maxResults = 20) {
    if (!query || query.trim() === '') {
        throw new Error('Search query cannot be empty');
    }

        try {
            const searchParams = new URLSearchParams({
                q: query,
                maxResults: maxResults.toString()
            });

            // Call the secure backend which houses the actual YOUTUBE_API_KEY
            const response = await fetch(`${API_BASE_URL}/youtube/search?${searchParams.toString()}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch videos from server');
            }

            const videos = await response.json();
            return videos;
        } catch (error) {
            console.error('YouTube Backend API Error:', error);
            throw error;
        }
}

/**
 * Format view count to human-readable format
 * @param {string|number} count - View count
 * @returns {string} Formatted view count
 */
export function formatViewCount(count) {
    const num = parseInt(count.toString(), 10);

    if (isNaN(num)) return '0 views';

    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M views`;
    } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K views`;
    }

    return `${num} views`;
}

/**
 * Format publish date to relative time
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string
 */
export function formatPublishDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;

    return `${Math.floor(diffInDays / 365)} years ago`;
}

/**
 * Parse ISO 8601 duration to readable format
 * @param {string} duration - ISO 8601 duration string (e.g., "PT15M33S")
 * @returns {string} Formatted duration
 */
export function formatDuration(duration) {
    if (!duration || duration === 'N/A') return 'N/A';

    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    if (!match) return 'N/A';

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    let result = '';

    if (hours) result += `${hours}:`;
    if (minutes) result += hours ? minutes.padStart(2, '0') : minutes;
    else result += '0';
    result += ':';
    result += seconds ? seconds.padStart(2, '0') : '00';

    return result;
}
