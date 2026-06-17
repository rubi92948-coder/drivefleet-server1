import express from "express";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcryptjs";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ================= DB CONNECTION =================
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
  } catch (err) { console.error("DB ERROR:", err); }
}
connectDB();

// ================= AUTH ROUTES =================
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, image } = req.body;
    const exist = await usersCollection.findOne({ email });
    if (exist) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({ name, email, image: image || "", password: hashedPassword, createdAt: new Date() });
    res.status(201).json({ message: "Signup successful ✨" });
  } catch (err) { res.status(500).json({ message: "Signup failed" }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });
    res.json({ message: "Login successful ✨", user: { id: user._id, name: user.name, email: user.email, image: user.image } });
  } catch (err) { res.status(500).json({ message: "Login failed" }); }
});

// ================= CARS ROUTES =================
// GET ALL (WITH SEARCH & FILTER)
app.get("/api/cars", async (req, res) => {
  try {
    const { search, type } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (type && type !== "All") query.type = type;

    const cars = await carsCollection.find(query).toArray();
    res.json(cars);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

// GET SINGLE CAR (FOR DETAILS PAGE)
app.get("/api/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });
    const car = await carsCollection.findOne({ _id: new ObjectId(id) });
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

// ADD, UPDATE, DELETE
app.post("/api/cars", async (req, res) => {
  try {
    const newCar = { ...req.body, price: Number(req.body.price), seats: Number(req.body.seats) };
    const result = await carsCollection.insertOne(newCar);
    res.status(201).json({ message: "Car added successfully 🚗", insertedId: result.insertedId });
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.put("/api/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { _id, ...body } = req.body;
    await carsCollection.updateOne({ _id: new ObjectId(id) }, { $set: body });
    res.json({ message: "Updated successfully ✨" });
  } catch (err) { res.status(500).json({ message: "Update failed" }); }
});

app.delete("/api/cars/:id", async (req, res) => {
  try {
    await carsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Deleted successfully 🗑" });
  } catch (err) { res.status(500).json({ message: "Delete failed" }); }
});

// ================= BOOKINGS ROUTES =================
app.post("/api/bookings", async (req, res) => {
  try {
    const booking = { ...req.body, createdAt: new Date() };
    await bookingsCollection.insertOne(booking);
    
    // Update car availability to false
    await carsCollection.updateOne(
      { _id: new ObjectId(req.body.carId) },
      { $set: { availability: false } }
    );
    res.status(201).json({ message: "Booked!" });
  } catch (err) { res.status(500).json({ message: "Booking failed" }); }
});

app.get("/api/bookings/:email", async (req, res) => {
  try {
    const data = await bookingsCollection.find({ userEmail: req.params.email }).toArray();
    res.json(data);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));