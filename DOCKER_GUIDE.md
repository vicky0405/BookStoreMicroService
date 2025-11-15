# Docker Deployment Guide

## Yêu cầu hệ thống
- Docker version 20.10+
- Docker Compose version 2.0+
- Tối thiểu 4GB RAM
- 10GB dung lượng đĩa trống

## Cấu trúc Docker

Project bao gồm các services sau:
- **sqlserver**: SQL Server 2022 database
- **redis**: Redis cache
- **user-service**: Microservice quản lý user (Port 5001)
- **order-service**: Microservice quản lý order (Port 5002)
- **backend**: Main backend service (Port 5000)
- **gateway**: API Gateway (Port 3001)
- **frontend**: React frontend (Port 80)

## Hướng dẫn chạy

### 1. Build và khởi động tất cả services

```bash
docker-compose up -d
```

### 2. Xem logs của tất cả services

```bash
docker-compose logs -f
```

### 3. Xem logs của một service cụ thể

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f gateway
```

### 4. Dừng tất cả services

```bash
docker-compose down
```

### 5. Dừng và xóa tất cả volumes (database data)

```bash
docker-compose down -v
```

### 6. Rebuild một service cụ thể

```bash
docker-compose up -d --build backend
```

### 7. Rebuild tất cả services

```bash
docker-compose up -d --build
```

## Truy cập ứng dụng

Sau khi chạy thành công:
- **Frontend**: http://localhost
- **API Gateway**: http://localhost:3001
- **Backend**: http://localhost:5000
- **User Service**: http://localhost:5001
- **Order Service**: http://localhost:5002
- **SQL Server**: localhost:1433 (sa/YourStrong@Passw0rd)
- **Redis**: localhost:6379

## Khởi tạo Database

### Tự động tạo database khi services khởi động

Bạn cần chạy SQL scripts để tạo database và tables:

1. Kết nối đến SQL Server:
```bash
docker exec -it bookstore-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd
```

2. Tạo databases:
```sql
CREATE DATABASE mainservice;
CREATE DATABASE userservice;
CREATE DATABASE orderservice;
GO
```

3. Import data từ dump files:
```bash
# User Service
docker exec -i bookstore-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -d userservice < user-service/DumpUser.sql

# Order Service
docker exec -i bookstore-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -d orderservice < order-service/DumpOrder.sql
```

## Troubleshooting

### Service không khởi động được

```bash
# Xem chi tiết lỗi
docker-compose logs [service-name]

# Restart service
docker-compose restart [service-name]
```

### Database connection failed

- Đảm bảo SQL Server đã sẵn sàng (health check passed)
- Kiểm tra credentials trong docker-compose.yml
- Kiểm tra database đã được tạo chưa

### Port đã được sử dụng

Nếu port bị conflict, sửa port mapping trong `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Thay vì 80:80
```

### Xóa toàn bộ và bắt đầu lại

```bash
# Dừng và xóa containers, networks, volumes
docker-compose down -v

# Xóa images
docker-compose down --rmi all

# Build và start lại
docker-compose up -d --build
```

## Production Deployment

### Sử dụng file environment riêng

1. Tạo file `.env.production`:
```bash
cp .env.example .env.production
```

2. Chỉnh sửa các giá trị phù hợp với production

3. Chạy với env file:
```bash
docker-compose --env-file .env.production up -d
```

### Tối ưu cho production

- Sử dụng reverse proxy (nginx) cho HTTPS
- Cấu hình volume backups cho database
- Sử dụng Docker secrets cho sensitive data
- Setup monitoring và logging
- Cấu hình auto-restart policies

## Monitoring

### Kiểm tra trạng thái services

```bash
docker-compose ps
```

### Kiểm tra resource usage

```bash
docker stats
```

### Kiểm tra networks

```bash
docker network ls
docker network inspect bookstore-network
```

## Backup & Restore

### Backup Database

```bash
docker exec bookstore-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong@Passw0rd \
  -Q "BACKUP DATABASE mainservice TO DISK = '/var/opt/mssql/backup/mainservice.bak'"

docker cp bookstore-sqlserver:/var/opt/mssql/backup/mainservice.bak ./backups/
```

### Restore Database

```bash
docker cp ./backups/mainservice.bak bookstore-sqlserver:/var/opt/mssql/backup/

docker exec bookstore-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong@Passw0rd \
  -Q "RESTORE DATABASE mainservice FROM DISK = '/var/opt/mssql/backup/mainservice.bak' WITH REPLACE"
```
