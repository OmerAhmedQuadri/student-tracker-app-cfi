import { asyncHandler } from "../middleware/asyncHandler";
import { User } from "../models/User";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { StudentProfile } from "../models/StudentProfile";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const createAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      return res
        .status(409)
        .json({ message: "Admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      status: "active",
      isActive: true,
    });

    await admin.save();

    res
      .status(201)
      .json({ message: "Admin created successfully", adminId: admin._id });
  }
);

export const createStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, batch, phone } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const existingStudent = await User.findOne({ email });

    if (existingStudent) {
      return res
        .status(409)
        .json({ message: "Student with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new User({
      name,
      email,
      password: hashedPassword,
      role: "student",
      batchId: batch || null,
      phone: phone || null,
      status: "active",
      isActive: true,
    });

    await StudentProfile.create({ userId: student._id, stage: "beginner" });

    await student.save();

    res
      .status(201)
      .json({
        message: "Student created successfully",
        studentId: student._id,
      });
  }
);

export const createMentor = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const existingMentor = await User.findOne({ email });

    if (existingMentor) {
      return res
        .status(409)
        .json({ message: "Mentor with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const mentor = new User({
      name,
      email,
      password: hashedPassword,
      role: "mentor",
      status: "pending",
      isActive: true,
      batchIds: [], // Initialized as empty
    });

    await mentor.save();

    res
      .status(201)
      .json({ message: "Mentor created successfully", mentorId: mentor._id });
  }
);

// login for all the roles
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.password) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  if (!user.isActive || user.status === "suspended") {
    return res.status(403).json({
      message: "Account is suspended or inactive",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?.id;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Old password and new password are required" });
  }

  const user = await User.findById(userId).select("+password");

  if (!user || !user.password) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect old password" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
});

