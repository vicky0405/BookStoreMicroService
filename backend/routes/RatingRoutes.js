const express = require("express");
const router = express.Router();
const RatingController = require("../controllers/RatingController");
const axios = require("axios");

const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization");
  console.log("[RATING] Token received:", token ? "YES" : "NO");
  
  if (!token) {
    console.error("[RATING] No token provided");
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    console.log("[RATING] Validating token with user-service...");
    const userServiceUrl = process.env.USER_SERVICE_URL || "http://user-service:5001";
    const response = await axios.get(
      `${userServiceUrl}/api/auth/validate-token`,
      {
        headers: { Authorization: token },
      }
    );
    console.log("[RATING] Token validation successful");
    req.user = response.data.user;
    next();
  } catch (err) {
    console.error("[RATING] Token verification failed:", err.message);
    console.error("[RATING] Error response:", err.response?.data);
    return res.status(401).json({ message: "Invalid token" });
  }
};

router.get("/book/:bookID", RatingController.getAllRatingsByBookID);
router.get(
  "/has-purchased/:bookID",
  verifyToken,
  RatingController.hasPurchasedBook
);
router.post("/rate", verifyToken, RatingController.rateBook);

module.exports = router;
