use orderservice

---------------------------------------------------------
-- 1. DROP TABLES IF EXISTS (THEO THỨ TỰ FOREIGN KEY)
---------------------------------------------------------
IF OBJECT_ID('dbo.order_assignments', 'U') IS NOT NULL DROP TABLE dbo.order_assignments;
IF OBJECT_ID('dbo.order_details', 'U') IS NOT NULL DROP TABLE dbo.order_details;
IF OBJECT_ID('dbo.orders', 'U') IS NOT NULL DROP TABLE dbo.orders;
IF OBJECT_ID('dbo.shipping_methods', 'U') IS NOT NULL DROP TABLE dbo.shipping_methods;
GO

---------------------------------------------------------
-- 2. CREATE TABLE: shipping_methods
---------------------------------------------------------
CREATE TABLE dbo.shipping_methods (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(MAX) NULL,
    delivery_time_days INT NULL,
    fee DECIMAL(10,0) DEFAULT 0,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT(GETDATE()),
    updated_at DATETIME DEFAULT(GETDATE())
);
GO

---------------------------------------------------------
-- 3. INSERT DATA: shipping_methods
---------------------------------------------------------
SET IDENTITY_INSERT dbo.shipping_methods ON;

INSERT INTO dbo.shipping_methods (id, name, description, delivery_time_days, fee, is_active, created_at, updated_at)
VALUES
(1,'Giao tiêu chuẩn','Giao hàng từ 3-5 ngày làm việc',5,20000,1,'2025-07-13 01:29:31','2025-07-13 01:29:31'),
(2,'Giao nhanh','Giao trong vòng 24h tại nội thành',2,40000,1,'2025-07-13 01:29:31','2025-07-13 01:29:31'),
(3,'Giao tiết kiệm','Giao chậm nhưng rẻ hơn',7,15000,1,'2025-07-13 01:29:31','2025-07-13 01:29:31');

SET IDENTITY_INSERT dbo.shipping_methods OFF;
GO

DBCC CHECKIDENT ('dbo.shipping_methods', RESEED, 3);
GO

---------------------------------------------------------
-- 4. CREATE TABLE: orders
---------------------------------------------------------
CREATE TABLE dbo.orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    order_date DATETIME DEFAULT(GETDATE()),
    shipping_method_id INT NULL,
    shipping_address VARCHAR(250),
    promotion_code VARCHAR(50),
    total_amount DECIMAL(10,0) NOT NULL,
    shipping_fee DECIMAL(10,0) NOT NULL,
    discount_amount DECIMAL(10,0) DEFAULT 0,
    final_amount DECIMAL(10,0) NOT NULL,

    payment_method VARCHAR(20) CHECK (payment_method IN ('cash','online')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','delivering','delivered','cancelled')),

    CONSTRAINT FK_orders_shipping FOREIGN KEY (shipping_method_id)
        REFERENCES dbo.shipping_methods(id) ON DELETE SET NULL
);
GO

---------------------------------------------------------
-- 5. INSERT DATA: orders
---------------------------------------------------------
SET IDENTITY_INSERT dbo.orders ON;

INSERT INTO dbo.orders (
    id, user_id, order_date, shipping_method_id, shipping_address,
    promotion_code, total_amount, shipping_fee, discount_amount,
    final_amount, payment_method, status
)
VALUES
(24,6,'2025-10-19 10:01:53',3,'fffffffffffff, qqqqqqqqq, Quận 1, TP. Hồ Chí Minh',NULL,124200,15000,0,139200,'online','pending'),
(25,6,'2025-11-11 05:44:07',3,'fffffffffffff, qqqqqqqqq, Quận 1, TP. Hồ Chí Minh',NULL,263000,15000,0,278000,'cash','pending');

SET IDENTITY_INSERT dbo.orders OFF;
GO

DBCC CHECKIDENT ('dbo.orders', RESEED, 25);
GO

---------------------------------------------------------
-- 6. CREATE TABLE: order_details
---------------------------------------------------------
CREATE TABLE dbo.order_details (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,0) NOT NULL,

    CONSTRAINT FK_order_details_order FOREIGN KEY (order_id)
        REFERENCES dbo.orders(id) ON DELETE CASCADE
);
GO

---------------------------------------------------------
-- 7. INSERT DATA: order_details
---------------------------------------------------------
SET IDENTITY_INSERT dbo.order_details ON;

INSERT INTO dbo.order_details (id, order_id, book_id, quantity, unit_price)
VALUES
(26,24,1,2,31500),
(27,24,16,1,61200),
(28,25,2,1,85000),
(29,25,3,1,99000),
(30,25,4,1,79000);

SET IDENTITY_INSERT dbo.order_details OFF;
GO

DBCC CHECKIDENT ('dbo.order_details', RESEED, 30);
GO

---------------------------------------------------------
-- 8. CREATE TABLE: order_assignments
---------------------------------------------------------
CREATE TABLE dbo.order_assignments (
    order_id INT PRIMARY KEY,
    assigned_by INT NULL,
    shipper_id INT NULL,
    assigned_at DATETIME DEFAULT(GETDATE()),
    completion_date DATETIME NULL,

    CONSTRAINT FK_assignment_order FOREIGN KEY (order_id)
        REFERENCES dbo.orders(id) ON DELETE CASCADE
);
GO