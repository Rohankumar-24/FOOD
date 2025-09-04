import React, { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../components/context/StoreContext";
import { useCurrency } from "../../components/context/CurrencyContext"; 
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url, token } =
    useContext(StoreContext);

  
  const { 
    exchangeRate, 
    rateChange, 
    isLoading: currencyLoading, 
    lastUpdated,
    convertToINR,
    formatPrice 
  } = useCurrency();

  const navigate = useNavigate();

  const handleProceed = () => {
    console.log("Proceed button clicked!");
    
    
    const cartTotalUSD = getTotalCartAmount(); // This returns USD amount
    const deliveryFeeUSD = cartTotalUSD === 0 ? 0 : 2;
    const totalUSD = cartTotalUSD + deliveryFeeUSD;
    
    console.log("Cart total (USD):", cartTotalUSD);
    console.log("Delivery fee (USD):", deliveryFeeUSD);
    console.log("Total amount (USD):", totalUSD);
    console.log("User token:", token);
    console.log("Cart items:", cartItems);
    console.log("Current exchange rate:", exchangeRate);

    if (!token) {
      alert("Please login to proceed to checkout");
      return;
    }

    if (cartTotalUSD === 0) {
      alert("Your cart is empty. Please add items to proceed.");
      return;
    }

    console.log("Navigating to /order...");
    
    // Pass USD amounts to maintain currency consistency
    navigate("/order", {
      state: {
        cartTotal: cartTotalUSD,           // USD amount
        deliveryFee: deliveryFeeUSD,       // USD amount  
        totalAmount: totalUSD,             // USD amount
        currency: 'usd',                   // set currency for Stripe
        // Also pass INR amounts for display purposes
        cartTotalINR: convertToINR(cartTotalUSD),
        deliveryFeeINR: convertToINR(deliveryFeeUSD),
        totalAmountINR: convertToINR(totalUSD),
        exchangeRate: exchangeRate
      }
    });
  };

  if (!food_list || food_list.length === 0) {
    return <div className="loading">Loading food items...</div>;
  }

  // Calculate amounts in USD (base currency)
  const cartTotalUSD = getTotalCartAmount();
  const deliveryFeeUSD = cartTotalUSD === 0 ? 0 : 2;
  const totalUSD = cartTotalUSD + deliveryFeeUSD;
  const isCartEmpty = cartTotalUSD === 0;

  // Helper functions for rate display
  const getRateIcon = () => {
    if (currencyLoading) return "⟳";
    if (rateChange === 'up') return "↗️";
    if (rateChange === 'down') return "↘️";
    return "💱";
  };

  const getRateColor = () => {
    if (rateChange === 'up') return "#22c55e";
    if (rateChange === 'down') return "#ef4444";
    return "#6b7280";
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return "";
    const minutes = Math.floor((new Date() - lastUpdated) / (1000 * 60));
    if (minutes === 0) return "just now";
    if (minutes === 1) return "1 min ago";
    return `${minutes} mins ago`;
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

        {isCartEmpty ? (
          <div className="empty-cart">
            <p>Your cart is empty. Add some delicious items!</p>
          </div>
        ) : (
          food_list.map((item) => {
            const quantity = cartItems[item._id];
            if (quantity > 0) {
              const itemTotalUSD = item.price * quantity; // Keep in USD
              return (
                <div key={item._id} className="cart-items-item-wrapper">
                  <div className="cart-items-item">
                    <img src={`${url}/images/${item.image}`} alt={item.name} />
                    <p>{item.name}</p>
                    <p>
                      {currencyLoading ? (
                        "₹..."
                      ) : (
                        `₹${convertToINR(item.price)}`
                      )}
                    </p>
                    <p>{quantity}</p>
                    <p>
                      {currencyLoading ? (
                        "₹..."
                      ) : (
                        `₹${convertToINR(itemTotalUSD)}`
                      )}
                    </p>
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
          
          {/* Exchange Rate Info */}
          {!currencyLoading && (
            <div className="exchange-rate-display" style={{
              fontSize: '0.85rem',
              color: getRateColor(),
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '15px',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <span>{getRateIcon()}</span>
              <span>Current Rate: 1 USD = ₹{exchangeRate.toFixed(2)}</span>
              {lastUpdated && (
                <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>
                  (Updated {formatLastUpdated()})
                </span>
              )}
            </div>
          )}

          <div>
            <div className="cart-total-detail">
              <p>Subtotal</p>
              <p>
                {currencyLoading ? (
                  "₹..."
                ) : (
                  `₹${convertToINR(cartTotalUSD)}`
                )}
              </p>
            </div>
            <hr />
            <div className="cart-total-detail">
              <p>Delivery Fee</p>
              <p>
                {currencyLoading ? (
                  "₹..."
                ) : (
                  `₹${convertToINR(deliveryFeeUSD)}`
                )}
              </p>
            </div>
            <hr />
            <div className="cart-total-detail">
              <b>Total</b>
              <b>
                {currencyLoading ? (
                  "₹..."
                ) : (
                  `₹${convertToINR(totalUSD)}`
                )}
              </b>
            </div>
          </div>

          <button
            type="button"
            className={`proceed-btn ${isCartEmpty ? 'disabled' : ''}`}
            onClick={handleProceed}
            disabled={isCartEmpty}
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