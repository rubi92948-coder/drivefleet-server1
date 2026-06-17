import express from "express";
import bcrypt from "bcryptjs";

const router = express.Router();

let usersCollection;

export const initAuth = (db) => {
  usersCollection = db.collection("users");
};

// ================= SIGNUP =================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    const exist = await usersCollection.findOne({ email });

    if (exist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await usersCollection.insertOne({
      name,
      email,
      image: image || "",
      password: hashed,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Signup successful ✨" });

  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
});

export default router;