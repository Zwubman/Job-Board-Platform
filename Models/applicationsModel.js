import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    resume: {
      type: String, 
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
