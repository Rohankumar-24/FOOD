import fs from "fs";
import path from "path";
import foodModel from "../models/foodModel.js";

// Add food item
const addFood = async (req, res) => {
    try {
        const image_filename = req.file?.filename || "";

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename
        });

        await food.save();
        res.json({ success: true, message: "Food added" });
    } catch (error) {
        console.error("Add food error:", error);
        res.status(500).json({ success: false, message: "Error adding food" });
    }
};

// Get all food items
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods });
    } catch (error) {
        console.error("List food error:", error);
        res.status(500).json({ success: false, message: "Error retrieving food list" });
    }
};

// Remove food item
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food not found" });
        }

        // Safely delete the image file (only if it exists)
        const imagePath = path.join("uploads", food.image);
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Image delete error:", err);
            });
        }

        // Delete the food document
        await foodModel.findByIdAndDelete(req.body.id);

        res.json({ success: true, message: "Food item removed" });
    } catch (error) {
        console.error("Remove food error:", error);
        res.status(500).json({ success: false, message: "Error deleting food" });
    }
};

export { addFood, listFood, removeFood };
