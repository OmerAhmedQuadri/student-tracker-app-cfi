import {asyncHandler} from '../middleware/asyncHandler';
import { User } from '../models/User';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { StudentProfile } from '../models/StudentProfile';

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, batchId } = req.body;

    if(!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingStudent = await User.findOne({email});

    if(existingStudent) {
        return res.status(409).json({ message: 'Student with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new User({
        name,
        email,
        password: hashedPassword,
        role: 'student',
        batch: batchId || null,
        status: 'active',
        isActive: true
    });

    await StudentProfile.create({ userId: student._id, stage: 'beginner' });

    await student.save();

    res.status(201).json({ message: 'Student created successfully', studentId: student._id });
})

export const createMentor = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if(!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingMentor = await User.findOne({email});
    
    if(existingMentor) {
        return res.status(409).json({ message: 'Mentor with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const mentor = new User({
        name,
        email,
        password: hashedPassword,
        role: 'mentor',
        status: 'pending',
        isActive: true
    });

    await mentor.save();

    res.status(201).json({ message: 'Mentor created successfully', mentorId: mentor._id });
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
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
});
