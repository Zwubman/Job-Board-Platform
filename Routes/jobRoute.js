import mongoose from "mongoose";
import express from "express";
import upload from "../Middlewares/upload.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import {
  createNewJob,
  getAllJob,
  filterJobByCategory,
  applyForJob,
} from "../Controllers/jobController.js";

const jobRoute = express.Router();

jobRoute.post("/create-job", verifyToken, createNewJob);
jobRoute.get("/all-jobs", verifyToken, getAllJob);
jobRoute.get("/fillter-jobs", verifyToken, filterJobByCategory);
jobRoute.post("/apply/:id", verifyToken, upload.single("resume"), applyForJob);


export default jobRoute;
