// src/modules/auth/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../user/user.model";
import { env } from "../../config/env";
import {
  clearAuthCookies,
  generateAccessToken,
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
  type AuthJwtPayload,
} from "./auth.service";

type DecodedToken = AuthJwtPayload;

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = getAccessTokenFromRequest(req);

  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret) as DecodedToken;

    // Allow legacy tokens that don't include `type`
    if (decoded.type && decoded.type !== 'access') {
      return res.status(401).json({ message: 'Not authorized, invalid token type' });
    }

    const user = await User.findById(decoded.id)
      .select("_id role email")
      .lean();

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Attach ONLY AuthUser (not mongoose document)
    req.user = {
      _id: user._id,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    // If access token expired, attempt refresh-flow
    if (error && typeof error === 'object' && (error as any).name === 'TokenExpiredError') {
      const refreshToken = getRefreshTokenFromRequest(req);
      if (!refreshToken) {
        clearAuthCookies(res);
        return res.status(401).json({ message: 'Session expired, please log in again' });
      }

      try {
        const decodedRefresh = jwt.verify(refreshToken, env.jwtRefreshSecret) as DecodedToken;
        if (decodedRefresh.type && decodedRefresh.type !== 'refresh') {
          clearAuthCookies(res);
          return res.status(401).json({ message: 'Session expired, please log in again' });
        }

        const user = await User.findById(decodedRefresh.id)
          .select("_id role email")
          .lean();

        if (!user) {
          clearAuthCookies(res);
          return res.status(401).json({ message: 'Session expired, please log in again' });
        }

        const newAccessToken = generateAccessToken(user._id.toString());

        // Update cookie for cookie-based clients
        const isProd = env.nodeEnv === 'production';
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
          maxAge: 24 * 60 * 60 * 1000,
          path: '/',
        });
        // Keep legacy cookie name in sync
        res.cookie('token', newAccessToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
          maxAge: 24 * 60 * 60 * 1000,
          path: '/',
        });

        // Also expose the new access token for header-based clients
        res.setHeader('x-access-token', newAccessToken);

        req.user = {
          _id: user._id,
          role: user.role,
          email: user.email,
        };

        return next();
      } catch {
        clearAuthCookies(res);
        return res.status(401).json({ message: 'Session expired, please log in again' });
      }
    }

    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const admin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role === "admin") {
    return next();
  }

  return res.status(401).json({ message: "Not authorized as an admin" });
};

export const mentor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role === "mentor" || req.user?.role === "admin") {
    return next();
  }

  return res.status(401).json({ message: "Not authorized as a mentor" });
};
