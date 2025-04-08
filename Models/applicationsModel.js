import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The job seeker applying
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job", // The job being applied to
      required: true,
    },
    resume: {
      type: String, // File path or URL to the uploaded resume
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "reviewed", "shortlisted", "rejected", "accepted"],
      default: "applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);
export default Application;
