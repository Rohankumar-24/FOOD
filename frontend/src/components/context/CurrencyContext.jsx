// src/components/context/CurrencyContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [exchangeRate, setExchangeRate] = useState(83.50); // fallback rate
  const [rateChange, setRateChange] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchExchangeRate = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Multiple API endpoints for reliability
      const apis = [
        {
          url: "https://api.exchangerate-api.com/v4/latest/USD",
          parser: (data) => data.rates?.INR
        },
        {
          url: "https://api.fxratesapi.com/latest?base=USD&symbols=INR", 
          parser: (data) => data.rates?.INR
        },
        {
          url: "https://api.exchangerate.host/latest?base=USD&symbols=INR",
          parser: (data) => data.rates?.INR
        }
      ];

      let newRate = null;
      
      for (const api of apis) {
        try {
          const response = await fetch(api.url);
          if (response.ok) {
            const data = await response.json();
            newRate = api.parser(data);
            if (newRate && !isNaN(newRate)) {
              break;
            }
          }
        } catch (apiError) {
          console.warn(`API ${api.url} failed:`, apiError);
          continue;
        }
      }

      if (newRate && !isNaN(newRate)) {
        // Determine rate change direction
        const prevRate = exchangeRate;
        if (prevRate && prevRate !== 83.50) { // ignore initial fallback comparison
          if (newRate > prevRate) {
            setRateChange('up');
          } else if (newRate < prevRate) {
            setRateChange('down'); 
          } else {
            setRateChange(null);
          }
        }

        setExchangeRate(newRate);
        setLastUpdated(new Date());
        
      } else {
        throw new Error('No valid exchange rate received from any API');
      }
      
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      setError(error.message);
      
      // Use fallback rate
      if (exchangeRate === 83.50) {
        setExchangeRate(83.50);
      }
    } finally {
      setIsLoading(false);
    }
  }, [exchangeRate]);

  // Convert USD to INR with consistent rounding
  const convertToINR = useCallback((usdAmount, decimals = 0) => {
    const inrAmount = usdAmount * exchangeRate;
    return decimals === 0 ? Math.round(inrAmount) : parseFloat(inrAmount.toFixed(decimals));
  }, [exchangeRate]);

  // Format currency display
  const formatPrice = useCallback((usdPrice, showBothCurrencies = true) => {
    const inrPrice = convertToINR(usdPrice);
    
    if (showBothCurrencies) {
      return `$${usdPrice} / ₹${inrPrice}`;
    }
    return `₹${inrPrice}`;
  }, [convertToINR]);

  // Initialize and set up periodic updates
  useEffect(() => {
    // Fetch fresh rate
    fetchExchangeRate();
    
    // Set up periodic updates every 5 minutes
    const interval = setInterval(fetchExchangeRate, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchExchangeRate]);

  const value = {
    exchangeRate,
    rateChange,
    isLoading,
    lastUpdated,
    error,
    convertToINR,
    formatPrice,
    refreshRate: fetchExchangeRate
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};