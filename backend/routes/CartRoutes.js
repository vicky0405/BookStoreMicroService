const express = require("express");
const router = express.Router();
const CartController = require("../controllers/CartController");

const axios = require("axios");

const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization");
  console.log("[CART] Token received:", token ? "YES" : "NO");
  
  if (!token) {
    console.error("[CART] No token provided");
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    console.log("[CART] Validating token with user-service...");
    const userServiceUrl = process.env.USER_SERVICE_URL || "http://user-service:5001";
    const response = await axios.get(
      `${userServiceUrl}/api/auth/validate-token`,
      {
        headers: { Authorization: token },
      }
    );
    console.log("[CART] Response from user-service:", JSON.stringify(response.data, null, 2));
    console.log("[CART] Token validation successful");
    req.user = response.data.user;
    console.log("[CART] req.user set to:", JSON.stringify(req.user, null, 2));
    next();
  } catch (err) {
    console.error("[CART] Token verification failed:", err.message);
    console.error("[CART] Error response:", err.response?.data);
    console.error("[CART] Error status:", err.response?.status);
    return res.status(401).json({ message: "Invalid token: " + err.message });
  }
};

router.use(verifyToken);
router.get("/", CartController.getCart);
router.post("/", CartController.addToCart);
router.put("/quantity", CartController.updateQuantity);
// delete specific book from cart by bookID
router.delete("/:bookID", CartController.removeFromCart);
// clear entire cart for current user
router.delete("/", CartController.clearCart);
module.exports = router;
