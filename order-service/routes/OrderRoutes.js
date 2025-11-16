const express = require("express");
const router = express.Router();
const axios = require("axios");

const AUTH_SERVICE_URL = process.env.USER_SERVICE_URL || process.env.AUTH_SERVICE_URL || "http://localhost:5001";

const verifyToken = async (req, res, next) => {
  const incomingAuth = req.header("Authorization") || "";
  const hasBearer = /^Bearer\s+/i.test(incomingAuth);
  const authHeader = hasBearer ? incomingAuth : (incomingAuth ? `Bearer ${incomingAuth}` : "");

  // Basic guard
  if (!authHeader) {
    console.warn("[ORDER-SERVICE] Missing Authorization header on", req.method, req.originalUrl);
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  try {
    console.log("[ORDER-SERVICE] Verifying token via:", `${AUTH_SERVICE_URL}/api/auth/validate-token`);
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/validate-token`, {
      headers: { Authorization: authHeader },
    });
    req.user = response.data.user;
    next();
  } catch (err) {
    const status = err?.response?.status || 500;
    const data = err?.response?.data || { message: err.message };
    console.warn("[ORDER-SERVICE] Token verification failed:", { status, data });
    return res.status(401).json({ message: "Invalid token" });
  }
};
const OrderController = require("../controllers/OrderController");

router.get(
  "/processing",
  verifyToken,
  OrderController.getOrdersByStatusAndUser
);
router.get("/confirmed", verifyToken, OrderController.getOrdersByStatusAndUser);
router.get("/delivered", verifyToken, OrderController.getOrdersByStatusAndUser);
router.get(
  "/delivering",
  verifyToken,
  OrderController.getOrdersByStatusAndUser
);
router.get("/cancelled", verifyToken, OrderController.getOrdersByStatusAndUser);
router.get(
  "/delivering/shipper",
  verifyToken,
  OrderController.getOrdersByShipperID
);
router.get(
  "/delivered/shipper",
  verifyToken,
  OrderController.getOrdersByShipperID
);
router.get(
  "/processing/all",
  verifyToken,
  OrderController.getAllOrdersByStatus
);
router.get("/confirmed/all", verifyToken, OrderController.getAllOrdersByStatus);
router.get(
  "/delivering/all",
  verifyToken,
  OrderController.getAllOrdersByStatus
);
router.get("/delivered/all", verifyToken, OrderController.getAllOrdersByStatus);
router.get("/", verifyToken, OrderController.getOrdersByUserID);
router.post("/", verifyToken, OrderController.createOrder);
router.patch("/:orderId/confirm", verifyToken, OrderController.confirmOrder);
router.patch("/:orderId/complete", verifyToken, OrderController.completeOrder);
router.patch("/:orderId/cancel", verifyToken, OrderController.cancelOrder);
router.post(
  "/:orderId/assign-shipper",
  verifyToken,
  OrderController.assignOrderToShipper
);

module.exports = router;
