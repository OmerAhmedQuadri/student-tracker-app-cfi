    import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface JwtPayload {
  id: string;
  role: "student" | "mentor" | "admin";
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  if (!accessToken && !refreshToken) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      env.JWT_ACCESS_SECRET
    ) as JwtPayload;

    req.user = {
      id: decoded.id as any, // mongoose will cast
      role: decoded.role,
    };

    return next();
  } catch (error) {
    if (!refreshToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    try {
      const decodedRefresh = jwt.verify(
        refreshToken,
        env.JWT_REFRESH_SECRET
      ) as JwtPayload;

      const newAccessToken = jwt.sign(
        { id: decodedRefresh.id, role: decodedRefresh.role },
        env.JWT_ACCESS_SECRET,
        { expiresIn: "1d" }
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      req.user = {
        id: decodedRefresh.id as any,
        role: decodedRefresh.role,
      };

      return next();
    } catch (refreshError) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.status(401).json({ message: "Session expired, please login again" });
    }
  }
};
