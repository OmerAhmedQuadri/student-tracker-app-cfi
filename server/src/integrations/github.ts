import axios from "axios";
import { env } from "../config/env";

interface GithubStats {
    commitsLastWeek: number;
    recentProjects: string[];
    lastActivity: Date | null;
}

export const fetchGithubStats = async (username: string): Promise<GithubStats> => {
    if(!username) {
        return {
            commitsLastWeek: 0,
            recentProjects: [],
            lastActivity: null
        };
    }

    try {
        const headers: any = {
            'Accept': 'application/vnd.github.v3+json'
        };
        
        if (env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${env.GITHUB_TOKEN}`;
        }

        // 1. Fetch Events for commit activity
        const eventsResponse = await axios.get(`https://api.github.com/users/${username}/events`, { headers });
        const events = eventsResponse.data;

        // Calc commits in last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        let commitsLastWeek = 0;
        let lastActivity = null;

        if (events.length > 0) {
            lastActivity = new Date(events[0].created_at);
        }

        events.forEach((event: any) => {
            const eventDate = new Date(event.created_at);
            if (eventDate >= oneWeekAgo && event.type === 'PushEvent') {
               commitsLastWeek += event.payload.commits.length;
            }
        });

        // 2. Fetch Repos for recent projects
        const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`, { headers });
        const recentProjects = reposResponse.data.map((repo: any) => repo.name);

        return {
            commitsLastWeek,
            recentProjects,
            lastActivity
        };

    } catch (error) {
        console.error(`Error fetching GitHub stats for ${username}:`, error);
        return {
            commitsLastWeek: 0,
            recentProjects: [],
            lastActivity: null
        };
    }
};
