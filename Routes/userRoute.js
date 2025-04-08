import mongoose from "mongoose";
import express from "express";
import { signUp, signIn } from "../Controllers/userController.js";

const userRoute = express.Router();

userRoute.post("/sign-up", signUp);
userRoute.post("/sing-in", signIn);

export default userRoute;