import { asyncHandler } from "../middleware/asyncHandler";
import { User } from "../models/User";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { StudentProfile } from "../models/StudentProfile";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const createStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, batchId } = req.body;

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
      batch: batchId || null,
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

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const updateUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  }
);

export const getUsersByRole = asyncHandler(
  async (req: Request, res: Response) => {
    const role = req.params.role;

    if (!["student", "mentor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const users = await User.find({ role });

    res.json(users);
  }
);

export const deactivateUser = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deactivated successfully" });
  }
);

export const activateUser = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User activated successfully" });
  }
);
