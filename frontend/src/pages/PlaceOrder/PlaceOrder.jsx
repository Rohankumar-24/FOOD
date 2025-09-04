import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../components/context/StoreContext';
import { useCurrency } from "../../components/context/CurrencyContext";
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);
  const { convertToINR, exchangeRate } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get payment data from Cart navigation state
  const paymentData = location.state || {};
  
  const [data, setData] = useState({
    firstName: "", lastName: "", email: "", street: "",
    city: "", state: "", zipcode: "", country: "", phone: ""
  });

  // Calculate amounts by  using USD for consistency
  const cartTotalUSD = getTotalCartAmount();
  const deliveryFeeUSD = cartTotalUSD === 0 ? 0 : 2;
  const totalAmountUSD = cartTotalUSD + deliveryFeeUSD;

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    const orderItems = [];

    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        const itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });

    const orderData = {
      address: data,
      items: orderItems,
      amount: totalAmountUSD, 
      currency: 'usd', //  specify currency
      
      exchangeRate: exchangeRate,
      amountINR: convertToINR(totalAmountUSD)
    };

    console.log("Sending order data:", orderData);
    console.log("Amount being sent to backend (USD):", totalAmountUSD);
    console.log("Equivalent in INR:", convertToINR(totalAmountUSD));

    try {
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { token },
      });

      if (response.data.success) {
        const { session_url } = response.data;
        console.log("Order placed successfully, redirecting to Stripe...");
        window.location.replace(session_url);
      } else {
        console.error("Order failed:", response.data);
        alert('Order Failed! ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error("Place Order Error:", error);
      console.error("Error details:", error.response?.data);
      alert("Something went wrong while placing the order. Please try again.");
    }
  };

  useEffect(() => {
    if (!token || getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token, getTotalCartAmount, navigate]);

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input 
            required 
            name='firstName' 
            onChange={onChangeHandler} 
            value={data.firstName} 
            type="text" 
            placeholder='First Name' 
          />
          <input 
            required 
            name='lastName' 
            onChange={onChangeHandler} 
            value={data.lastName} 
            type="text" 
            placeholder='Last Name' 
          />
        </div>
        <input 
          required 
          name='email' 
          onChange={onChangeHandler} 
          value={data.email} 
          type="email" 
          placeholder='Email address' 
        />
        <input 
          required 
          name='street' 
          onChange={onChangeHandler} 
          value={data.street} 
          type="text" 
          placeholder='Street' 
        />
        <div className="multi-fields">
          <input 
            required 
            name='city' 
            onChange={onChangeHandler} 
            value={data.city} 
            type="text" 
            placeholder='City' 
          />
          <input 
            required 
            name='state' 
            onChange={onChangeHandler} 
            value={data.state} 
            type="text" 
            placeholder='State' 
          />
        </div>
        <div className="multi-fields">
          <input 
            required 
            name='zipcode' 
            onChange={onChangeHandler} 
            value={data.zipcode} 
            type="text" 
            placeholder='Zip code' 
          />
          <input 
            required 
            name='country' 
            onChange={onChangeHandler} 
            value={data.country} 
            type="text" 
            placeholder='Country' 
          />
        </div>
        <input 
          required 
          name='phone' 
          onChange={onChangeHandler} 
          value={data.phone} 
          type="text" 
          placeholder='Phone' 
        />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-detail">
              <p>Subtotal</p>
              <p>₹{convertToINR(cartTotalUSD)}</p>
            </div>
            <hr />
            <div className="cart-total-detail">
              <p>Delivery Fee</p>
              <p>₹{convertToINR(deliveryFeeUSD)}</p>
            </div>
            <hr />
            <div className="cart-total-detail">
              <b>Total</b>
              <b>₹{convertToINR(totalAmountUSD)}</b>
            </div>
          </div>
          
          {/* Debug info - remove in production */}
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#666', 
            marginTop: '10px',
            padding: '8px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px'
          }}>
            <p>Debug: USD Amount = ${totalAmountUSD}</p>
            <p>Rate: 1 USD = ₹{exchangeRate}</p>
          </div>

          <button type='submit'>PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;