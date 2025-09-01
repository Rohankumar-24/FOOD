import express from "express";
import multer from "multer";
import { addFood, listFood, removeFood } from "../controller/foodController.js";

const router = express.Router();

// Setup multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// Routes
router.post("/add", upload.single("image"), addFood);
router.get("/list", listFood);
router.post("/remove", removeFood);

export default router;
