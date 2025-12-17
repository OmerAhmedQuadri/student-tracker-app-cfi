import type { Request, Response } from 'express';
import User from '../modules/user/user.model';
import { getGithubStats } from './github/github.service';
import { getMediumStats } from './medium/medium.service';
import { getLinkedinStats } from './linkedin/linkedin.service';

const extractMediumUsername = (input: string) => {
  const raw = (input || '').trim();
  if (!raw) return null;

  // Accept: "@username" or "username"
  if (raw.startsWith('@')) return raw.slice(1);
  if (!raw.includes('http') && !raw.includes('/')) return raw;

  // Accept common URLs:
  // - https://medium.com/@username
  // - https://username.medium.com
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const path = url.pathname || '';

    const atMatch = path.match(/\/\@([^/]+)/);
    if (atMatch?.[1]) return atMatch[1];

    if (host.endsWith('.medium.com')) {
      const sub = host.replace('.medium.com', '');
      if (sub && sub !== 'www') return sub;
    }
  } catch {
    // Not a URL
  }

  return null;
};

/**
 * Public-style helpers (still protected by auth in routes).
 * These let the frontend preview stats.
 */
export const getGithub = async (req: Request, res: Response) => {
  const username = req.params.username;
  const data = await getGithubStats(username);
  if (!data) return res.status(404).json({ message: 'GitHub user not found or rate-limited' });
  return res.json(data);
};

export const getMedium = async (req: Request, res: Response) => {
  const username = req.params.username;
  const data = await getMediumStats(username);
  if (!data) return res.status(404).json({ message: 'Medium feed not found' });
  return res.json(data);
};

export const getLinkedin = async (req: Request, res: Response) => {
  const profile = req.params.profileId;
  const data = await getLinkedinStats(profile);
  if (!data) {
    return res.json({
      supported: false,
      message: 'LinkedIn stats sync is not supported (no OAuth, no scraping). Store your LinkedIn profile link on your user profile instead.',
    });
  }
  return res.json(data);
};

/**
 * Sync external activity into the logged-in user's profile.
 * Keeps the app simple: we store only a few numbers + last activity dates.
 */
export const syncMyBranding = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.branding = user.branding || {};

    if (user.githubHandle) {
      const github = await getGithubStats(user.githubHandle);
      if (github) {
        user.branding.github = {
          commitsThisWeek: github.recentCommits,
          projectsPushed: (github.recentRepos || []).length,
          lastActivityAt: github.lastActivity ? new Date(github.lastActivity) : null,
        };
      }
    }

    if (user.mediumUrl) {
      const username = extractMediumUsername(user.mediumUrl);
      if (username) {
        const medium = await getMediumStats(username);
        if (medium) {
          user.branding.medium = {
            blogsPublished: medium.blogsPublished,
            lastBlogAt: medium.lastBlogDate ? new Date(medium.lastBlogDate) : null,
          };
        }
      }
    }

    // LinkedIn syncing is intentionally not implemented without OAuth.

    await user.save();

    return res.json({ message: 'Branding synced', branding: user.branding });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};
