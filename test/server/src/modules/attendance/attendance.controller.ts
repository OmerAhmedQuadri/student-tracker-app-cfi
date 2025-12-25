import { Request, Response } from 'express';
import Attendance from './attendance.model';

export const markAttendance = async (req: Request, res: Response) => {
  try {
        const { date, notes } = req.body;
    
    if (!req.user) {
        res.status(401).json({ message: 'User not found' });
        return;
    }

    // Check if already marked for this date
    const existing = await Attendance.findOne({
        user: req.user._id,
        date: new Date(date) // Assuming date is passed as string YYYY-MM-DD or ISO
    });

    if (existing) {
        res.status(400).json({ message: 'Attendance already marked for this date' });
        return;
    }

    const attendance = await Attendance.create({
      user: req.user._id,
      date: new Date(date),
            // Student marks attendance => always pending until mentor approves.
            status: 'pending',
      notes,
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const approveAttendance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'present', 'absent', 'cancelled'

        if (!req.user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        const attendance = await Attendance.findById(id);

        if (attendance) {
            attendance.status = status;
            attendance.approvedBy = req.user._id as any;
            await attendance.save();
            res.json(attendance);
        } else {
            res.status(404).json({ message: 'Attendance record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getAttendance = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        let query = {};
        if (req.user.role === 'student') {
            query = { user: req.user._id };
        } else {
            // Mentor/Admin can filter by user if provided in query params
            if (req.query.userId) {
                query = { user: req.query.userId };
            }
        }

        const attendance = await Attendance.find(query).populate('user', 'name email').sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
