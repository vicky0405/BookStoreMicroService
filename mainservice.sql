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
-- TABLE: categories
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
-- TABLE: publishers 
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
-- TABLE: books
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
-- TABLE: book_images 
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

-- Kịch bản SQL Server được chuyển đổi từ MySQL

--
-- Table structure for table [book_import_details]
--
DROP TABLE IF EXISTS dbo.book_import_details;
GO

CREATE TABLE dbo.book_import_details (
  import_id int NOT NULL,
  book_id int NOT NULL,
  quantity int NOT NULL,
  unit_price decimal(10, 0) NOT NULL,
  PRIMARY KEY (import_id, book_id),
  CONSTRAINT FK_book_import_details_book_imports FOREIGN KEY (import_id) REFERENCES dbo.book_imports(id) ON DELETE CASCADE
);
GO

--
-- Dumping data for table [book_import_details]
--

INSERT INTO dbo.book_import_details (import_id, book_id, quantity, unit_price) VALUES 
(1,1,50,7000),
(1,2,50,7000),
(2,3,60,6000),
(2,4,50,9000),
(3,5,40,8500),
(3,6,40,8500),
(4,7,70,5000),
(4,8,60,7000),
(5,9,50,8000),
(5,10,60,8000),
(6,12,55,7500),
(7,14,60,7000),
(8,15,100,4000),
(8,16,60,8000),
(9,17,65,6500),
(9,18,65,6100),
(10,19,55,7200),
(10,20,55,7100);
GO

CREATE INDEX idx_book_id ON dbo.book_import_details(book_id);
GO

--
-- Table structure for table [book_imports]
--
DROP TABLE IF EXISTS dbo.book_imports;
GO

CREATE TABLE dbo.book_imports (
  id int NOT NULL IDENTITY(1,1),
  supplier_id int NOT NULL,
  imported_by int NOT NULL,
  import_date datetime DEFAULT GETDATE(),
  total_price decimal(12, 0) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK_book_imports_suppliers FOREIGN KEY (supplier_id) REFERENCES dbo.suppliers(id)
);
GO

--
-- Dumping data for table [book_imports]
--
SET IDENTITY_INSERT dbo.book_imports ON;
INSERT INTO dbo.book_imports (id, supplier_id, imported_by, import_date, total_price) VALUES 
(1,1,3,'2025-07-18 20:58:00',700000),
(2,2,3,'2025-07-18 20:58:00',750000),
(3,3,3,'2025-07-18 20:58:00',680000),
(4,4,3,'2025-07-18 20:58:00',720000),
(5,5,3,'2025-07-18 20:58:00',840000),
(6,6,3,'2025-07-18 20:58:00',910000),
(7,7,3,'2025-07-18 20:58:00',760000),
(8,8,3,'2025-07-18 20:58:00',880000),
(9,9,3,'2025-07-18 20:58:00',820000),
(10,10,3,'2025-07-18 20:58:00',790000);
SET IDENTITY_INSERT dbo.book_imports OFF;
GO

CREATE INDEX idx_supplier_id ON dbo.book_imports(supplier_id);
CREATE INDEX idx_imported_by ON dbo.book_imports(imported_by);
GO
--
-- Table structure for table [damage_report_items]
--
DROP TABLE IF EXISTS dbo.damage_report_items;
GO

CREATE TABLE dbo.damage_report_items (
  report_id int NOT NULL,
  book_id int NOT NULL,
  quantity int NOT NULL,
  reason nvarchar(255) DEFAULT NULL,
  PRIMARY KEY (report_id, book_id),
  CONSTRAINT FK_damage_report_items_damage_reports FOREIGN KEY (report_id) REFERENCES dbo.damage_reports(id) ON DELETE CASCADE,
  CONSTRAINT CHK_damage_report_items_quantity CHECK (quantity > 0)
);
GO

--
-- Dumping data for table [damage_report_items]
--
INSERT INTO dbo.damage_report_items (report_id, book_id, quantity, reason) VALUES 
(14,1,3,N'rách trang'),
(15,10,1,N'rách'),
(16,17,1,N'rách');
GO

CREATE INDEX idx_book_id_damage_items ON dbo.damage_report_items(book_id);
GO

--
-- Table structure for table [damage_reports]
--
DROP TABLE IF EXISTS dbo.damage_reports;
GO

CREATE TABLE dbo.damage_reports (
  id int NOT NULL IDENTITY(1,1),
  created_by int NOT NULL,
  created_at datetime DEFAULT GETDATE(),
  note nvarchar(max),
  PRIMARY KEY (id)
);
GO

--
-- Dumping data for table [damage_reports]
--
SET IDENTITY_INSERT dbo.damage_reports ON;
INSERT INTO dbo.damage_reports (id, created_by, created_at, note) VALUES 
(14,3,'2025-08-01 14:21:30',N''),
(15,3,'2025-08-05 13:45:19',N''),
(16,1,'2025-11-11 00:01:22',N'');
SET IDENTITY_INSERT dbo.damage_reports OFF;
GO

CREATE INDEX idx_created_by_damage ON dbo.damage_reports(created_by);
GO

--
-- Table structure for table [ratings]
--
DROP TABLE IF EXISTS dbo.ratings;
GO

CREATE TABLE dbo.ratings (
  id int NOT NULL IDENTITY(1,1),
  user_id int NOT NULL,
  book_id int NOT NULL,
  rating tinyint NOT NULL,
  comment nvarchar(max),
  created_at datetime DEFAULT GETDATE(),
  PRIMARY KEY (id),
  CONSTRAINT UQ_ratings_user_book UNIQUE (user_id, book_id),
  CONSTRAINT CHK_ratings_rating CHECK (rating BETWEEN 1 AND 5)
);
GO

--
-- Dumping data for table [ratings]
--
SET IDENTITY_INSERT dbo.ratings ON;
INSERT INTO dbo.ratings (id, user_id, book_id, rating, comment, created_at) VALUES 
(2,5,2,5,N'sssssssss','2025-08-05 12:22:49');
SET IDENTITY_INSERT dbo.ratings OFF;
GO

CREATE INDEX idx_book_id_ratings ON dbo.ratings(book_id);
GO

--
-- Table structure for table [rules]
--
DROP TABLE IF EXISTS dbo.rules;
GO

CREATE TABLE dbo.rules (
  id int NOT NULL IDENTITY(1,1),
  min_import_quantity int NOT NULL,
  min_stock_before_import int NOT NULL,
  max_promotion_duration int NOT NULL,
  PRIMARY KEY (id)
);
GO

--
-- Dumping data for table [rules]
--
SET IDENTITY_INSERT dbo.rules ON;
INSERT INTO dbo.rules (id, min_import_quantity, min_stock_before_import, max_promotion_duration) VALUES 
(1,7,45,30);
SET IDENTITY_INSERT dbo.rules OFF;
GO

--
-- Table structure for table [suppliers]
--
DROP TABLE IF EXISTS dbo.suppliers;
GO

CREATE TABLE dbo.suppliers (
  id int NOT NULL IDENTITY(1,1),
  name nvarchar(255) NOT NULL,
  address nvarchar(max),
  phone varchar(20) DEFAULT NULL,
  email varchar(255) DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT GETDATE(),
  updated_at datetime NOT NULL DEFAULT GETDATE(),
  PRIMARY KEY (id)
);
GO

--
-- Dumping data for table [suppliers]
--
SET IDENTITY_INSERT dbo.suppliers ON;
INSERT INTO dbo.suppliers (id, name, address, phone, email, created_at, updated_at) VALUES 
(1,N'Công ty Giấy Bảo An',N'Số 10, Đường Nguyễn Văn Linh, TP. Hải Phòng','0225-355-7890','lienhe@baoanpaper.vn','2025-01-02 02:00:00','2025-01-02 02:00:00'),
(2,N'Nhà cung cấp Thiết bị Học đường Minh Khoa',N'Số 3, Lê Duẩn, Hà Nội','024-3736-1234','minhkhoa@thietbihocduong.vn','2025-01-02 02:03:00','2025-01-02 02:03:00'),
(3,N'Văn phòng phẩm Hưng Thịnh',N'212 Nguyễn Trãi, Quận 5, TP.HCM','028-3845-6789','info@hungthinhvp.vn','2025-01-02 02:06:00','2025-01-02 02:06:00'),
(4,N'Công ty TNHH Sách & Thiết bị Alpha',N'45 Hoàng Văn Thụ, Đà Nẵng','0236-3799-456','alpha@suppliers.vn','2025-01-02 02:09:00','2025-01-02 02:09:00'),
(5,N'Công ty TNHH Thiết bị văn phòng Minh Khoa',N'190 Ngõ Nam Kỳ Khởi Nghĩa, TP. Hải Phòng','029-2869-2802','lienhe@minhkhoa.vn','2025-01-02 02:12:00','2025-01-02 02:12:00'),
(6,N'Nhà cung cấp In ấn Phú Quý',N'155 Đường Hai Bà Trưng, TP. Quy Nhơn, Bình Định','0297-3044-8864','lienhe@phqu.vn','2025-01-02 02:15:00','2025-01-02 02:15:00'),
(7,N'Doanh nghiệp VPP Bảo An',N'187 Phố Pasteur, TP. Long Xuyên, An Giang','024-8203-4521','lienhe@boan.vn','2025-01-02 02:18:00','2025-01-02 02:18:00'),
(8,N'Thiết bị giáo dục Hưng Thịnh',N'58 Ngõ Pasteur, TP. Vinh, Nghệ An','028-6671-6364','lienhe@hungthinh.vn','2025-01-02 02:21:00','2025-01-02 02:21:00'),
(9,N'Xưởng Bao bì Alpha',N'23 Ngõ Pasteur, TP. Huế, Thừa Thiên Huế','029-7776-3127','lienhe@alpha.vn','2025-01-02 02:24:00','2025-01-02 02:24:00'),
(10,N'Doanh nghiệp Thiết bị giáo dục Beta',N'99 Đường Hai Bà Trưng, TP. Hải Phòng','024-5138-3270','lienhe@beta.vn','2025-01-02 02:27:00','2025-01-02 02:27:00'),
(11,N'Xưởng Thiết bị giáo dục Omega',N'66 Đường Hai Bà Trưng, Quận Bình Thạnh, TP. Hồ Chí Minh','028-9039-5372','lienhe@omega.vn','2025-01-02 02:30:00','2025-01-02 02:30:00'),
(12,N'Văn phòng phẩm Hoàng Long',N'81 Phố Trần Hưng Đạo, TP. Huế, Thừa Thiên Huế','0234-1595-7581','lienhe@hoanglong.vn','2025-01-02 02:33:00','2025-01-02 02:33:00'),
(13,N'Công ty CP Dụng cụ học tập Phương Nam',N'86 Đường Nam Kỳ Khởi Nghĩa, TP. Rạch Giá, Kiên Giang','0297-8335-9496','lienhe@phuongnam.vn','2025-01-02 02:36:00','2025-01-02 02:36:00'),
(14,N'Nhà cung cấp Bao bì Đức Tín',N'116 Phố Hai Bà Trưng, TP. Đà Nẵng','0236-3481-2680','lienhe@ductin.vn','2025-01-02 02:39:00','2025-01-02 02:39:00'),
(15,N'Công ty TNHH Văn phòng phẩm Phú Quý',N'156 Đường Nguyễn Văn Linh, TP. Biên Hòa, Đồng Nai','0251-8149-9450','lienhe@phuquy.vn','2025-01-02 02:42:00','2025-01-02 02:42:00'),
(16,N'Doanh nghiệp Giấy Hưng Thịnh',N'164 Đường Nguyễn Văn Linh, TP. Biên Hòa, Đồng Nai','0251-8149-9450','lienhe@hungthinh.vn','2025-01-02 02:45:00','2025-01-02 02:45:00'),
(17,N'Xưởng Đồ dùng học sinh Alpha',N'133 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@alpha.vn','2025-01-02 02:48:00','2025-01-02 02:48:00'),
(18,N'Công ty TNHH Bao bì Thiên Long',N'52 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@thienlong.vn','2025-01-02 02:51:00','2025-01-02 02:51:00'),
(19,N'Công ty CP Dụng cụ học tập Nam Việt',N'166 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@namviet.vn','2025-01-02 02:54:00','2025-01-02 02:54:00'),
(20,N'Công ty TNHH VPP Đông Á',N'119 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@donga.vn','2025-01-02 02:57:00','2025-01-02 02:57:00'),
(21,N'Nhà cung cấp Thiết bị văn phòng Đại Phát',N'76 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@daiphat.vn','2025-01-02 03:00:00','2025-01-02 03:00:00'),
(22,N'Công ty CP Giấy Kim Liên',N'25 Hai Bà Trưng, Hoàn Kiếm, Hà Nội','024-4680-2998','lienhe@kimlien.vn','2025-01-02 03:03:00','2025-01-02 03:03:00'),
(23,N'Nhà cung cấp Sách Phú Quý',N'54 Hai Bà Trưng, Hoàn Kiếm, Hà Nội','024-4680-2998','lienhe@phuquy.vn','2025-01-02 03:06:00','2025-01-02 03:06:00'),
(24,N'Công ty TNHH Thiết bị giáo dục Phương Nam',N'86 Hai Bà Trưng, Hoàn Kiếm, Hà Nội','024-4680-2998','lienhe@phuongnam.vn','2025-01-02 03:09:00','2025-01-02 03:09:00'),
(25,N'Doanh nghiệp Văn phòng phẩm Đức Tín',N'89 Hai Bà Trưng, Hoàn Kiếm, Hà Nội','024-4680-2998','lienhe@ductin.vn','2025-01-02 03:12:00','2025-01-02 03:12:00'),
(26,N'Công ty CP In ấn Châu Á',N'37 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội','024-4680-2998','lienhe@chaua.vn','2025-01-02 03:15:00','2025-01-02 03:15:00'),
(27,N'Nhà cung cấp VPP Kim Liên',N'48 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội','024-4680-2998','lienhe@kimlienvn.vn','2025-01-02 03:18:00','2025-01-02 03:18:00'),
(28,N'Công ty TNHH Văn phòng phẩm Phú Quý',N'13 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội','024-4680-2998','lienhe@phuquyvn.vn','2025-01-02 03:21:00','2025-01-02 03:21:00'),
(29,N'Doanh nghiệp Sách Đông Á',N'88 Pasteur, Quận 1, TP. Hồ Chí Minh','028-3827-1001','lienhe@donga.com.vn','2025-01-02 03:24:00','2025-01-02 03:24:00'),
(30,N'Công ty TNHH Giấy Tân Tiến',N'23 Phan Chu Trinh, Quận 1, TP. Hồ Chí Minh','028-3827-1001','lienhe@tantien.vn','2025-01-02 03:27:00','2025-01-02 03:27:00'),
(31,N'Công ty CP Thiết bị trường học Thành Công',N'73 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@thanhcong.vn','2025-01-02 03:30:00','2025-01-02 03:30:00'),
(32,N'Công ty TNHH Bao bì Tân Tiến',N'160 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@tantienbb.vn','2025-01-02 03:33:00','2025-01-02 03:33:00'),
(33,N'Nhà cung cấp In ấn Omega',N'130 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@omega.vn','2025-01-02 03:36:00','2025-01-02 03:36:00'),
(34,N'Xưởng Thiết bị giáo dục Đức Tín',N'60 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@ductin.com.vn','2025-01-02 03:39:00','2025-01-02 03:39:00'),
(35,N'Công ty CP Văn phòng phẩm Đông Á',N'151 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@vppdonga.vn','2025-01-02 03:42:00','2025-01-02 03:42:00'),
(36,N'Nhà cung cấp Văn hóa Phú Hưng',N'19 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@phuhungvn.vn','2025-01-02 03:45:00','2025-01-02 03:45:00'),
(37,N'Công ty CP Giấy An Bình',N'152 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@anbinhpaper.vn','2025-01-02 03:48:00','2025-01-02 03:48:00'),
(38,N'Công ty TNHH Dụng cụ học tập Sông Hồng',N'10 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@songhong.vn','2025-01-02 03:51:00','2025-01-02 03:51:00'),
(39,N'Doanh nghiệp In ấn Châu Á',N'15 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@chaua.com.vn','2025-01-02 03:54:00','2025-01-02 03:54:00'),
(40,N'Xưởng Bao bì Phú Quý',N'20 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@phuquyco.vn','2025-01-02 03:57:00','2025-01-02 03:57:00'),
(41,N'Công ty CP Sách & Thiết bị Công Thương',N'25 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@congthuongbook.vn','2025-01-02 04:00:00','2025-01-02 04:00:00'),
(42,N'Nhà cung cấp Văn phòng phẩm Thành Công',N'30 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@thanhcongvpp.vn','2025-01-02 04:03:00','2025-01-02 04:03:00'),
(43,N'Công ty TNHH Thiết bị văn phòng Châu Á',N'35 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@thietbichaua.vn','2025-01-02 04:06:00','2025-01-02 04:06:00'),
(44,N'Xưởng In ấn Việt Thắng',N'40 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@vietthangprint.vn','2025-01-02 04:09:00','2025-01-02 04:09:00'),
(45,N'Công ty CP VPP Đức Tín',N'45 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@ductinvpp.vn','2025-01-02 04:12:00','2025-01-02 04:12:00'),
(46,N'Nhà cung cấp Thiết bị trường học Đông Á',N'50 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@dongaschool.vn','2025-01-02 04:15:00','2025-01-02 04:15:00'),
(47,N'Công ty TNHH Giấy Hưng Thịnh',N'55 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@hungthinhpaper.vn','2025-01-02 04:18:00','2025-01-02 04:18:00'),
(48,N'Công ty CP Thiết bị trường học Nam Việt',N'60 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@namvietedu.vn','2025-01-02 04:21:00','2025-01-02 04:21:00'),
(49,N'Công ty TNHH In ấn Beta',N'65 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@beta.vn','2025-01-02 04:24:00','2025-01-02 04:24:00'),
(50,N'Doanh nghiệp Bao bì Omega',N'70 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@omega.vn','2025-01-02 04:27:00','2025-01-02 04:27:00'),
(51,N'Công ty CP Dụng cụ học sinh Minh Khoa',N'75 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@minhkhoaedu.vn','2025-01-02 04:30:00','2025-01-02 04:30:00'),
(52,N'Nhà cung cấp In ấn Thiên Long',N'80 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@thienlongprint.vn','2025-01-02 04:33:00','2025-01-02 04:33:00'),
(53,N'Công ty TNHH Văn phòng phẩm Kim Liên',N'85 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@kimlienvpp.vn','2025-01-02 04:36:00','2025-01-02 04:36:00'),
(54,N'Công ty CP Thiết bị Hoàng Long',N'90 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@hoanglongco.vn','2025-01-02 04:39:00','2025-01-02 04:39:00'),
(55,N'Xưởng In ấn An Bình',N'95 Nam Kỳ Khởi Nghĩa, Quận Bình Thạnh, TP. Hồ Chí Minh','028-2842-1639','lienhe@anbinhprint.vn','2025-01-02 04:42:00','2025-01-02 04:42:00'),
(56,N'Công ty CP Thiết bị văn phòng Ngọc Minh',N'228A Xuân Thủy, Hải Phòng','0225-240-4900','lienhe@minh.vn','2025-01-02 04:45:00','2025-01-02 04:45:00'),
(57,N'Công ty CP In ấn Tân Tiến',N'2 Nguyễn Thị Minh Khai, TP. Vinh, Nghệ An','0238-1229-025','lienhe@tien.vn','2025-01-02 04:48:00','2025-01-02 04:48:00'),
(58,N'Doanh nghiệp VPP Phú Quý',N'101 Kim Mã, TP. Quy Nhơn, Bình Định','0256-3700-876','lienhe@quy.vn','2025-01-02 04:51:00','2025-01-02 04:51:00'),
(59,N'Xưởng Văn phòng phẩm Bảo An',N'70 Kim Mã, Cầu Giấy, Hà Nội','024-7770-7755','lienhe@an.vn','2025-01-02 04:54:00','2025-01-02 04:54:00'),
(60,N'Doanh nghiệp Bao bì Minh Khoa',N'297 Lê Lợi, Đà Nẵng','0236-179-0940','lienhe@khoa.vn','2025-01-02 04:57:00','2025-01-02 04:57:00'),
(61,N'Nguyễn',N'Ký túc xá Khu B Đại học Quốc gia TP.HCM, Đường Mạc Đĩnh Chi, Phường Đông Hòa, Thành Phố Dĩ An, Bình Dương','0854451366','tuongv03v@gmail.com','2025-11-11 00:02:38','2025-11-11 00:02:38');
SET IDENTITY_INSERT dbo.suppliers OFF;
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