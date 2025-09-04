import dotenv from 'dotenv';
dotenv.config(); // environment variables

import orderModel from "./../models/orderModel.js";
import userModel from "./../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const frontend_url = "http://localhost:8001";

// Place Order
const placeOrder = async (req, res) => {
    try {
        console.log("Received order data:", req.body);
        
        //  default to 'usd'
        const currency = req.body.currency || 'usd';
        const amount = req.body.amount; 
        
        console.log("Processing order with currency:", currency);
        console.log("Total amount received:", amount);
        
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

        // Create line items from the cart items
        const line_items = req.body.items.map((item) => {
            const itemPriceInCents = Math.round(item.price * 100); // Convert to paisa
            
            console.log(`Item: ${item.name}, Price: $${item.price}, Quantity: ${item.quantity}`);
            
            return {
                price_data: {
                    currency: currency, 
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: itemPriceInCents, // Price in cents (for USD) or paisa (for INR)
                },
                quantity: item.quantity
            };
        });

        // Calculate delivery fee based on currency
        let deliveryFeeInCents;
        if (currency === 'usd') {
            deliveryFeeInCents = 2 * 100; // $2 = 200 cents
        } else if (currency === 'inr') {
            deliveryFeeInCents = Math.round(2 * (req.body.exchangeRate || 83.5) * 100); // Convert $2 to INR paisa
        } else {
            deliveryFeeInCents = 200; // Default to $2
        }

        // Add delivery charges
        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: deliveryFeeInCents
            },
            quantity: 1
        });

        console.log("Creating Stripe session with line_items:", JSON.stringify(line_items, null, 2));

        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        });

        console.log("Stripe session created successfully:", session.id);
        res.json({ success: true, session_url: session.url });
        
    } catch (error) {
        console.error("Place order error:", error);
        console.error("Error details:", error.message);
        res.status(500).json({ success: false, message: "Error placing order: " + error.message });
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

// User Orders
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("User orders error:", error);
        res.status(500).json({ success: false, message: "Error fetching user orders" });
    }
};

//  List All Orders
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("List orders error:", error);
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

//  Update Order Status
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