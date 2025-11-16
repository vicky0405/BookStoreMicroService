const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const axios = require("axios");

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://localhost:5002";

// Doanh thu theo năm - gọi order-service API
const getRevenueByYear = async (year) => {
    if (!year) throw new Error("Thiếu tham số năm");
    
    try {
        const { data } = await axios.get(`${ORDER_SERVICE_URL}/api/reports/revenue`, {
            params: { year }
        });
        return data.data || [];
    } catch (error) {
        console.error("Error calling order-service revenue API:", error.message);
        throw new Error("Không thể lấy dữ liệu doanh thu từ order-service");
    }
};

// Doanh thu theo ngày trong tháng - gọi order-service API
const getDailyRevenueByMonth = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    try {
        const { data } = await axios.get(`${ORDER_SERVICE_URL}/api/reports/daily-revenue`, {
            params: { month, year }
        });
        return data.data || [];
    } catch (error) {
        console.error("Error calling order-service daily-revenue API:", error.message);
        throw new Error("Không thể lấy dữ liệu doanh thu từ order-service");
    }
};

const getTotalRevenueByMonth = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    try {
        const { data } = await axios.get(`${ORDER_SERVICE_URL}/api/reports/total-revenue`, {
            params: { month, year }
        });
        return data.data || { totalRevenue: 0, totalSold: 0 };
    } catch (error) {
        console.error("Error calling order-service total-revenue API:", error.message);
        throw new Error("Không thể lấy dữ liệu doanh thu từ order-service");
    }
};

// Top 10 sách bán chạy - lấy order details từ order-service, join với books từ backend
const getTop10MostSoldBooks = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    try {
        // Lấy dữ liệu order details từ order-service
        const { data } = await axios.get(`${ORDER_SERVICE_URL}/api/reports/order-details`, {
            params: { month, year }
        });
        const orderDetails = data.data || [];
        
        if (orderDetails.length === 0) {
            return [];
        }
        
        // Join với books và book_images từ backend database
        const bookIds = orderDetails.map(od => od.book_id).join(',');
        const results = await sequelize.query(
            `SELECT TOP 10
                b.id,
                b.title,
                fi.image_path AS image_path,
                od.total_sold
             FROM (VALUES ${orderDetails.map(od => `(${od.book_id}, ${od.total_sold})`).join(',')}) AS od(book_id, total_sold)
             JOIN books b ON od.book_id = b.id
             LEFT JOIN (
                SELECT bi1.book_id, bi1.image_path
                FROM book_images bi1
                INNER JOIN (
                    SELECT book_id, MIN(id) AS min_id
                    FROM book_images
                    GROUP BY book_id
                ) first ON first.book_id = bi1.book_id AND first.min_id = bi1.id
             ) fi ON fi.book_id = b.id
             ORDER BY od.total_sold DESC`,
            {
                type: QueryTypes.SELECT
            }
        );
        return results;
    } catch (error) {
        console.error("Error in getTop10MostSoldBooks:", error.message);
        throw new Error("Không thể lấy dữ liệu sách bán chạy");
    }
};

// Lấy chi tiết doanh thu theo từng sách theo tháng trong năm
const getBookRevenueDetailsByYear = async (year, type = 'all') => {
    if (!year) {
        throw new Error("Thiếu tham số năm");
    }
    
    try {
        // Lấy dữ liệu từ order-service
        const { data } = await axios.get(`${ORDER_SERVICE_URL}/api/reports/book-revenue-year`, {
            params: { year }
        });
        const orderData = data.data || [];
        
        if (orderData.length === 0) {
            return [];
        }
        
        // Lấy thông tin sách từ backend
        const bookIds = [...new Set(orderData.map(od => od.book_id))];
        const books = await sequelize.query(
            `SELECT id, title, price FROM books WHERE id IN (${bookIds.join(',')})`,
            { type: QueryTypes.SELECT }
        );
        
        const bookMap = Object.fromEntries(books.map(b => [b.id, b]));
        
        // Kết hợp dữ liệu
        return orderData.map(od => ({
            id: od.book_id,
            title: bookMap[od.book_id]?.title || '',
            price: bookMap[od.book_id]?.price || 0,
            month: od.month,
            quantity_sold: od.quantity_sold,
            revenue: od.revenue
        })).sort((a, b) => a.month - b.month || a.title.localeCompare(b.title));
    } catch (error) {
        console.error("Error in getBookRevenueDetailsByYear:", error.message);
        throw new Error("Không thể lấy dữ liệu chi tiết doanh thu");
    }
};

// Lấy chi tiết doanh thu theo từng sách theo ngày trong tháng
const getBookRevenueDetailsByMonth = async (month, year, type = 'all') => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    try {
        // Lấy dữ liệu từ order-service
        const { data } = await axios.get(`${ORDER_SERVICE_URL}/api/reports/book-revenue-month`, {
            params: { month, year }
        });
        const orderData = data.data || [];
        
        if (orderData.length === 0) {
            return [];
        }
        
        // Lấy thông tin sách từ backend
        const bookIds = [...new Set(orderData.map(od => od.book_id))];
        const books = await sequelize.query(
            `SELECT id, title, price FROM books WHERE id IN (${bookIds.join(',')})`,
            { type: QueryTypes.SELECT }
        );
        
        const bookMap = Object.fromEntries(books.map(b => [b.id, b]));
        
        // Kết hợp dữ liệu
        return orderData.map(od => ({
            id: od.book_id,
            title: bookMap[od.book_id]?.title || '',
            price: bookMap[od.book_id]?.price || 0,
            day: od.day,
            quantity_sold: od.quantity_sold,
            revenue: od.revenue
        })).sort((a, b) => a.day - b.day || a.title.localeCompare(b.title));
    } catch (error) {
        console.error("Error in getBookRevenueDetailsByMonth:", error.message);
        throw new Error("Không thể lấy dữ liệu chi tiết doanh thu");
    }
};

module.exports = {
    getRevenueByYear,
    getDailyRevenueByMonth,
    getTotalRevenueByMonth,
    getTop10MostSoldBooks,
    getBookRevenueDetailsByYear,
    getBookRevenueDetailsByMonth
};