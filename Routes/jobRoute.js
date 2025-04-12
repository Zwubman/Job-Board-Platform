import mongoose from "mongoose";
import express from "express";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import { createNewJob, getAllJob } from "../Controllers/jobController.js";

const jobRoute = express.Router();

jobRoute.post("/create-job", verifyToken, createNewJob);
jobRoute.get("/all-jobs", verifyToken, getAllJob);

export default jobRoute;
