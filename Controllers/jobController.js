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

    const job = new Job({
      title,
      description,
      location,
      skills,
      salary,
      jobType,
      category,
      applicationDeadline,
      employer: userId,
    });

    await job.save();

    res.status(200).json({ message: "Job creatd successfully.", job });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to create new job.", error });
  }
};

// Retrieve all jobs
export const getAllJob = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const jobs = await Job.find();
    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: "There are no jobs." });
    }

    res.status(200).json({
      message: "All jobs retrieved successfully",
      jobs: jobs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to retrieve jobs.", error });
  }
};

// Filter jobs by category
export const filterJobByCategory = async (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res
      .status(400)
      .json({ message: "Category is required in query parameters." });
  }

  try {
    const jobs = await Job.find({
      category: { $regex: new RegExp(category, "i") },
    });

    if (jobs.length === 0) {
      return res
        .status(404)
        .json({ message: `No jobs found for category: ${category}` });
    }

    res.status(200).json({
      message: `Jobs filtered by category: ${category}`,
      jobs,
    });
  } catch (error) {
    console.error("Error filtering jobs by category:", error);
    res
      .status(500)
      .json({ message: "Failed to filter jobs by category.", error });
  }
};


// Aply for the job with the resume
export const applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const { github, linkedIn } = req.body;
    const resume = req.file?.path;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if the user has already applied
    const applicant = job.applicants.find(
      (app) => app.applicantId.toString() === userId
    );

    if (applicant) {
      // If the user has already applied and has a resume, do not allow uploading another one
      if (applicant.resume) {
        return res.status(400).json({ message: "You have already applied for this job with a resume." });
      }
    }

    // If no resume was uploaded or the user is applying for the first time
    if (!resume) {
      return res.status(400).json({ message: "Resume file is required." });
    }

    // Add or update the applicant's resume and other details
    if (!applicant) {
      job.applicants.push({
        applicantId: userId,
        applicationDate: new Date(),
        applicationStatus: "Pending",
        resume,
        additionalInfo: {
          github,
          linkedIn,
        },
      });
    } else {
      // If user has applied previously, just update the resume and other details
      applicant.resume = resume;
      applicant.additionalInfo = { github, linkedIn };
    }

    await job.save();

    res.status(200).json({ message: "Successfully applied for the job" });
  } catch (error) {
    console.error("Application Error:", error);
    res.status(500).json({ message: "Failed to apply for the job", error });
  }
};
