import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import "./DbConfigs/dbConfig.js";
import User from "./Models/userModel.js";
import Job from "./Models/jobModel.js";
import Application from "./Models/applicationsModel.js";   

dotenv.config();
const app = express();

app.use(express.json());

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on the port ${port}`);
});
