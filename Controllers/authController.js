import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookie from "cookie-parser";
import dotenv from "dotenv";
import User from "../Models/userModel.js";

dotenv.config();

//Sign Up
export const signUp = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password, role, phone } =
      req.body;

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
      res.status(401).json({
        message: "User already registered or sign up, please sign in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
