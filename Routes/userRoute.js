import mongoose from "mongoose";
import express from "express";
import {
  signUp,
  signIn,
  getUserById,
  uploadProfilePicture,
  changePassword
} from "../Controllers/userController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import upload from "../Middlewares/upload.js";

const userRoute = express.Router();

userRoute.post("/sign-up", signUp);
userRoute.post("/sign-in", signIn);
userRoute.get("/get-user/:id", getUserById);
userRoute.post("/profile-picture", verifyToken, upload, uploadProfilePicture);
userRoute.put("/change-password", verifyToken, changePassword);

export default userRoute;
