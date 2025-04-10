import mongoose from "mongoose";
import Job from "../Models/jobModel.js";
import User from "../Models/userModel.js";

export const createNewJob = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      skills,
      salary,
      jobType,
      category,
      applicationDeadline,
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      !skills ||
      !salary ||
      !jobType ||
      !category ||
      !applicationDeadline
    ) {
      res.status(301).json({ message: "all fields is required." });
    }

    const userId = req.user.id;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isExist = await Job.findOne({
      title: title,
      description,
      location,
      skills,
    });

    if (isExist) {
      return res.status(401).json({ message: "Job already created.", job });
    }

    const job = await new Job({
      title,
      description,
      location,
      skills,
      salary,
      jobType,
      category,
      applicationDeadline,
    });

    await job.save();

    res.status(200).json({ message: "Job creatd successfully.", job });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to create new job.", error });
  }
};
