import fs from "fs";
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
            image: image_filename  // ✅ fixed typo from iamge → image
        });

        await food.save();
        res.json({ success: true, message: "Food added" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error adding food" });
    }
};

// Get all food items
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
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

        // Delete the image file
        fs.unlink(`uploads/${food.image}`, (err) => {
            if (err) console.log("Image delete error:", err);
        });

        // Delete the food document
        await foodModel.findByIdAndDelete(req.body.id);

        res.json({ success: true, message: "Food item removed" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error deleting food" });
    }
};

export { addFood, listFood, removeFood };
