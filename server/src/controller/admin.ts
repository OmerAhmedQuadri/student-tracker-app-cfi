import { asyncHandler } from "../middleware/asyncHandler";
import { StudentProfile } from "../models/StudentProfile";
import { User } from "../models/User";
import { Request, Response } from "express";

// get all users
export const getAllUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const users = await User.find().select('-password');
    res.json(users);
  }
);

// get all students
export const getAllStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const students = await User.find({ role: "student" });
    res.json(students);
  }
);

// get all mentors
export const getAllMentors = asyncHandler(
  async (req: Request, res: Response) => {
    const mentors = await User.find({ role: "mentor" });
    res.json(mentors);
  }
);

// get students by id
export const getStudentById = asyncHandler(
  async (req: Request, res: Response) => {
    const student = await User.findOne({ _id: req.params.id, role: "student" });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  }
);

// get mentors by id
export const getMentorById = asyncHandler(
  async (req: Request, res: Response) => {
    const mentor = await User.findOne({ _id: req.params.id, role: "mentor" });

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.json(mentor);
  }
);

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

// delete student or mentor
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ message: "User deleted successfully" });
});

// get all skills of the single student
export const getStudentSkills = asyncHandler(
  async (req: Request, res: Response) => {
    const studentProfile = await StudentProfile.findOne({
      userId: req.user!.id,
    }).populate("skills");

    if (!studentProfile) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      skills: studentProfile.skills,
    });
  }
);

// get all students with their skills
export const getAllStudentsWithSkills = asyncHandler(
  async (req: Request, res: Response) => {
    const students = await StudentProfile.find().populate("skills");

    if (students.length === 0) {
      return res.status(404).json({
        message: "There are no students with skills available",
      });
    }

    res.status(200).json({
      students,
    });
  }
);

// assign batch to user
export const assignBatch = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { batchId, batchIds } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle mentor with multiple batches
    if (user.role === "mentor") {
      // If batchIds array is provided, use it
      if (batchIds && Array.isArray(batchIds)) {
        user.batchIds = batchIds;
      } 
      // If single batchId provided, add it to batchIds array
      else if (batchId) {
        user.batchIds = user.batchIds || [];
        if (!user.batchIds.includes(batchId)) {
          user.batchIds.push(batchId);
        }
      }
    } 
    // Handle student with single batch
    else if (user.role === "student") {
      user.batchId = batchId;
    }

    await user.save();

    const updatedUser = await User.findById(userId).select('-password');
    res.json(updatedUser);
  }
);

// Add or remove batch from mentor
export const updateMentorBatches = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { action, batchId } = req.body; // action: 'add' or 'remove'

    const mentor = await User.findOne({ _id: userId, role: "mentor" });

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    mentor.batchIds = mentor.batchIds || [];

    if (action === "add" && !mentor.batchIds.includes(batchId)) {
      mentor.batchIds.push(batchId);
    } else if (action === "remove") {
      mentor.batchIds = mentor.batchIds.filter(id => id !== batchId);
    }

    await mentor.save();

    const updatedMentor = await User.findById(userId).select('-password');
    res.json(updatedMentor);
  }
);
