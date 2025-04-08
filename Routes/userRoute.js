import mongoose from "mongoose";
import express from "express";
import { signUp, signIn, getUserById, updateProfilePicture } from "../Controllers/userController.js";

const userRoute = express.Router();

userRoute.post("/sign-up", signUp);
userRoute.post("/sing-in", signIn);
userRoute.get("/get-user/:id", getUserById);
userRoute.post("/profile-picture", updateProfilePicture);

export default userRoute;