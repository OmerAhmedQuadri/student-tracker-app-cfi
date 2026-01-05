import { asyncHandler } from "../middleware/asyncHandler";
import { User } from "../models/User";
import { Request, Response } from "express";

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
        const student = await User.findOne({_id: req.params.id, role: "student"});

        if(!student){
            return res.status(404).json({message: "Student not found"});
        }

        res.json(student);
    }
)

// get mentors by id 
export const getMentorById = asyncHandler(
    async (req: Request, res: Response) => {
        const mentor = await User.findOne({_id: req.params.id, role: "mentor"});

        if(!mentor){
            return res.status(404).json({message: "Mentor not found"});
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
export const deleteUser = asyncHandler(
    async (req: Request, res: Response) => {
        const user = await User.findByIdAndDelete(req.params.id);

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        res.json({message: "User deleted successfully"});
    }
)