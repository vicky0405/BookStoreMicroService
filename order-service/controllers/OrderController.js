const OrderService = require('../services/OrderService');
const getOrdersByUserID = async (req, res) => {
    try {
        const userID = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const result = await OrderService.getOrdersByUserID(userID, page, pageSize);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in getOrdersByUserID:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

const getAllOrdersByStatus = async (req, res) => {
    try {
        const status = getStatusFromRoute(req.path);
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const result = await OrderService.getAllOrdersByStatus(status, page, pageSize);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in getOrdersByStatus:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

const getOrdersByStatusAndUser = async (req, res) => {
    try {
        const userID = req.user.id;
        const status = getStatusFromRoute(req.path);
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const result = await OrderService.getOrdersByStatusAndUser(status, userID, page, pageSize);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in getOrdersByStatusAndUser:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

const getOrdersByShipperID = async (req, res) => {
    try {
        const shipperID = req.user.id;
        const status = getStatusFromRoute(req.path);
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const result = await OrderService.getOrdersByShipperID(shipperID, status, page, pageSize);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in getOrdersByShipperID:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

const createOrder = async (req, res) => {
    try {
        console.log('[ORDER CONTROLLER] createOrder called');
        console.log('[ORDER CONTROLLER] req.user:', req.user);
        console.log('[ORDER CONTROLLER] req.body:', JSON.stringify(req.body, null, 2));
        
        const userID = req.user.id;
        const orderData = {
            ...req.body,
            userID
        };
        console.log('[ORDER CONTROLLER] Calling OrderService.createOrder...');
        const result = await OrderService.createOrder(orderData);
        console.log('[ORDER CONTROLLER] Order created successfully:', result.id);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        console.error('[ORDER CONTROLLER] Error in createOrder:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};


const confirmOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await OrderService.confirmOrder(orderId);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in confirmOrder:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

const completeOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await OrderService.completeOrder(orderId);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in completeOrder:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await OrderService.cancelOrder(orderId);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error in cancelOrder:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

const assignOrderToShipper = async (req, res) => {
    try {
        console.log('[ORDER CONTROLLER] assignOrderToShipper called');
        console.log('[ORDER CONTROLLER] req.params:', req.params);
        console.log('[ORDER CONTROLLER] req.body:', req.body);
        console.log('[ORDER CONTROLLER] req.user:', req.user);
        
        const { orderId } = req.params;
        const { shipper_id } = req.body;
        const assignedBy = req.user?.id || null;
        
        console.log('[ORDER CONTROLLER] Calling OrderService.assignOrderToShipper with:', { orderId, shipper_id, assignedBy });
        const result = await OrderService.assignOrderToShipper(orderId, shipper_id, assignedBy);
        
        console.log('[ORDER CONTROLLER] Assignment successful');
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('[ORDER CONTROLLER] Error in assignOrderToShipper:', error);
        res.status(500).json({ success: false, error: error.message || "Failed to assign order to shipper" });
    }
};

const getStatusFromRoute = (path) => {
    if (path.includes('/processing')) return 'pending';
    if (path.includes('/confirmed')) return 'confirmed';
    if (path.includes('/delivering')) return 'delivering';
    if (path.includes('/delivered')) return 'delivered';
    if (path.includes('/cancelled')) return 'cancelled';
    return 'pending'; 
};

module.exports = {
    getOrdersByUserID,
    getAllOrdersByStatus,
    getOrdersByStatusAndUser,
    getOrdersByShipperID,
    createOrder,
    confirmOrder,
    completeOrder,
    cancelOrder,
    assignOrderToShipper
};