import mongoose from "mongoose";
import express from "express";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { createNewJob } from "../Controllers/jobController.js";

const jobRoute = express.Router();

jobRoute.post("/create-job", verifyToken, createNewJob);



export default jobRoute;
