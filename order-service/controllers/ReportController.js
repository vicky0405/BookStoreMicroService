const ReportService = require("../services/ReportService");

const getRevenueByYear = async (req, res) => {
    try {
        const { year } = req.query;
        const result = await ReportService.getRevenueByYear(year);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in getRevenueByYear:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getDailyRevenueByMonth = async (req, res) => {
    try {
        const { month, year } = req.query;
        const result = await ReportService.getDailyRevenueByMonth(month, year);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in getDailyRevenueByMonth:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getTotalRevenueByMonth = async (req, res) => {
    try {
        const { month, year } = req.query;
        const result = await ReportService.getTotalRevenueByMonth(month, year);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in getTotalRevenueByMonth:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getOrderDetailsByMonth = async (req, res) => {
    try {
        const { month, year } = req.query;
        const result = await ReportService.getOrderDetailsByMonth(month, year);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in getOrderDetailsByMonth:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getBookRevenueDetailsByYear = async (req, res) => {
    try {
        const { year } = req.query;
        const result = await ReportService.getBookRevenueDetailsByYear(year);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in getBookRevenueDetailsByYear:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getBookRevenueDetailsByMonth = async (req, res) => {
    try {
        const { month, year } = req.query;
        const result = await ReportService.getBookRevenueDetailsByMonth(month, year);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in getBookRevenueDetailsByMonth:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getRevenueByYear,
    getDailyRevenueByMonth,
    getTotalRevenueByMonth,
    getOrderDetailsByMonth,
    getBookRevenueDetailsByYear,
    getBookRevenueDetailsByMonth
};
