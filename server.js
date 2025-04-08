import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import "./DbConfigs/dbConfig.js";
import User from "./Models/userModel.js";
import Job from "./Models/jobModel.js";
import Application from "./Models/applicationsModel.js";
import userRoute from "./Routes/userRoute.js";
dotenv.config();
const app = express();

// Serve static files from the "uploads" folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(express.json());
app.use("/user", userRoute);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on the port ${port}`);
});
