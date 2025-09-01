// src/utils/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; 
// fallback for local dev

/**
 * Generic fetch wrapper
 * @param {string} endpoint - API route (e.g., "/api/foods")
 * @param {object} options - fetch options (method, headers, body, etc.)
 * @returns {Promise<any>}
 */
export const fetchData = async (endpoint, options = {}) => {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Fetch error:", error.message);
    throw error;
  }
};

/**
 * Example: Get all foods
 */
export const getFoods = () => fetchData("/api/foods");

/**
 * Example: Add food (Admin only)
 * @param {object} foodData
 */
export const addFood = (foodData) =>
  fetchData("/api/foods", {
    method: "POST",
    body: JSON.stringify(foodData),
  });

/**
 * Example: User login
 * @param {object} credentials
 */
export const loginUser = (credentials) =>
  fetchData("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
