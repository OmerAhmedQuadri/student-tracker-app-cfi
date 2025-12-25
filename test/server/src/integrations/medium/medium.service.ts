import axios from 'axios';

export const getMediumStats = async (username: string) => {
  try {
    const feedUrl = `https://medium.com/feed/@${username}`;
    const res = await axios.get(feedUrl);
    
    // Simple XML parsing (regex) to count items
    const items = res.data.match(/<item>/g);
    const count = items ? items.length : 0;
    
    // Get last pub date
    const pubDateMatch = res.data.match(/<pubDate>(.*?)<\/pubDate>/);
    const lastPostDate = pubDateMatch ? new Date(pubDateMatch[1]) : null;

    return {
      blogsPublished: count, // This is only recent items in feed (usually last 10)
      lastBlogDate: lastPostDate
    };
  } catch (error) {
    console.error('Error fetching Medium stats:', error);
    return null;
  }
};
