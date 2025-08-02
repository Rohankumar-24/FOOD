import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/food");
        console.log("✅ DB connected successfully");
    } catch (error) {
        console.error("❌ DB connection failed:", error.message);
    }
};
