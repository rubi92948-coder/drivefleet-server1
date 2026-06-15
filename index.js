import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

// import { auth } from "./lib/auth.js"; // বন্ধ
import carRoutes from "./routes/carRoutes.js";
// import userRoutes from "./routes/userRoutes.js"; // বন্ধ
// import Car from "./models/Car.js"; // বন্ধ

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Default route
app.get("/", (req, res) => {
  res.send("🚗 DriveFleet API Running Successfully (Database Disabled)");
});

app.listen(5000, () => console.log("Server running on port 5000"));

export default app;