import mongoose from "mongoose";
import express from "express";
import { signUp, signIn } from "../Controllers/authController.js";

const authRoute = express.Router();

authRoute.post("/sign-up", signUp);
authRoute.post("/sign-in", signIn);


export default authRoute;