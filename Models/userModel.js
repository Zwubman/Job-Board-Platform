import mongoose from "mongoose";

const usersSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Employer", "User"],
      default: "User",
      required: true,
    },
    bio: {
      type: String,
    },

    experience: [
      {
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],

    education: [
      {
        degree: String,
        institution: String,
        startYear: Number,
        endYear: Number,
      },
    ],

    skills: [String],

    companyName: {
      type: String,
    },

    companyDescription: {
      type: String,
    },
  },
  { timestamps: true }
);
const User = mongoose.model("User", usersSchema);
export default User;
