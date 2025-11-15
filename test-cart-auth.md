# Debug Cart Auth Error

## Bước để test:

1. **Kiểm tra token đăng nhập:**
   - Mở DevTools (F12)
   - Vào Console
   - Chạy: `console.log(localStorage.getItem('token'))`
   - Nếu thấy token dài (JWT token) → có token
   - Nếu thấy null hoặc rỗng → cần đăng nhập trước

2. **Đăng nhập:**
   - Vào login page
   - Nhập credentials
   - Kiểm tra lại token

3. **Test thêm sách vào giỏ:**
   - Mở DevTools → Network tab
   - Click "Thêm vào giỏ"
   - Tìm request `/api/cart` (POST)
   - Kiểm tra:
     - **Request Headers:** xem có `Authorization: Bearer ...` không
     - **Response:** xem error là gì

4. **Kiểm tra logs:**
   ```bash
   docker logs bookstore-backend --tail 50
   docker logs bookstore-gateway --tail 50
   ```

## Nguyên nhân có thể:
- [ ] Token không được lưu sau login
- [ ] Token không được gửi trong request
- [ ] Token hết hạn
- [ ] User-service không validate token đúng
- [ ] Backend không lấy user từ response đúng

