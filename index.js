import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import mongoose from "mongoose";
import carRoutes from "./routes/carRoutes.js";

const app = express();

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully with Mongoose ✅"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/cars", carRoutes);

app.get("/", (req, res) => res.send("DriveFleet API is Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));