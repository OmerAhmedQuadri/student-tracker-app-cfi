import type { Request, Response } from 'express';
import Assignment from './assignment.model';
import User from '../user/user.model';

/**
 * Student: view own assignments.
 * Mentor/Admin: can filter by student via query `studentId`.
 */
export const getAssignments = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const isStudent = req.user.role === 'student';

    const query: any = {};
    if (isStudent) {
      query.student = req.user._id;
    } else if (req.query.studentId) {
      query.student = req.query.studentId;
    }

    const items = await Assignment.find(query)
      .populate('student', 'name email')
      .populate('skill', 'name')
      .sort({ createdAt: -1 });

    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

/**
 * Mentor/Admin: create assignment for a student.
 * Body: { studentId, title, skillId?, dueDate? }
 */
export const createAssignment = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.role === 'student') {
      return res.status(403).json({ message: 'Only mentor/admin can create assignments' });
    }

    const { studentId, title, skillId, dueDate } = req.body as {
      studentId: string;
      title: string;
      skillId?: string;
      dueDate?: string;
    };

    const student = await User.findById(studentId).select('_id');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const assignment = await Assignment.create({
      student: student._id,
      createdBy: req.user._id,
      title,
      skill: skillId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: 'pending',
    });

    return res.status(201).json(assignment);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

/**
 * Student: submit an assignment.
 * Body: { timeSpentMinutes?, notes? }
 */
export const submitAssignment = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    if (req.user.role === 'student' && assignment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const { timeSpentMinutes, notes } = req.body as {
      timeSpentMinutes?: number;
      notes?: string;
    };

    assignment.timeSpentMinutes = timeSpentMinutes;
    assignment.notes = notes;
    assignment.submittedAt = new Date();

    // simple “late” detection
    if (assignment.dueDate && assignment.submittedAt > assignment.dueDate) {
      assignment.status = 'late';
    } else {
      assignment.status = 'submitted';
    }

    await assignment.save();
    return res.json(assignment);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

/**
 * Mentor/Admin: review (approve/reject) and optionally score.
 * Body: { status: 'approved'|'rejected', score?, notes? }
 */
export const reviewAssignment = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.role === 'student') {
      return res.status(403).json({ message: 'Only mentor/admin can review assignments' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const { status, score, notes } = req.body as {
      status: 'approved' | 'rejected';
      score?: number;
      notes?: string;
    };

    assignment.status = status;
    assignment.score = typeof score === 'number' ? Math.max(0, Math.min(100, score)) : assignment.score;
    assignment.notes = notes ?? assignment.notes;
    assignment.reviewedAt = new Date();

    await assignment.save();

    // Award points on approved + scored assignments
    if (assignment.status === 'approved' && typeof assignment.score === 'number') {
      const points = Math.floor(assignment.score / 10); // 0-10
      if (points > 0) {
        await User.updateOne({ _id: assignment.student }, { $inc: { totalPoints: points } });
      }
    }

    return res.json(assignment);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};
