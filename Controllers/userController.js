import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookie from "cookie-parser";
import dotenv from "dotenv";
import User from "../Models/userModel.js";
import fs from "fs";
import path from "path";

dotenv.config();

//Sign Up
export const signUp = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      role,
      phone,
      companyName,
      companyDescription,
    } = req.body;

    if (
      !firstName ||
      !middleName ||
      !lastName ||
      !email ||
      !password ||
      !role ||
      !phone
    ) {
      return res
        .status(303)
        .json({ message: "all the field is required please enter." });
    }

    const isExist = await User.findOne({ email });
    if (isExist) {
      return res.status(401).json({
        message: "User already registered or sign up, please sign in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "Employer") {
      if (!companyName || !companyDescription) {
        return res
          .status(303)
          .json({ message: "company name and description is required" });
      }
      const user = new User({
        firstName,
        middleName,
        lastName,
        email,
        password: hashedPassword,
        role,
        phone,
        companyName,
        companyDescription,
      });

      await user.save();

      res.status(200).json({ message: "User registered successfully.", user });
    } else {
      const user = new User({
        firstName,
        middleName,
        lastName,
        email,
        password: hashedPassword,
        role,
        phone,
      });

      await user.save();

      res.status(200).json({ message: "User registered successfully.", user });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to sign up.", error });
  }
};

//Sign in
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(401)
        .json({ message: "Both email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not sign up, please sign up first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(303).json({
        message: "Incorrect password, please enter the correct password.",
      });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_KEY,
      {
        expiresIn: "1d",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.REFRESH_TOKEN_KEY,
      {
        expiresIn: "30d",
      }
    );

    res.cookie("accessToken", accessToken);
    res.cookie("refreshToken", refreshToken);

    res.status(200).json({
      message: "User sign in successfully.",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to sign in.", error });
  }
};

//Retrieve user by id
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User:", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to retrieve user by id.", error });
  }
};

// Controller for uploading profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const userId = req.user.id; // Assuming user is authenticated and their ID is stored in req.user
    const profilePicPath = `/uploads/${req.file.filename}`;

    // Update user's profile with the new image path
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: profilePicPath },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile picture uploaded successfully.",
      profilePic: profilePicPath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error uploading profile picture.",
      error: error.message,
    });
  }
};

//Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    const userId = req.user.id;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password." });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(303).json({ message: "New password does not match." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: "Password successfully changed." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to change Password.", error });
  }
};

//Update profile information like bio, skills, experience, and education
export const editProfileDetails = async (req, res) => {
  try {
    const { skills, education, experience, bio } = req.body;

    const userId = req.user.id;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const updatedProfileDetails = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          skills,
          education,
          experience,
          bio,
        },
      },
      { new: true }
    );

    if (!updatedProfileDetails) {
      return res.status(404).json({
        message: "User not found or not updated user's profile details.",
      });
    }

    res
      .status(200)
      .json({
        message: "User profile details is successfully updated.",
        updatedProfileDetails,
      });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .jso({ message: "Failed to update the profile details.", error });
  }
};

// Add or remove skills from the user skills if the user wants
export const manageSkills = async (req, res) => {
  const { skills, action } = req.body; 

  if (!Array.isArray(skills) && typeof skills !== 'string') {
    return res.status(400).json({ message: 'Skills should be a string or an array of strings' });
  }

  // If skills is a single string, convert it into an array
  if (typeof skills === 'string') {
    skills = [skills];
  }

  // Check if all skills are strings
  if (!skills.every(skill => typeof skill === 'string')) {
    return res.status(400).json({ message: 'Each skill should be a string' });
  }

  try {
    let updatedUser;

    if (action === 'add') {
      // Add unique skills to the user's skills array
      updatedUser = await User.findByIdAndUpdate(
        req.user.id,  
        { $addToSet: { skills: { $each: skills } } },  
        { new: true }
      );
    } else if (action === 'remove') {
      // Remove the specified skills from the user's skills array
      updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { skills: { $in: skills } } }, 
        { new: true }
      );
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "add" or "remove".' });
    }

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: `Skills ${action}ed successfully`, updatedUser });
  } catch (error) {
    res.status(500).json({ message: `Error ${action}ing skills`, error });
  }
}


