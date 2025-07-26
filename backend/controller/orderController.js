import orderModel from "./../models/orderModel.js";
import userModel from "./../models/userModel.js";
import Stripe from "stripe";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); //Make sure .env is set

const frontend_url = "http://localhost:8001"; // You can move this to .env for flexibility

// Place Order
const placeOrder = async (req, res) => {
    try {
        // Step 1: Create order in DB
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: false,
            status: "Pending"
        });

        await newOrder.save();

        // Step 2: Clear cart
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // Step 3: Create Stripe line items
        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100, // Stripe uses paisa
            },
            quantity: item.quantity
        }));

        // Step 4: Add delivery charge (₹80.00)
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

        // Step 5: Create Stripe Checkout Session
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

// Verify Payment Result
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

// Get all orders of a specific user
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("User orders error:", error);
        res.status(500).json({ success: false, message: "Error fetching user orders" });
    }
};

// Get all orders (admin use)
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("List orders error:", error);
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

// Update order status (admin use)
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
