import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ServerApiVersion } from "mongodb";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: { version: ServerApiVersion.v1, strict: true }
});

let db;
async function connectDB() {
  try {
    await client.connect();
    db = client.db("driveFleetDB");
    console.log("Connected to MongoDB ✅");
  } catch (err) { console.error(err); }
}
connectDB();

// API: সব গাড়ি দেখার জন্য
app.get("/api/cars", async (req, res) => {
  try {
    const cars = await db.collection("cars").find().toArray();
    res.status(200).json(cars);
  } catch (error) { res.status(500).json({ message: "Error fetching" }); }
});

// API: নতুন গাড়ি যোগ করার জন্য
app.post("/api/cars", async (req, res) => {
  try {
    const newCar = req.body;
    const result = await db.collection("cars").insertOne(newCar);
    res.status(201).json({ message: "Car added successfully", insertedId: result.insertedId });
  } catch (error) { res.status(500).json({ message: "Error adding car" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));