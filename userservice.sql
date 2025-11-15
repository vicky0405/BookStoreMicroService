use userservice

---------------------------------------------------------
-- 1. DROP TABLES IF EXIST
---------------------------------------------------------
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
IF OBJECT_ID('dbo.roles', 'U') IS NOT NULL DROP TABLE dbo.roles;
GO

---------------------------------------------------------
-- 2. CREATE TABLE: roles
---------------------------------------------------------
CREATE TABLE dbo.roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);
GO

---------------------------------------------------------
-- 3. INSERT DATA INTO roles
---------------------------------------------------------
SET IDENTITY_INSERT dbo.roles ON;

INSERT INTO dbo.roles (id, name) VALUES
(1,'admin'),
(3,'warehouse'),
(4,'enduser'),
(5,'ordmanager'),
(6,'shipper');

SET IDENTITY_INSERT dbo.roles OFF;

-- Reseed identity to continue from 59
DBCC CHECKIDENT ('dbo.roles', RESEED, 59);
GO

---------------------------------------------------------
-- 4. CREATE TABLE: users
---------------------------------------------------------
CREATE TABLE dbo.users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    gender BIT NULL,
    role_id INT NOT NULL,
    is_active BIT NULL,
    created_at DATETIME NOT NULL DEFAULT(GETDATE()),
    updated_at DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT FK_users_roles FOREIGN KEY (role_id) REFERENCES dbo.roles(id)
);
GO

---------------------------------------------------------
-- 5. INSERT DATA INTO users
---------------------------------------------------------
SET IDENTITY_INSERT dbo.users ON;

INSERT INTO dbo.users (id, username, password, full_name, email, phone, gender, role_id, is_active, created_at, updated_at)
VALUES
(1,'admin','123456','Bao Bao','admin@gmail.com','',1,1,1,'2024-12-31 18:00:00','2024-12-31 18:00:00'),
(3,'warehouse1','$2b$10$sAgAAKU/x/324JT.mtV/M.RLPW7l5nFJrEdQKXiUrVcKT1djp0anW','BaoC','warehouse1@gmail.com','0282843582',0,3,1,'2024-12-31 18:20:00','2024-12-31 18:20:00'),
(4,'warehouse2','$2b$10$DnXPR8xsPrp4lxe2ugdKY.dx8H6heNxVZPWN.BSWFEiXm4kpHA.Mm','Bao Baoa','warehouse2@gmail.com','0271927190',0,3,1,'2024-12-31 18:30:00','2024-12-31 18:30:00'),
(5,'order','$2b$10$3lLRY.Y24snpj814CtIPVOMP8eSgnrKHVQYY8oL8dLqYgRF2A7m3y','abcd f','order@gmail.com','0183618342',0,5,1,'2025-07-11 07:00:29','2025-07-11 07:00:29'),
(6,'customer','$2b$10$jN0SAOb//k6Au2eTkwu3NOjoWXiMtFCJ/A1900u8BGeTG0vmTCSSG','bbb','abcs@gmail.com','0372917211',0,4,1,'2025-07-11 07:09:07','2025-07-11 07:09:07'),
(7,'shipper1','$2b$10$.ijibJLLkqeG62ZHm8VvSO.yZPqVyEU7wTk/DVqWpajTzr83NNr8m','Nguyễn Văn A','hoanam328@gmail.com','0271927199',0,6,1,'2025-07-15 07:30:59','2025-07-15 07:30:59'),
(15,'shipper2','$2b$10$0QQX/68P.NJVPjAUCBtoF.DTg4a4u2mvWCOpvlcpHshr45kaeR0j6','Charlie','hoanam320@gmail.com','0271927198',0,6,1,'2025-07-15 08:27:37','2025-07-15 08:27:37'),
(16,'aaaa','$2b$10$uA4ICqbRKzf0rNrE/yjWueG4RtB5SCQcMDdf6bxVrWPAobyOlkFAO','aaaa','tuongv03v@gmail.com','0854451366',0,4,1,'2025-11-09 08:49:27','2025-11-09 08:49:27');

SET IDENTITY_INSERT dbo.users OFF;

DBCC CHECKIDENT ('dbo.users', RESEED, 16);
GO
