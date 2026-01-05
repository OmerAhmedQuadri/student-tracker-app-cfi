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