const express = require("express");
const router = express.Router();
const addressController = require("../controllers/AddressController");
const axios = require("axios");

const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization");
  console.log("[ADDRESS] Token received:", token ? "YES" : "NO");
  
  if (!token) {
    console.error("[ADDRESS] No token provided");
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    console.log("[ADDRESS] Validating token with user-service...");
    const userServiceUrl = process.env.USER_SERVICE_URL || "http://user-service:5001";
    const response = await axios.get(
      `${userServiceUrl}/api/auth/validate-token`,
      {
        headers: { Authorization: token },
      }
    );
    console.log("[ADDRESS] Token validation successful");
    req.user = response.data.user;
    next();
  } catch (err) {
    console.error("[ADDRESS] Token verification failed:", err.message);
    console.error("[ADDRESS] Error response:", err.response?.data);
    return res.status(401).json({ message: "Invalid token" });
  }
};

router.use(verifyToken);
router.get("/", addressController.getAddressesByUserID);
router.post("/", addressController.addAddress);
router.put("/:id", addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);
router.put("/:id/default", addressController.setDefaultAddress);
module.exports = router;
