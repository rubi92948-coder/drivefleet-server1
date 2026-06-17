import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const app = express();

app.use(cors());
app.use(express.json());

// ================= DB =================
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
    console.error("DB ERROR:", err);
  }
}

connectDB();

// ================= GET ALL =================
app.get("/api/cars", async (req, res) => {
  try {
    const cars = await db.collection("cars").find().toArray();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cars" });
  }
});

// ================= GET ONE =================
app.get("/api/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const car = await db.collection("cars").findOne({
      _id: new ObjectId(id),
    });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Error fetching car" });
  }
});

// ================= ADD =================
app.post("/api/cars", async (req, res) => {
  try {
    const newCar = {
      name: req.body.name,
      price: Number(req.body.price),
      type: req.body.type,
      image: req.body.image,
      seats: Number(req.body.seats),
      location: req.body.location,
      date: req.body.date,
      availability: req.body.availability === true || req.body.availability === "true",
      description: req.body.description,
    };

    const result = await db.collection("cars").insertOne(newCar);

    res.status(201).json({
      message: "Car added successfully",
      insertedId: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({ message: "Error adding car" });
  }
});

// ================= UPDATE (FINAL FIX) =================
app.put("/api/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    // ❌ NEVER allow _id update
    const { _id, ...rest } = req.body;

    const updateData = {
      name: rest.name,
      price: rest.price ? Number(rest.price) : undefined,
      type: rest.type,
      image: rest.image,
      seats: rest.seats ? Number(rest.seats) : undefined,
      location: rest.location,
      date: rest.date,
      availability:
        rest.availability === true || rest.availability === "true",
      description: rest.description,
    };

    // remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const result = await db.collection("cars").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json({ message: "Updated successfully ✨" });
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({
      message: "Update failed",
      error: err.message,
    });
  }
});

// ================= DELETE =================
app.delete("/api/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const result = await db.collection("cars").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json({ message: "Deleted successfully 🗑" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});