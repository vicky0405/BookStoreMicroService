use mainservice

---------------------------------------------------------
-- DROP VIEW + TABLES (ĐÚNG THỨ TỰ FK)
---------------------------------------------------------
IF OBJECT_ID('dbo.v_books_pricing','V') IS NOT NULL DROP VIEW dbo.v_books_pricing;
GO

IF OBJECT_ID('dbo.book_images','U') IS NOT NULL DROP TABLE dbo.book_images;
IF OBJECT_ID('dbo.book_import_details','U') IS NOT NULL DROP TABLE dbo.book_import_details;
IF OBJECT_ID('dbo.book_imports','U') IS NOT NULL DROP TABLE dbo.book_imports;
IF OBJECT_ID('dbo.damage_report_items','U') IS NOT NULL DROP TABLE dbo.damage_report_items;
IF OBJECT_ID('dbo.damage_reports','U') IS NOT NULL DROP TABLE dbo.damage_reports;
IF OBJECT_ID('dbo.promotion_details','U') IS NOT NULL DROP TABLE dbo.promotion_details;
IF OBJECT_ID('dbo.promotions','U') IS NOT NULL DROP TABLE dbo.promotions;
IF OBJECT_ID('dbo.cart_details','U') IS NOT NULL DROP TABLE dbo.cart_details;
IF OBJECT_ID('dbo.carts','U') IS NOT NULL DROP TABLE dbo.carts;
IF OBJECT_ID('dbo.ratings','U') IS NOT NULL DROP TABLE dbo.ratings;
IF OBJECT_ID('dbo.books','U') IS NOT NULL DROP TABLE dbo.books;
IF OBJECT_ID('dbo.publishers','U') IS NOT NULL DROP TABLE dbo.publishers;
IF OBJECT_ID('dbo.categories','U') IS NOT NULL DROP TABLE dbo.categories;
IF OBJECT_ID('dbo.suppliers','U') IS NOT NULL DROP TABLE dbo.suppliers;
IF OBJECT_ID('dbo.addresses','U') IS NOT NULL DROP TABLE dbo.addresses;
GO


---------------------------------------------------------
-- TABLE: addresses
---------------------------------------------------------
CREATE TABLE dbo.addresses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    address_line VARCHAR(MAX) NOT NULL,
    ward VARCHAR(100),
    district VARCHAR(100),
    province VARCHAR(100),
    is_default BIT DEFAULT 0,
    created_at DATETIME DEFAULT(GETDATE()),
    updated_at DATETIME DEFAULT(GETDATE())
);
GO

SET IDENTITY_INSERT dbo.addresses ON;

INSERT INTO dbo.addresses (id,user_id,address_line,ward,district,province,is_default,created_at,updated_at)
VALUES
(1,5,'123 Đường Nguyễn Văn Linh','Phường Tân Phong','Quận 7','TP. Hồ Chí Minh',1,'2025-07-13 03:29:22','2025-07-30 12:28:17'),
(2,5,'ssssss','Thạnh Xuân','district2','hanoi',0,'2025-07-13 04:42:28','2025-07-30 12:28:17'),
(3,6,'fffffffffffff','qqqqqqqqq','district1','hcm',1,'2025-10-19 09:57:16','2025-10-19 09:57:16'),
(6,16,'kí túc xá khu B','đông hòa','district1','hcm',1,'2025-11-10 07:32:23','2025-11-10 07:32:23');

SET IDENTITY_INSERT dbo.addresses OFF;
GO


---------------------------------------------------------
-- TABLE: categories (CHỈ GIỮ 3, CHO KHỚP BOOKS)
---------------------------------------------------------
CREATE TABLE dbo.categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(MAX),
    created_at DATETIME DEFAULT(GETDATE()),
    updated_at DATETIME DEFAULT(GETDATE())
);
GO

SET IDENTITY_INSERT dbo.categories ON;

INSERT INTO dbo.categories (id,name,description,created_at,updated_at)
VALUES
(1,'Văn học','Sách văn học trong nước','2025-07-18 12:55:33','2025-07-18 12:55:33'),
(2,'Tâm lý – Kỹ năng sống','Sách truyền cảm hứng','2025-07-18 12:55:33','2025-07-18 12:55:33'),
(3,'Kinh tế','Sách kinh tế','2025-07-18 12:55:33','2025-07-18 12:55:33');

SET IDENTITY_INSERT dbo.categories OFF;
GO


---------------------------------------------------------
-- TABLE: publishers (CHỈ GIỮ 3)
---------------------------------------------------------
CREATE TABLE dbo.publishers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT(GETDATE()),
    updated_at DATETIME DEFAULT(GETDATE())
);
GO

SET IDENTITY_INSERT dbo.publishers ON;

INSERT INTO dbo.publishers (id,name,created_at,updated_at)
VALUES
(1,'NXB Kim Đồng','2025-07-18 12:59:18','2025-07-18 12:59:18'),
(2,'NXB Trẻ','2025-07-18 12:59:18','2025-07-18 12:59:18'),
(3,'NXB Giáo Dục Việt Nam','2025-07-18 12:59:18','2025-07-18 12:59:18');

SET IDENTITY_INSERT dbo.publishers OFF;
GO


---------------------------------------------------------
-- TABLE: books (CHỈ 3 RECORD, FK ĐÃ FIX)
---------------------------------------------------------
CREATE TABLE dbo.books (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    publisher_id INT NOT NULL,
    publication_year INT,
    price INT,
    quantity_in_stock INT DEFAULT 0,
    description VARCHAR(MAX),
    created_at DATETIME DEFAULT(GETDATE()),
    updated_at DATETIME DEFAULT(GETDATE()),
    FOREIGN KEY (category_id) REFERENCES dbo.categories(id),
    FOREIGN KEY (publisher_id) REFERENCES dbo.publishers(id)
);
GO

SET IDENTITY_INSERT dbo.books ON;

INSERT INTO dbo.books (id,title,author,category_id,publisher_id,publication_year,price,quantity_in_stock,description,created_at,updated_at)
VALUES
(1,'Dế Mèn Phiêu Lưu Ký','Tô Hoài',1,1,2023,35000,8,'Sách văn học thiếu nhi','2025-07-18 13:57:13','2025-07-19 08:24:10'),
(2,'Tuổi Trẻ Đáng Giá Bao Nhiêu','Rosie Nguyễn',2,2,2016,85000,37,'Sách truyền cảm hứng','2025-07-18 13:57:13','2025-07-19 08:27:33'),
(3,'Bố Già','Mario Puzo',1,3,1969,99000,53,'Tiểu thuyết nổi tiếng','2025-07-18 13:57:13','2025-07-19 08:28:39');

SET IDENTITY_INSERT dbo.books OFF;
GO


---------------------------------------------------------
-- TABLE: book_images (CHỈ 3 IMAGE, FK OK)
---------------------------------------------------------
CREATE TABLE dbo.book_images (
    id INT IDENTITY(1,1) PRIMARY KEY,
    book_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT(GETDATE()),
    FOREIGN KEY (book_id) REFERENCES dbo.books(id) ON DELETE CASCADE
);
GO

SET IDENTITY_INSERT dbo.book_images ON;

INSERT INTO dbo.book_images (id,book_id,image_path,created_at)
VALUES
(1,1,'/uploads/de-men.webp','2025-07-19 08:24:10'),
(2,2,'/uploads/ttdgbn1.webp','2025-07-19 08:27:33'),
(3,3,'/uploads/bo-gia.webp','2025-07-19 08:28:39');

SET IDENTITY_INSERT dbo.book_images OFF;
GO


---------------------------------------------------------
-- TABLE: promotions
---------------------------------------------------------
CREATE TABLE dbo.promotions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(10) CHECK (type IN ('percent','fixed')),
    discount DECIMAL(10,0),
    start_date DATE,
    end_date DATE,
    created_at DATETIME DEFAULT(GETDATE()),
    updated_at DATETIME DEFAULT(GETDATE())
);
GO

SET IDENTITY_INSERT dbo.promotions ON;

INSERT INTO dbo.promotions (id,name,type,discount,start_date,end_date,created_at,updated_at)
VALUES
(1,'iPhone','percent',10,'2025-10-19','2025-10-25','2025-10-19 02:40:36','2025-10-19 02:40:36');

SET IDENTITY_INSERT dbo.promotions OFF;
GO


---------------------------------------------------------
-- TABLE: promotion_details (KHỚP BOOKS)
---------------------------------------------------------
CREATE TABLE dbo.promotion_details (
    promotion_id INT NOT NULL,
    book_id INT NOT NULL,
    PRIMARY KEY (promotion_id,book_id),
    FOREIGN KEY (promotion_id) REFERENCES dbo.promotions(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES dbo.books(id) ON DELETE CASCADE
);
GO

INSERT INTO dbo.promotion_details (promotion_id,book_id)
VALUES (1,1),(1,2),(1,3);
GO


---------------------------------------------------------
-- VIEW: v_books_pricing
---------------------------------------------------------
CREATE VIEW dbo.v_books_pricing AS
SELECT
    b.id,
    b.title,
    b.author,
    b.category_id,
    b.publisher_id,
    b.publication_year,
    b.price AS original_price,
    b.quantity_in_stock,
    b.description,
    b.created_at,
    b.updated_at,
    (
        SELECT TOP 1
            CASE 
                WHEN p.type = 'percent' THEN b.price * (1 - p.discount / 100)
                WHEN p.type = 'fixed' THEN IIF(b.price - p.discount < 0, 0, b.price - p.discount)
            END
        FROM dbo.promotions p
        JOIN dbo.promotion_details pd ON pd.promotion_id = p.id
        WHERE pd.book_id = b.id
          AND GETDATE() BETWEEN p.start_date AND p.end_date
    ) AS discounted_price
FROM dbo.books b;
GO