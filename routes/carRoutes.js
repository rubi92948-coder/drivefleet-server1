import express from "express";
import Car from "../models/Car.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // User info accessable in routes
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

/* ---------------- CREATE CAR (PROTECTED) ---------------- */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const car = await Car.create({ ...req.body, userId: req.user.id });
    res.status(201).json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- GET ALL CARS (PUBLIC) ---------------- */
router.get("/", async (req, res) => {
  try {
    const { search, type } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (type && type !== "All") query.type = { $in: type.split(",") };

    const cars = await Car.find(query);
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- MY CARS (PROTECTED) ---------------- */
router.get("/my-cars", authMiddleware, async (req, res) => {
  try {
    const cars = await Car.find({ userId: req.user.id });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- UPDATE CAR (WITH OWNER CHECK) ---------------- */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    // Only allow update if car belongs to user
    const updatedCar = await Car.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedCar) return res.status(404).json({ message: "Car not found or unauthorized" });
    res.json(updatedCar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;