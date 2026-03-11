// backend/controllers/youtubeController.js
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

exports.searchVideos = async (req, res) => {
    try {
        const { q: query, maxResults = 20 } = req.query;

        if (!query || query.trim() === '') {
            return res.status(400).json({ error: 'Search query cannot be empty' });
        }

        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

        if (!YOUTUBE_API_KEY) {
            return res.status(500).json({ error: 'YouTube API key is not configured on the server.' });
        }

        // 1. Search for videos
        const searchParams = new URLSearchParams({
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: maxResults,
            order: 'relevance',
            key: YOUTUBE_API_KEY,
            videoEmbeddable: 'true',
            safeSearch: 'moderate'
        });

        const searchResponse = await fetch(
            `${YOUTUBE_API_BASE_URL}/search?${searchParams.toString()}`
        );

        if (!searchResponse.ok) {
            const errorData = await searchResponse.json();
            return res.status(searchResponse.status).json({ 
                error: errorData.error?.message || 'Failed to fetch videos from YouTube' 
            });
        }

        const searchData = await searchResponse.json();

        if (!searchData.items || searchData.items.length === 0) {
            return res.status(200).json([]);
        }

        // 2. Get video IDs to fetch additional statistics (views/duration)
        const videoIds = searchData.items.map(item => item.id.videoId).join(',');

        const statsParams = new URLSearchParams({
            part: 'statistics,contentDetails',
            id: videoIds,
            key: YOUTUBE_API_KEY
        });

        const statsResponse = await fetch(
            `${YOUTUBE_API_BASE_URL}/videos?${statsParams.toString()}`
        );

        const statsData = statsResponse.ok ? await statsResponse.json() : null;

        // 3. Combine search results with statistics and return
        const videos = searchData.items.map((item, index) => {
            const stats = statsData?.items?.[index]?.statistics || {};
            const contentDetails = statsData?.items?.[index]?.contentDetails || {};

            return {
                id: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                viewCount: stats.viewCount || '0',
                likeCount: stats.likeCount || '0',
                duration: contentDetails.duration || 'N/A',
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`
            };
        });

        res.status(200).json(videos);

    } catch (error) {
        console.error('YouTube API Error in backend:', error);
        res.status(500).json({ error: 'Internal server error while fetching YouTube data' });
    }
};
