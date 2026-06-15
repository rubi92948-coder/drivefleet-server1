import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { MongoClient, ServerApiVersion } from 'mongodb'; // এটি যোগ করুন

import carRoutes from "./routes/carRoutes.js";

const app = express();

// --- MongoDB কানেকশন সেটআপ ---
const uri = process.env.MONGO_URI 

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB Connected Successfully ✅");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
}
connectDB(); // সার্ভার স্টার্ট হওয়ার সময় এটি কল হবে

// --- Middlewares ---
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use("/api/cars", carRoutes);

app.get("/", (req, res) => {
  res.send("🚗 DriveFleet API Running with MongoDB");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;