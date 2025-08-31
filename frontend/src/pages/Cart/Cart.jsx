import React, { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../components/context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url, token } =
    useContext(StoreContext);

  const navigate = useNavigate();

  const USD_TO_INR = 83.25;

  const convertToINR = (usdAmount) => (usdAmount * USD_TO_INR).toFixed(2);

  const handleProceed = () => {
    console.log("Proceed button clicked!");
    console.log("Cart total:", getTotalCartAmount());
    console.log("User token:", token);
    console.log("Cart items:", cartItems);

    
    if (!token) {
      alert("Please login to proceed to checkout");
      return;
    }

    
    if (getTotalCartAmount() === 0) {
      alert("Your cart is empty. Please add items to proceed.");
      return;
    }

    
    console.log("Navigating to /order...");
    navigate("/order");
  };

  
  if (!food_list || food_list.length === 0) {
    return <div className="loading">Loading food items...</div>;
  }

  const deliveryFeeUSD = getTotalCartAmount() === 0 ? 0 : 2;
  const totalUSD = getTotalCartAmount() + deliveryFeeUSD;

  
  const isCartEmpty = getTotalCartAmount() === 0;

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <hr />

        {isCartEmpty ? (
          <div className="empty-cart">
            <p>Your cart is empty. Add some delicious items!</p>
          </div>
        ) : (
          food_list.map((item) => {
            const quantity = cartItems[item._id];
            if (quantity > 0) {
              const itemTotalUSD = item.price * quantity;
              return (
                <div key={item._id} className="cart-items-item-wrapper">
                  <div className="cart-items-item">
                    <img src={`${url}/images/${item.image}`} alt={item.name} />
                    <p>{item.name}</p>
                    <p>₹{convertToINR(item.price)}</p>
                    <p>{quantity}</p>
                    <p>₹{convertToINR(itemTotalUSD)}</p>
                    <p className="cross" onClick={() => removeFromCart(item._id)}>
                      ×
                    </p>
                  </div>
                  <hr />
                </div>
              );
            }
            return null;
          })
        )}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-detail">
              <p>Subtotal</p>
              <p>₹{convertToINR(getTotalCartAmount())}</p>
            </div>
            <hr />
            <div className="cart-total-detail">
              <p>Delivery Fee</p>
              <p>₹{convertToINR(deliveryFeeUSD)}</p>
            </div>
            <hr />
            <div className="cart-total-detail">
              <b>Total</b>
              <b>₹{convertToINR(totalUSD)}</b>
            </div>
          </div>

          <button
            type="button"
            className={`proceed-btn ${isCartEmpty ? 'disabled' : ''}`}
            onClick={handleProceed}
            disabled={false} 
          >
            PROCEED TO CHECKOUT
          </button>
        </div>

        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="Promo Code" />
              <button type="button">Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;