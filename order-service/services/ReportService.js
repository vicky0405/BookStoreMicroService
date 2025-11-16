const sequelize = require("../db");
const { QueryTypes } = require("sequelize");

const getRevenueByYear = async (year) => {
    if (!year) throw new Error("Thiếu tham số năm");
    
    const results = await sequelize.query(
        `SELECT MONTH(o.order_date) AS month,
                SUM(od.quantity * od.unit_price) AS totalRevenue,
                SUM(od.quantity) AS totalSold
         FROM orders o
         JOIN order_details od ON o.id = od.order_id
         WHERE YEAR(o.order_date) = ? AND o.status IN ('confirmed', 'delivering', 'delivered')
         GROUP BY MONTH(o.order_date)
         ORDER BY MONTH(o.order_date)`,
        {
            replacements: [year],
            type: QueryTypes.SELECT
        }
    );
    return results;
};

const getDailyRevenueByMonth = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    const results = await sequelize.query(
        `SELECT DAY(o.order_date) AS day,
                SUM(od.quantity * od.unit_price) AS totalRevenue,
                SUM(od.quantity) AS totalSold
         FROM orders o
         JOIN order_details od ON o.id = od.order_id
         WHERE MONTH(o.order_date) = ? AND YEAR(o.order_date) = ? AND o.status IN ('confirmed', 'delivering', 'delivered')
         GROUP BY DAY(o.order_date)
         ORDER BY DAY(o.order_date)`,
        {
            replacements: [month, year],
            type: QueryTypes.SELECT
        }
    );
    return results;
};

const getTotalRevenueByMonth = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    const results = await sequelize.query(
        `SELECT SUM(od.quantity * od.unit_price) AS totalRevenue,
                SUM(od.quantity) AS totalSold
         FROM orders o
         JOIN order_details od ON o.id = od.order_id
         WHERE MONTH(o.order_date) = ? AND YEAR(o.order_date) = ? AND o.status IN ('confirmed', 'delivering', 'delivered')`,
        {
            replacements: [month, year],
            type: QueryTypes.SELECT
        }
    );
    
    return {
        totalRevenue: results[0]?.totalRevenue || 0,
        totalSold: results[0]?.totalSold || 0
    };
};

const getOrderDetailsByMonth = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    const results = await sequelize.query(
        `SELECT 
            od.book_id,
            SUM(od.quantity) AS total_sold
         FROM order_details od
         JOIN orders o ON od.order_id = o.id
         WHERE MONTH(o.order_date) = ? AND YEAR(o.order_date) = ? AND o.status IN ('confirmed', 'delivering', 'delivered')
         GROUP BY od.book_id
         ORDER BY total_sold DESC`,
        {
            replacements: [month, year],
            type: QueryTypes.SELECT
        }
    );
    return results;
};

const getBookRevenueDetailsByYear = async (year) => {
    if (!year) {
        throw new Error("Thiếu tham số năm");
    }
    
    const results = await sequelize.query(
        `SELECT 
            od.book_id,
            MONTH(o.order_date) AS month,
            SUM(od.quantity) AS quantity_sold,
            SUM(od.quantity * od.unit_price) AS revenue
         FROM order_details od
         JOIN orders o ON od.order_id = o.id
         WHERE YEAR(o.order_date) = ? AND o.status IN ('confirmed', 'delivering', 'delivered')
         GROUP BY od.book_id, MONTH(o.order_date)
         ORDER BY MONTH(o.order_date)`,
        {
            replacements: [year],
            type: QueryTypes.SELECT
        }
    );
    return results;
};

const getBookRevenueDetailsByMonth = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    const results = await sequelize.query(
        `SELECT 
            od.book_id,
            DAY(o.order_date) AS day,
            SUM(od.quantity) AS quantity_sold,
            SUM(od.quantity * od.unit_price) AS revenue
         FROM order_details od
         JOIN orders o ON od.order_id = o.id
         WHERE MONTH(o.order_date) = ? AND YEAR(o.order_date) = ? AND o.status IN ('confirmed', 'delivering', 'delivered')
         GROUP BY od.book_id, DAY(o.order_date)
         ORDER BY DAY(o.order_date)`,
        {
            replacements: [month, year],
            type: QueryTypes.SELECT
        }
    );
    return results;
};

module.exports = {
    getRevenueByYear,
    getDailyRevenueByMonth,
    getTotalRevenueByMonth,
    getOrderDetailsByMonth,
    getBookRevenueDetailsByYear,
    getBookRevenueDetailsByMonth
};
