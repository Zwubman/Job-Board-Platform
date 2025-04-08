import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(404)
      .json({ message: "Authorization header is required." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(404).json({ message: "token is not found in headers." });
  }
  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, decoded) => {
      if (err) {
        if (err.name === TokenExpiredError) {
          res
            .status(401)
            .json({ message: "Token has expired, please log in again." });
        }
        res.status(403).json({ message: "Invalid token or has expired" });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to verify the token.", error });
  }
};

// Check the role of the user is user or not
export const checkUserRole = async (req, res, next) => {
  try {
    if (req.user.role === "User") {
      next();
    }
    res.status(301).json({ message: "Access denied." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid Credential." });
  }
};

// Check the role of the Employer is user or not
export const checkEmployerRole = async (req, res, next) => {
  try {
    if (req.user.role === "Employer") {
      next();
    }
    res.status(301).json({ message: "Access denied." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid Credential." });
  }
};
