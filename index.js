import express from "express";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcryptjs";
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
let usersCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("driveFleetDB");

    usersCollection = db.collection("users");

    console.log("Connected to MongoDB ✅");
  } catch (err) {
    console.error("DB ERROR:", err);
  }
}

connectDB();


// ================= AUTH ROUTES =================

// 🔐 SIGNUP
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exist = await usersCollection.findOne({ email });

    if (exist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      image: image || "",
      password: hashedPassword,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(newUser);

    res.status(201).json({
      message: "Signup successful ✨",
    });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});


// 🔐 LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    res.json({
      message: "Login successful ✨",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
});


// ================= CARS =================

// GET ALL
app.get("/api/cars", async (req, res) => {
  try {
    const cars = await db.collection("cars").find().toArray();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cars" });
  }
});


// GET ONE
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


// ADD CAR
app.post("/api/cars", async (req, res) => {
  try {
    const body = req.body;

    const newCar = {
      name: body.name,
      price: Number(body.price),
      type: body.type,
      image: body.image,
      seats: Number(body.seats),
      location: body.location,
      date: body.date,
      availability:
        body.availability === true || body.availability === "true",
      description: body.description,
    };

    const result = await db.collection("cars").insertOne(newCar);

    res.status(201).json({
      message: "Car added successfully 🚗",
      insertedId: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({ message: "Error adding car" });
  }
});


// UPDATE CAR
app.put("/api/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const { _id, ...body } = req.body;

    const updateData = {};

    if (body.name) updateData.name = body.name;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.type) updateData.type = body.type;
    if (body.image) updateData.image = body.image;
    if (body.seats !== undefined) updateData.seats = Number(body.seats);
    if (body.location) updateData.location = body.location;
    if (body.date) updateData.date = body.date;
    if (body.description) updateData.description = body.description;

    if (body.availability !== undefined) {
      updateData.availability =
        body.availability === true || body.availability === "true";
    }

    await db.collection("cars").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    res.json({ message: "Updated successfully ✨" });

  } catch (err) {
    res.status(500).json({
      message: "Update failed",
      error: err.message,
    });
  }
});


// DELETE CAR
app.delete("/api/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    await db.collection("cars").deleteOne({
      _id: new ObjectId(id),
    });

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