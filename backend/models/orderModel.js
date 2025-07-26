import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }
  ],
  amount: {
    type: Number,
    required: true,
  },
  address: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    default: "food processing",
  },
  date: {
    type: Date,
    default: Date.now, //  No parentheses
  },
  payment: {
    type: Boolean,
    default: false, // Fixed typo
  },
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
