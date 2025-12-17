import axios from 'axios';
import { env } from '../../config/env';

const GITHUB_API_URL = 'https://api.github.com';

export const getGithubStats = async (username: string) => {
  try {
    const headers = env.githubToken ? { Authorization: `token ${env.githubToken}` } : {};
    
    const userRes = await axios.get(`${GITHUB_API_URL}/users/${username}`, { headers });
    const reposRes = await axios.get(`${GITHUB_API_URL}/users/${username}/repos?sort=updated&per_page=5`, { headers });
    
    // Events for commits (simplified)
    const eventsRes = await axios.get(`${GITHUB_API_URL}/users/${username}/events/public`, { headers });
    
    const pushEvents = eventsRes.data.filter((event: any) => event.type === 'PushEvent');
    const commitsCount = pushEvents.reduce((acc: number, event: any) => acc + event.payload.commits.length, 0);

    return {
      publicRepos: userRes.data.public_repos,
      followers: userRes.data.followers,
      lastActivity: eventsRes.data.length > 0 ? eventsRes.data[0].created_at : null,
      recentCommits: commitsCount, // This is only from recent public events
      recentRepos: reposRes.data.map((repo: any) => ({
        name: repo.name,
        url: repo.html_url,
        updatedAt: repo.updated_at
      }))
    };
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    return null;
  }
};
