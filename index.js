import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const app = express();

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
  },
});

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("driveFleetDB");
    console.log("Connected to MongoDB ✅");
  } catch (err) {
    console.error(err);
  }
}

connectDB();


// ✅ GET ALL CARS
app.get("/api/cars", async (req, res) => {
  try {
    const cars = await db.collection("cars").find().toArray();
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cars" });
  }
});


// ✅ GET SINGLE CAR (FIXED)
app.get("/api/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid car ID" });
    }

    const car = await db.collection("cars").findOne({
      _id: new ObjectId(id),
    });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: "Error fetching car details" });
  }
});


// ✅ ADD CAR
app.post("/api/cars", async (req, res) => {
  try {
    const result = await db.collection("cars").insertOne(req.body);

    res.status(201).json({
      message: "Car added successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding car" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});