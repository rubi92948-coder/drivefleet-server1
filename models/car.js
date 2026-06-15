import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, required: true },
  image: { type: String, required: true },
  seats: { type: Number, required: true },
  description: { type: String, required: true },
  userId: { type: String },
  availability: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  bookingCount: { type: Number, default: 0 },
});


const Car = mongoose.model("Car", carSchema);
export default Car;