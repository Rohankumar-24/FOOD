import React, { useContext, useEffect, useState, useRef } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../context/StoreContext";

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
  const quantity = cartItems?.[id] || 0;

  const [usdToInrRate, setUsdToInrRate] = useState(0);
  const [rateChange, setRateChange] = useState(null); // 'up', 'down', or null
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const previousRate = useRef(null);

  // Fetch the current USD → INR rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        setIsLoading(true);
        
        // Using a more reliable API with multiple fallbacks
        const apis = [
          "https://api.exchangerate-api.com/v4/latest/USD",
          "https://api.fxratesapi.com/latest?base=USD&symbols=INR",
          "https://api.exchangerate.host/latest?base=USD&symbols=INR"
        ];
        
        let data = null;
        let currentRate = null;
        
        // Try each API until one works
        for (const apiUrl of apis) {
          try {
            const response = await fetch(apiUrl);
            if (response.ok) {
              data = await response.json();
              
              // Handle different API response formats
              if (data.rates && data.rates.INR) {
                currentRate = data.rates.INR;
                break;
              }
            }
          } catch (apiError) {
            console.warn(`API ${apiUrl} failed:`, apiError);
            continue;
          }
        }
        
        if (currentRate) {
          // Compare with previous rate to show trend
          if (previousRate.current !== null) {
            if (currentRate > previousRate.current) {
              setRateChange('up');
            } else if (currentRate < previousRate.current) {
              setRateChange('down');
            } else {
              setRateChange(null);
            }
          }
          
          previousRate.current = currentRate;
          setUsdToInrRate(currentRate);
          setLastUpdated(new Date());
        } else {
          throw new Error("All APIs failed");
        }
        
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        // Fallback to a reasonable default rate
        const fallbackRate = 83.50;
        setUsdToInrRate(fallbackRate);
        setRateChange(null);
        
        // Show user that we're using fallback rate
        console.warn("Using fallback exchange rate:", fallbackRate);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchExchangeRate();
    
    // Update rate every 5 minutes
    const interval = setInterval(fetchExchangeRate, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const priceInINR = (price * usdToInrRate).toFixed(0);

  const getRateIcon = () => {
    if (isLoading) return "⟳";
    if (rateChange === 'up') return "↗️";
    if (rateChange === 'down') return "↘️";
    return "💱";
  };

  const getRateColor = () => {
    if (rateChange === 'up') return "#22c55e"; // green
    if (rateChange === 'down') return "#ef4444"; // red
    return "#6b7280"; // gray
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return "";
    const minutes = Math.floor((new Date() - lastUpdated) / (1000 * 60));
    if (minutes === 0) return "just now";
    if (minutes === 1) return "1 min ago";
    return `${minutes} mins ago`;
  };

  return (
    <div className="food-item">
      {/* Image & Add-to-Cart Button */}
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={`${url}/images/${image}`}
          alt={name}
        />

        {quantity > 0 ? (
          <div className="food-item-counter">
            <img
              onClick={() => removeFromCart(id)}
              src={assets.remove_icon_red}
              alt="Remove"
              className="icon-btn"
            />
            <p>{quantity}</p>
            <img
              onClick={() => addToCart(id)}
              src={assets.add_icon_green}
              alt="Add"
              className="icon-btn"
            />
          </div>
        ) : (
          <img
            className="add"
            onClick={() => addToCart(id)}
            src={assets.add_icon_white}
            alt="Add to cart"
          />
        )}
      </div>

      {/* Info Section */}
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="Rating stars" />
        </div>
        <p className="food-item-desc">{description}</p>
        
        <div className="food-item-price">
          <div className="price-main">
            ${price} / ₹{isLoading ? "..." : priceInINR}
          </div>
          
          {!isLoading && (
            <div 
              className="exchange-rate-info"
              style={{ 
                fontSize: '0.75rem', 
                color: getRateColor(),
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '2px'
              }}
            >
              <span>{getRateIcon()}</span>
              <span>1 USD = ₹{usdToInrRate.toFixed(2)}</span>
              {lastUpdated && (
                <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>
                  ({formatLastUpdated()})
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodItem;