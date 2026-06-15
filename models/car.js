import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  name: String,
  price: Number,
  type: String,
  image: String,
  seats: Number,
  location: String,
  date: Date,
  availability: Boolean,
  description: String,
  userId: String, 
});

export default mongoose.model("Car", carSchema);