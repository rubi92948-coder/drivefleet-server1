import express from "express";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcryptjs";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const app = express();

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: { version: ServerApiVersion.v1, strict: true },
});

let db, usersCollection, carsCollection, bookingsCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("driveFleetDB");
    usersCollection = db.collection("users");
    carsCollection = db.collection("cars");
    bookingsCollection = db.collection("bookings");
    console.log("Connected to MongoDB ✅");
  } catch (err) {
    console.error("DB ERROR:", err);
  }
}
connectDB();

// ================= AUTH =================
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    const exist = await usersCollection.findOne({ email });
    if (exist) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersCollection.insertOne({
      name,
      email,
      image: image || "",
      password: hashedPassword,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Signup successful ✨" });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
});

app.post("/api/auth/social-login", async (req, res) => {
  try {
    const { name, email, image } = req.body;

    const exist = await usersCollection.findOne({ email });

    if (!exist) {
      await usersCollection.insertOne({
        name,
        email,
        image: image || "",
        password: "",
        createdAt: new Date(),
      });
    }

    res.status(200).json({ message: "Social login saved" });
  } catch (err) {
    res.status(500).json({ message: "Social login failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

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
    res.status(500).json({ message: "Login failed" });
  }
});

// ================= CARS =================
app.get("/api/cars", async (req, res) => {
  try {
    const { search, type } = req.query;

    let query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (type && type !== "All") query.type = type;

    const cars = await carsCollection.find(query).toArray();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

app.get("/api/cars/:id", async (req, res) => {
  try {
    const car = await carsCollection.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!car) return res.status(404).json({ message: "Car not found" });

    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/my-cars", async (req, res) => {
  try {
    const userEmail = req.query.email;

    if (!userEmail)
      return res.status(400).json({ message: "Email is required" });

    const myCars = await carsCollection
      .find({ userEmail })
      .toArray();

    res.json(myCars);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/cars", async (req, res) => {
  try {
    const newCar = {
      ...req.body,
      price: Number(req.body.price),
      seats: Number(req.body.seats),
    };

    const result = await carsCollection.insertOne(newCar);

    res.status(201).json({
      message: "Car added successfully 🚗",
      insertedId: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

app.put("/api/cars/:id", async (req, res) => {
  try {
    const { _id, ...body } = req.body;

    await carsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: body }
    );

    res.json({ message: "Updated successfully ✨" });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

app.delete("/api/cars/:id", async (req, res) => {
  try {
    await carsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.json({ message: "Deleted successfully 🗑" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// ================= BOOKINGS =================
app.post("/api/bookings", async (req, res) => {
  try {
    const {
      carId,
      carName,
      price,
      bookingDate,
      driverNeeded,
      specialNote,
      userEmail, // 🔥 MUST BE INCLUDED
    } = req.body;

    const booking = {
      carId,
      carName,
      price,
      bookingDate,
      driverNeeded,
      specialNote,
      userEmail, // 🔥 SAVE IN DB
      createdAt: new Date(),
    };

    await bookingsCollection.insertOne(booking);

    await carsCollection.updateOne(
      { _id: new ObjectId(carId) },
      { $set: { availability: false } }
    );

    res.status(201).json({ message: "Booked!" });
  } catch (err) {
    res.status(500).json({ message: "Booking failed" });
  }
});

app.get("/api/bookings/:email", async (req, res) => {
  try {
    const data = await bookingsCollection
      .find({ userEmail: req.params.email })
      .toArray();

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

app.delete("/api/bookings/:id", async (req, res) => {
  try {
    await bookingsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);