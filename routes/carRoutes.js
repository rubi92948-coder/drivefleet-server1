import express from "express";
import Car from "../models/Car.js"; // অবশ্যই মডেলটি ইম্পোর্ট করবেন

const router = express.Router();

// Create Car
router.post("/", async (req, res) => {
  try {
    const newCar = new Car(req.body);
    await newCar.save();
    res.status(201).json(newCar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Cars
router.get("/", async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;