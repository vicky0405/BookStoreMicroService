const express = require("express");
const router = express.Router();
const reportController = require("../controllers/ReportController");

// Online endpoints (E-commerce)
router.get("/revenue-online", reportController.getRevenueByYear);
router.get("/daily-revenue-online", reportController.getDailyRevenueByMonth);
router.get("/revenue", reportController.getTotalRevenueByMonth);
router.get("/top10-online", reportController.getTop10MostSoldBooks);
router.get("/book-revenue-by-year", reportController.getBookRevenueDetailsByYear);
router.get("/book-revenue-by-month", reportController.getBookRevenueDetailsByMonth);

module.exports = router;