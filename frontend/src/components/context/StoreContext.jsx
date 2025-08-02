import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const url = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

  //  Add to Cart
  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          { headers: { token } }
        );
      } catch (err) {
        console.error("Error adding to cart:", err);
      }
    }
  };

  // Remove from Cart
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          { headers: { token } }
        );
      } catch (err) {
        console.error("Error removing from cart:", err);
      }
    }
  };

  //  Total Amount Calculator
  const getTotalCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const product = food_list.find((p) => p._id === itemId);
      if (product) {
        total += product.price * cartItems[itemId];
      }
    }
    return total;
  };

  //  Fetch Food List
  const fetchFoodList = async () => {
    try {
      const res = await axios.get(`${url}/api/food/list`);
      if (res.data?.data) {
        setFoodList(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch food list:", err);
    }
  };

  //  Load Cart from Backend
  const loadCartData = async (userToken) => {
    try {
      const res = await axios.post(
        `${url}/api/cart/get`,
        {},
        { headers: { token: userToken } }
      );
      if (res.data?.cartData) {
        setCartItems(res.data.cartData);
      }
    } catch (err) {
      console.error("Failed to load cart data:", err);
    }
  };

  //  On Load - fetch food and cart
  useEffect(() => {
    const init = async () => {
      await fetchFoodList();
      if (token) {
        await loadCartData(token);
      }
    };
    init();
  }, [token]);

  const contextValue = {
    food_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
