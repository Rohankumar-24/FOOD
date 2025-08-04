import React, { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../components/context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url } =
    useContext(StoreContext);

  const navigate = useNavigate();

  const USD_TO_INR = 83.25;

  const convertToINR = (usdAmount) => (usdAmount * USD_TO_INR).toFixed(2);

  if (!cartItems || !food_list) return <div>Loading...</div>;

  const deliveryFeeUSD = getTotalCartAmount() === 0 ? 0 : 2;
  const totalUSD = getTotalCartAmount() + deliveryFeeUSD;

  const handleProceed = () => {
    if (getTotalCartAmount() > 0) {
      navigate("/order");
    } else {
      alert("Your cart is empty.");
    }
  };

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

        {food_list.map((item) => {
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
          } else {
            return null;
          }
        })}
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
            className="proceed-btn"
            disabled={getTotalCartAmount() === 0}
            onClick={handleProceed}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>

        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="Promo Code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
