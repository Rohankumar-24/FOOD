import express from "express";
import authMiddleware from "./../middleware/auth.js";
import { verifyOrder, userOrders, listOrders, updateStatus } from "../controller/orderController.js";

const orderRouter = express.Router();

// orderRouter.post("/place", authMiddleware, placeOrder); // Uncomment if needed
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);  // ✅ Fixed route
orderRouter.post("/status", updateStatus);

export default orderRouter;
