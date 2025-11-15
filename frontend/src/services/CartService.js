import axiosInstance, { debugLog } from "../utils/axiosInstance";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE}/cart`;

export const getCart = async () => {
  console.log("DA VAO CART");
  try {
    const response = await axiosInstance.get("/cart");
    return response.data;
  } catch (error) {
    console.error("Error getting cart:", error);
    throw error;
  }
};

export const addToCart = async (bookID, quantity) => {
  try {
    console.log(
      "CartService addToCart - bookID:",
      bookID,
      "quantity:",
      quantity
    );
    const response = await axiosInstance.post("/cart", {
      bookID,
      quantity,
    });
    console.log("CartService addToCart - response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    console.error("Error response data:", error.response?.data);
    throw error;
  }
};

export const updateQuantity = async (bookID, quantity) => {
  try {
    const response = await axiosInstance.put("/cart/quantity", {
      bookID,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating quantity:", error);
    throw error;
  }
};

export const removeFromCart = async (bookID) => {
  try {
    const response = await axiosInstance.delete(`/cart/${bookID}`);
    return response.data;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const response = await axiosInstance.delete("/cart");
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};
