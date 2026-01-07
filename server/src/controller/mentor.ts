import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { StudentProfile } from "../models/StudentProfile";
import { Skill } from "../models/Skills";
import { SkillTopic } from "../models/SkillTopic";

// add skills to the student profile
export const addSkills = asyncHandler(async (req: Request, res: Response) => {
  const { name, order } = req.body;

  const studentProfile = await StudentProfile.findOne({
    userId: req.user!.id,
  });

  if (!studentProfile) {
    return res.status(404).json({
      message: "Student profile not found",
    });
  }

  const newSkill = new Skill({ name, order });

  await newSkill.save();

  studentProfile.skills.push(newSkill._id);

  await studentProfile.save();

  res.status(200).json({
    message: "Skill added successfully",
  });
});

// update skill of the student
export const updateStudentSkill = asyncHandler(async (req: Request, res: Response) => {
  const { skillId } = req.params;
  const { name, order } = req.body;

  const skill = await Skill.findById(skillId);

  if (!skill) {
    return res.status(404).json({
      message: "Skill not found",
    });
  }

  if (name) skill.name = name;
  if (order !== undefined) skill.order = order;

  await skill.save();

  res.status(200).json({
    message: "Skill updated successfully",
  });
});

// delete skill of the student
export const deleteStudentSkill = asyncHandler(async (req: Request, res: Response) => {
  const { skillId } = req.params;

  const skill = await Skill.findById(skillId);

  if (!skill) {
    return res.status(404).json({
      message: "Skill not found",
    });
  }

  // remove skill from student profile
  const studentProfile = await StudentProfile.findOne({
    userId: req.user!.id,
  });

  if (studentProfile) {
    studentProfile.skills = studentProfile.skills.filter(
      (s) => s.toString() !== skillId
    );
    await studentProfile.save();
  }

  await skill.deleteOne();

  res.status(200).json({
    message: "Skill deleted successfully",
  });
});

// add skillsTopic to the student profile 
export const addSkillsTopic = asyncHandler(async (req: Request, res: Response) => {
  const {title, difficulty, estimatedMinutes} = req.body;

  if(!title || !difficulty || !estimatedMinutes){
    return res.status(400).json({message: "All fields are required"});
  }

  const newSkillTopic = new SkillTopic({
    title,
    difficulty,
    estimatedMinutes
  });

  await newSkillTopic.save();

  res.status(200).json({
    message: "skill topic added successfully"
  })
});

//updated skill topic 
export const updateSkillTopic = asyncHandler(async (req: Request, res: Response) => {
  const { skillId } = req.params;
  const { title, difficulty, estimatedMinutes } = req.body;

  const skillTopic = await SkillTopic.findById(skillId);

  if (!skillTopic) {
    return res.status(404).json({
      message: "Skill topic not found",
    });
  }

  if (title) skillTopic.title = title;
  if (difficulty) skillTopic.difficulty = difficulty;
  if (estimatedMinutes !== undefined) skillTopic.estimatedMinutes = estimatedMinutes;

  await skillTopic.save();

  res.status(200).json({
    message: "Skill topic updated successfully",
  });
});

//delete skill topic 
export const deleteSkillTopic = asyncHandler(async (req: Request, res: Response)  => {
  const { skillId } = req.params;

  const skillTopic = await SkillTopic.findById(skillId);

  if (!skillTopic) {
    return res.status(404).json({
      message: "Skill topic not found",
    });
  }

  await skillTopic.deleteOne();

  res.status(200).json({
    message: "Skill topic deleted successfully",
  });
});

// get all skills topics 
export const getAllSkillsTopics = asyncHandler(async (req: Request, res: Response) => {
  const skillTopics = await SkillTopic.find();

  res.status(200).json({
    skillTopics,
  })
})