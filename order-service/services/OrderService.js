const {
  sequelize,
  Order,
  OrderDetail,
  OrderAssignment,
  ShippingMethod,
} = require("../models");
const { Op } = require("sequelize");
const axios = require("axios");
require("dotenv").config();

let messageBus;

if (process.env.AZURE_CONNECTION_STRING) {
  // Azure deploy
  const AzureAdapter = require("../messaging/azureAdapter");
  messageBus = new AzureAdapter(process.env.AZURE_CONNECTION_STRING);
} else {
  // Local dev or Docker without Azure
  messageBus = require("../messaging/localAdapter");
}

const MONOLITH_URL = process.env.MONOLITH_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

const getOrdersByUserID = async (userID, page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;

  const { count, rows: orders } = await Order.findAndCountAll({
    where: { user_id: userID },
    include: [
      { model: ShippingMethod, as: "shippingMethod", attributes: ["name"] },
      { model: OrderDetail, as: "details" },
    ],
    order: [["order_date", "DESC"]],
    limit: pageSize,
    offset,
  });

  // 👉 gom tất cả book_id từ OrderDetails
  const bookIds = [
    ...new Set(orders.flatMap((order) => order.details.map((d) => d.book_id))),
  ];

  // 👉 gọi Book Service
  let bookMap = {};
  if (bookIds.length > 0) {
    const { data: books } = await axios.post(
      MONOLITH_URL + "/api/books/batch",
      {
        ids: bookIds,
      }
    );
    bookMap = books.reduce((map, book) => {
      map[book.id] = book;
      return map;
    }, {});
  }

  // 👉 merge thông tin book vào từng detail
  const ordersWithBook = orders.map((order) => ({
    ...order.toJSON(),
    details: order.details.map((d) => ({
      ...d.toJSON(),
      book: bookMap[d.book_id] || null,
    })),
  }));
  return { orders: ordersWithBook, total: count };
};

const getAllOrdersByStatus = async (status, page = 1, pageSize = 10) => {
  const dbStatus = status === "processing" ? "pending" : status;
  const offset = (page - 1) * pageSize;

  // 1️⃣ Lấy order + details + shippingMethod + assignment
  const include = [
    { model: ShippingMethod, as: "shippingMethod", attributes: ["name"] },
    { model: OrderDetail, as: "details" },
  ];

  if (dbStatus === "delivering") {
    include.push({ model: OrderAssignment, as: "assignment" });
  }

  const { count, rows } = await Order.findAndCountAll({
    where: { status: dbStatus },
    include,
    order: [["order_date", "DESC"]],
    limit: pageSize,
    offset,
  });

  const orders = rows.map((r) => r.toJSON());

  // 2️⃣ Gọi User Service batch để lấy thông tin user + shipper
  const userIds = orders.map((o) => o.user_id);
  const shipperIds = orders
    .filter((o) => o.assignment)
    .map((o) => o.assignment.shipper_id)
    .filter(Boolean);

  const uniqueUserIds = [...new Set([...userIds, ...shipperIds])];
  let userMap = {};

  if (uniqueUserIds.length > 0) {
    try {
      const { data: users } = await axios.post(
        `${USER_SERVICE_URL}/api/users/batch`,
        { ids: uniqueUserIds }
      );
      userMap = Object.fromEntries(users.map((u) => [u.id, u]));
    } catch (err) {
      console.error("⚠️ Không thể lấy thông tin user/shipper:", err.message);
    }
  }

  // 3️⃣ Gọi Book Service để lấy thông tin sách
  const bookIds = orders
    .flatMap((o) => o.details.map((d) => d.book_id))
    .filter(Boolean);

  const uniqueBookIds = [...new Set(bookIds)];
  let bookMap = {};

  if (uniqueBookIds.length > 0) {
    try {
      const { data: books } = await axios.post(
        `${MONOLITH_URL}/api/books/batch`,
        { ids: uniqueBookIds }
      );
      bookMap = Object.fromEntries(books.map((b) => [b.id, b]));
    } catch (err) {
      console.error("⚠️ Không thể lấy thông tin sách:", err.message);
    }
  }

  // 4️⃣ Gắn thông tin user, shipper, book vào orders
  orders.forEach((o) => {
    o.user = userMap[o.user_id] || null;

    if (o.assignment && o.assignment.shipper_id) {
      o.assignment.shipper = userMap[o.assignment.shipper_id] || null;
    }

    if (o.details?.length) {
      o.details = o.details.map((d) => ({
        ...d,
        book: bookMap[d.book_id] || null,
      }));
    }
  });

  return { orders, total: count };
};

const getOrdersByStatusAndUser = async (
  status,
  userID,
  page = 1,
  pageSize = 10
) => {
  const offset = (page - 1) * pageSize;

  // 1️⃣ Lấy danh sách orders + order details
  const { count, rows: orders } = await Order.findAndCountAll({
    where: { status, user_id: userID },
    include: [
      { model: ShippingMethod, as: "shippingMethod", attributes: ["name"] },
      { model: OrderDetail, as: "details" },
    ],
    order: [["order_date", "DESC"]],
    limit: pageSize,
    offset,
  });

  // 2️⃣ Gom toàn bộ book_id để gọi Book Service 1 lần
  const bookIds = [
    ...new Set(orders.flatMap((order) => order.details.map((d) => d.book_id))),
  ];

  let bookMap = {};
  if (bookIds.length > 0) {
    try {
      const { data: books } = await axios.post(
        MONOLITH_URL + "/api/books/batch",
        {
          ids: bookIds,
        }
      );
      bookMap = books.reduce((map, book) => {
        map[book.id] = book;
        return map;
      }, {});
    } catch (err) {
      console.error("❌ Lỗi gọi Book Service:", err.message);
    }
  }

  // 3️⃣ Merge dữ liệu book vào từng order detail
  const ordersWithBooks = orders.map((order) => ({
    ...order.toJSON(),
    details: order.details.map((d) => ({
      ...d.toJSON(),
      book: bookMap[d.book_id] || null,
    })),
  }));

  return { orders: ordersWithBooks, total: count };
};

const getOrdersByShipperID = async (
  shipperID,
  status,
  page = 1,
  pageSize = 10
) => {
  const offset = (page - 1) * pageSize;

  // 1️⃣ Lấy danh sách đơn hàng + chi tiết đơn + assignment
  const { count, rows } = await Order.findAndCountAll({
    where: { status },
    include: [
      { model: ShippingMethod, as: "shippingMethod", attributes: ["name"] },
      { model: OrderDetail, as: "details" },
      {
        model: OrderAssignment,
        as: "assignment",
        where: { shipper_id: shipperID },
        attributes: ["completion_date"],
      },
    ],
    order: [["order_date", "DESC"]],
    limit: pageSize,
    offset,
  });

  const orders = rows.map((o) => o.toJSON());

  // 2️⃣ Thu thập danh sách user_id và book_id để gọi batch API
  const userIds = [...new Set(orders.map((o) => o.user_id))];
  const bookIds = [
    ...new Set(orders.flatMap((o) => o.details.map((d) => d.book_id))),
  ];

  let userMap = {};
  let bookMap = {};

  // 3️⃣ Gọi User Service để lấy thông tin người dùng
  if (userIds.length > 0) {
    try {
      const { data: users } = await axios.post(
        `${USER_SERVICE_URL}/api/users/batch`,
        { ids: userIds }
      );
      userMap = Object.fromEntries(users.map((u) => [u.id, u]));
    } catch (err) {
      console.error("⚠️ Lỗi gọi User Service:", err.message);
    }
  }

  // 4️⃣ Gọi Book Service để lấy thông tin sách
  if (bookIds.length > 0) {
    try {
      const { data: books } = await axios.post(
        `${MONOLITH_URL}/api/books/batch`,
        { ids: bookIds }
      );
      bookMap = Object.fromEntries(books.map((b) => [b.id, b]));
    } catch (err) {
      console.error("⚠️ Lỗi gọi Book Service:", err.message);
    }
  }

  // 5️⃣ Gắn dữ liệu user và book vào orders
  const ordersWithDetails = orders.map((order) => ({
    ...order,
    user: userMap[order.user_id] || null,
    details: order.details.map((d) => ({
      ...d,
      Book: bookMap[d.book_id] || null,
    })),
  }));

  return { orders: ordersWithDetails, total: count };
};

const createOrder = async (orderData) => {
  console.log('[ORDER SERVICE] createOrder started');
  console.log('[ORDER SERVICE] orderData:', JSON.stringify(orderData, null, 2));
  
  const {
    userID,
    shipping_method_id,
    shipping_address,
    promotion_code,
    total_amount,
    shipping_fee,
    discount_amount,
    final_amount,
    payment_method,
    orderDetails,
  } = orderData;

  console.log('[ORDER SERVICE] Starting transaction...');
  const order = await sequelize.transaction(async (t) => {
    console.log('[ORDER SERVICE] Creating order record...');
    // Tạo đơn hàng
    const newOrder = await Order.create(
      {
        user_id: userID,
        shipping_method_id,
        shipping_address,
        promotion_code: promotion_code || null,
        total_amount,
        shipping_fee,
        discount_amount,
        final_amount,
        payment_method,
        status: "pending",
      },
      { transaction: t }
    );

    console.log('[ORDER SERVICE] Order created with ID:', newOrder.id);
    console.log('[ORDER SERVICE] Creating order details...');
    
    // Lưu chi tiết đơn
    for (const detail of orderDetails) {
      await OrderDetail.create(
        {
          order_id: newOrder.id,
          book_id: detail.book_id,
          quantity: detail.quantity,
          unit_price: detail.unit_price,
        },
        { transaction: t }
      );
    }

    console.log('[ORDER SERVICE] Order details created');
    return newOrder;
  });

  console.log('[ORDER SERVICE] Transaction committed successfully');
  
  // Emit event "order.created" KHÔNG CHỜ (fire-and-forget)
  // Response sẽ trả về ngay, message bus xử lý background
  setImmediate(() => {
    messageBus.publish("order.created", {
      orderId: order.id,
      orderDetails: orderDetails.map((d) => ({
        book_id: d.book_id,
        quantity: d.quantity,
      })),
    }).catch(err => {
      console.error("⚠️ Failed to publish order.created event:", err.message);
    });
  });

  console.log('[ORDER SERVICE] Returning order:', order.id);
  return order;
};

const confirmOrder = async (orderId) => {
  const order = await Order.findByPk(orderId);
  if (!order) throw new Error("Order not found");
  order.status = "confirmed";
  await order.save();
  return order;
};

const completeOrder = async (orderId) => {
  const order = await Order.findByPk(orderId);
  if (!order) throw new Error("Order not found");
  order.status = "delivered";
  await order.save();

  const assignment = await OrderAssignment.findOne({
    where: { order_id: orderId },
  });
  if (assignment) {
    await assignment.update({
      completion_date: sequelize.literal('GETDATE()')
    });
  }

  return { order, assignment };
};

const cancelOrder = async (orderId) => {
  return await sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, { transaction: t });
    if (!order) throw new Error("Order not found");

    // Nếu đã hủy rồi thì không cộng tồn kho lần nữa (idempotent)
    if (order.status === "cancelled") {
      return { success: true, message: "Đơn hàng đã ở trạng thái hủy" };
    }

    // Chỉ khôi phục tồn kho nếu đơn chưa giao/hoàn tất
    if (["delivered", "completed"].includes(order.status)) {
      order.status = "cancelled";
      await order.save({ transaction: t });
      return {
        success: true,
        message: "Đơn đã hoàn tất, chuyển trạng thái hủy (không hoàn kho)",
      };
    }

    // Lấy chi tiết đơn để emit event khôi phục kho
    const details = await OrderDetail.findAll({
      where: { order_id: orderId },
      transaction: t,
    });

    // Cập nhật trạng thái đơn hàng
    order.status = "cancelled";
    await order.save({ transaction: t });

    // Emit event "order.cancelled" để Book Service khôi phục tồn kho
    // Không chờ message bus, fire-and-forget
    setImmediate(() => {
      messageBus.publish("order.cancelled", {
        orderId: order.id,
        orderDetails: details.map((d) => ({
          book_id: d.book_id,
          quantity: d.quantity,
        })),
      }).catch(err => {
        console.error("⚠️ Failed to publish order.cancelled event:", err.message);
      });
    });

    return {
      success: true,
      message: "Đơn hàng đã được hủy và yêu cầu khôi phục tồn kho đã được gửi",
    };
  });
};

const assignOrderToShipper = async (orderId, shipperId, assignedBy) => {
  console.log('[ORDER SERVICE] assignOrderToShipper called with:', { orderId, shipperId, assignedBy });
  
  if (!orderId || !shipperId || !assignedBy) {
    console.error('[ORDER SERVICE] Missing required parameters:', { orderId, shipperId, assignedBy });
    throw new Error("Thiếu thông tin orderId, shipperId hoặc assignedBy");
  }

  console.log('[ORDER SERVICE] Finding order by ID:', orderId);
  const order = await Order.findByPk(orderId);
  if (!order) {
    console.error('[ORDER SERVICE] Order not found:', orderId);
    throw new Error("Order not found");
  }

  console.log('[ORDER SERVICE] Current order status:', order.status);
  console.log('[ORDER SERVICE] Updating order status to delivering...');
  order.status = "delivering";
  await order.save();

  console.log('[ORDER SERVICE] Creating OrderAssignment...');
  const assignment = await OrderAssignment.create({
    order_id: orderId,
    assigned_by: assignedBy,
    shipper_id: shipperId,
    completion_date: null,
  });

  console.log('[ORDER SERVICE] OrderAssignment created successfully:', assignment.id);
  return order;
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
  assignOrderToShipper,
};
