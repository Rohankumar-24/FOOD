import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const port = 8001;

// Middleware
app.use(express.json());
app.use(cors());
app.use("/images", express.static("uploads"));

// DB connection
connectDB();

// API Endpoints
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// Test route
app.get("/", (req, res) => {
    res.send("API WORKING");
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
