import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import "./DbConfigs/dbConfig.js";

dotenv.config();
const app = express();

app.use(express.json());

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on the port ${port}`);
});
