import dotenv from 'dotenv';
dotenv.config(); // ✅ Load environment variables

import orderModel from "./../models/orderModel.js";
import userModel from "./../models/userModel.js";
import Stripe from "stripe";

// ✅ Initialize Stripe with secret key from .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const frontend_url = "http://localhost:8001"; // You can move this to .env too

// Place Order
const placeOrder = async (req, res) => {
    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: false,
            status: "Pending"
        });

        await newOrder.save();

        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: 8000
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.error("Place order error:", error);
        res.status(500).json({ success: false, message: "Error placing order" });
    }
};

// Verify Order
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Payment successful" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: true, message: "Payment failed, order removed" });
        }
    } catch (error) {
        console.error("Verify order error:", error);
        res.status(500).json({ success: false, message: "Error verifying payment" });
    }
};

// User's Orders
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("User orders error:", error);
        res.status(500).json({ success: false, message: "Error fetching user orders" });
    }
};

// Admin: List All Orders
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("List orders error:", error);
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

// Admin: Update Order Status
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, {
            status: req.body.status
        });
        res.json({ success: true, message: "Order status updated" });
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({ success: false, message: "Error updating status" });
    }
};

export { placeOrder, verifyOrder, listOrders, userOrders, updateStatus };
