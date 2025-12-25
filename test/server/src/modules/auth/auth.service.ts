import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

type TokenType = 'access' | 'refresh';

export interface AuthJwtPayload {
	id: string;
	type?: TokenType;
}

const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';
// Backward-compat cookie name used previously by the app
const LEGACY_COOKIE = 'token';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;

export const generateAccessToken = (userId: string) => {
	return jwt.sign({ id: userId, type: 'access' } satisfies AuthJwtPayload, env.jwtAccessSecret, {
		expiresIn: '1d',
	});
};

export const generateRefreshToken = (userId: string) => {
	return jwt.sign({ id: userId, type: 'refresh' } satisfies AuthJwtPayload, env.jwtRefreshSecret, {
		expiresIn: '7d',
	});
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
	const isProd = env.nodeEnv === 'production';

	const base = {
		httpOnly: true,
		secure: isProd,
		sameSite: isProd ? ('none' as const) : ('lax' as const),
		path: '/',
	};

	res.cookie(ACCESS_COOKIE, accessToken, { ...base, maxAge: ONE_DAY_MS });
	res.cookie(REFRESH_COOKIE, refreshToken, { ...base, maxAge: SEVEN_DAYS_MS });
	// Keep older clients working (was 30d before, now matches access token lifetime)
	res.cookie(LEGACY_COOKIE, accessToken, { ...base, maxAge: ONE_DAY_MS });
};

export const clearAuthCookies = (res: Response) => {
	res.clearCookie(ACCESS_COOKIE, { path: '/' });
	res.clearCookie(REFRESH_COOKIE, { path: '/' });
	res.clearCookie(LEGACY_COOKIE, { path: '/' });
};

export const getAccessTokenFromRequest = (req: Request) => {
	const cookieToken = (req as any).cookies?.[ACCESS_COOKIE] as string | undefined;
	const legacyCookieToken = (req as any).cookies?.[LEGACY_COOKIE] as string | undefined;

	const authHeader = req.headers.authorization;
	const headerToken =
		authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;

	return cookieToken || legacyCookieToken || headerToken;
};

export const getRefreshTokenFromRequest = (req: Request) => {
	const cookieToken = (req as any).cookies?.[REFRESH_COOKIE] as string | undefined;
	const headerToken = req.headers['x-refresh-token'];
	const headerValue = Array.isArray(headerToken) ? headerToken[0] : headerToken;
	return cookieToken || (typeof headerValue === 'string' ? headerValue : undefined);
};

