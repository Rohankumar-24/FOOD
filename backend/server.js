import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

//  Setup CORS
const allowedOrigins = [
  "http://localhost:5173",               // Vite frontend local dev
  "http://localhost:5174",               // Admin or second dev port
  "https://food-ln02.onrender.com",      // Your deployed frontend
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

//  Parse JSON
app.use(express.json());

//  Serve uploaded images
app.use("/images", express.static("uploads"));

//  Connect to MongoDB
connectDB();

//  API Routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

//  Health check route
app.get("/", (req, res) => {
  res.send("API WORKING");
});

//  Start server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
