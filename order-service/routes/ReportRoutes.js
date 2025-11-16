const express = require("express");
const router = express.Router();
const ReportController = require("../controllers/ReportController");

router.get("/revenue", ReportController.getRevenueByYear);
router.get("/daily-revenue", ReportController.getDailyRevenueByMonth);
router.get("/total-revenue", ReportController.getTotalRevenueByMonth);
router.get("/order-details", ReportController.getOrderDetailsByMonth);
router.get("/book-revenue-year", ReportController.getBookRevenueDetailsByYear);
router.get("/book-revenue-month", ReportController.getBookRevenueDetailsByMonth);

module.exports = router;
