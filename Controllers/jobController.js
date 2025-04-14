import mongoose from "mongoose";
import Job from "../Models/jobModel.js";
import User from "../Models/userModel.js";
import { sendMailNotification } from "../Helpers/sendMail.js";

// Create a new job
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

    // Validate required fields
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
      return res.status(400).json({ message: "All fields are required." });
    }

    const userId = req.user.id;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    // Check the jog is exist or not
    const isExist = await Job.findOne({
      title,
      description,
      location,
      skills,
    });

    if (isExist) {
      return res.status(409).json({ message: "Job already exists." });
    }

    // Create a new job
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

    // Add the job to the employer's list of jobs
    user.myJobs.push(job._id);
    await user.save();

    return res.status(201).json({ message: "Job created successfully.", job });
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(500).json({ message: "Failed to create new job.", error });
  }
};

// Retrieve my job
export const getMyJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    // Check if the user is an employer
    const myJobs = await Job.find({ employer: userId });
    if (!myJobs || myJobs.length === 0) {
      return res.status(404).json({ message: "There are no jobs." });
    }
    res.status(200).json({
      message: "My jobs retrieved successfully",
      myJobs: myJobs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to retrieve my jobs.", error });
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

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has already applied
    const applicant = job.applicants.find(
      (app) => app.applicantId.toString() === userId
    );

    if (applicant) {
      // If the user has already applied and has a resume, do not allow uploading another one
      if (applicant.resume) {
        return res.status(400).json({
          message: "You have already applied for this job with a resume.",
        });
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

    user.myApplications.push(jobId);
    await user.save();

    res.status(200).json({ message: "Successfully applied for the job" });
  } catch (error) {
    console.error("Application Error:", error);
    res.status(500).json({ message: "Failed to apply for the job", error });
  }
};

// Retrieve all applicants
export const viewApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const job = await Job.findOne({ _id: jobId, employer: userId });
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Get the details of each applicant for the job
    const applicants = await Promise.all(
      job.applicants.map(async (applicant) => {
        const user = await User.findById(applicant.applicantId);
        if (!user) {
          return { message: "Applicant not found" };
        }

        applicant.applicationStatus = "Reviewed";
        await job.save();

        // Return the applicant's details along with the application status and resume
        return {
          applicantId: applicant.applicantId,
          applicantName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          applicationDate: applicant.applicationDate,
          resume: applicant.resume,
          additionalInfo: applicant.additionalInfo,
        };
      })
    );

    res.status(200).json({ applicants });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ message: "Failed to fetch applicants.", error });
  }
};

// Response for the application of the applicants (Accept or Reject)
export const responseForApplication = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const { applicantId, response } = req.body;

    // Check if the status is valid
    if (!["Accepted", "Rejected"].includes(response)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Use 'Accepted' or 'Rejected'." });
    }

    const job = await Job.findOne({ _id: jobId, employer: userId });
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    const employer = await User.findById(userId);
    if (!employer) {
      return res.status(404).json({ message: "Employer not found." });
    }

    const applicant = await User.findById(applicantId);
    if (!applicant) {
      return res
        .status(404)
        .json({ message: "Applicant information is not found." });
    }

    // Find the applicant in the job's applicants list
    const applicantIndex = job.applicants.findIndex(
      (applicant) => applicant.applicantId.toString() === applicantId
    );

    if (applicantIndex === -1) {
      return res
        .status(404)
        .json({ message: "Applicant not found in this job's applicants." });
    }

    // Update the application status to "Accepted" or "Rejected"
    job.applicants[applicantIndex].applicationStatus = response;

    await job.save();

    // Send email notification
    const type = response;
    await sendMailNotification(
      applicant.email,
      applicant.firstName,
      applicant.middleName,
      applicant.lastName,
      job.title,
      employer.companyName,
      type
    );

    return res.status(200).json({
      message: `Application status updated to ${response} for the applicant.`,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Response is not sending for the user.", error });
  }
};
