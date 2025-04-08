import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    skills: {
      type: [String], 
      required: true,
    },
    salary: {
      type: Number,
      required: false,
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
      default: "Full-time",
    },
    category: {
      type: String,
      required: false,
    },
    applicationDeadline: {
      type: Date,
      required: false,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    }
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
