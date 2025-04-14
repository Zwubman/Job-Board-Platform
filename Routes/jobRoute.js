import mongoose, { get } from "mongoose";
import express from "express";
import upload from "../Middlewares/upload.js";
import {
  createNewJob,
  getAllJob,
  filterJobByCategory,
  applyForJob,
  viewApplicants,
  responseForApplication,
  getMyJobs,
} from "../Controllers/jobController.js";
import {
  verifyToken,
  checkEmployerRole,
  checkUserRole,
} from "../Middlewares/authMiddleware.js";

const jobRoute = express.Router();

jobRoute.post("/create-job", verifyToken, checkEmployerRole, createNewJob);
jobRoute.get("/all-jobs", verifyToken, getAllJob);
jobRoute.get("/fillter-jobs", verifyToken, filterJobByCategory);
jobRoute.post("/apply/:id", verifyToken, checkUserRole, upload.single("resume"), applyForJob);
jobRoute.get("/all-applicants/:id", verifyToken, checkEmployerRole, viewApplicants);
jobRoute.post("/respond/:id", verifyToken, checkEmployerRole, responseForApplication);
jobRoute.get("/my-jobs", verifyToken, checkEmployerRole, getMyJobs);

export default jobRoute;
