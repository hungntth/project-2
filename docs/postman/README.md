# Postman Collection Generator

Script tự động tạo Postman Collection từ NestJS Controllers.

## Cách sử dụng

### 1. Chạy script

```bash
node generate-postman-collection.js
```

### 2. Kết quả

Script sẽ tạo file `Sales-Management-API.postman_collection.json` trong thư mục `postman/`.

### 3. Import vào Postman

1. Mở Postman
2. Click **Import** (góc trên bên trái)
3. Chọn file `Sales-Management-API.postman_collection.json`
4. Click **Import**

## Cấu hình

Bạn có thể chỉnh sửa các biến trong file `generate-postman-collection.js`:

```javascript
const BASE_URL = 'http://localhost:3000'; // URL server
const API_PREFIX = 'api'; // Prefix API
```

## Cấu trúc Collection

Collection được tổ chức theo modules:

- **Categories** - Quản lý danh mục
- **Products** - Quản lý sản phẩm
- **Customers** - Quản lý khách hàng
- **Employees** - Quản lý nhân viên
- **Suppliers** - Quản lý nhà cung cấp
- **Orders** - Quản lý đơn hàng
- **Inventory** - Quản lý kho
- **Payments** - Quản lý thanh toán
- **Promotions** - Quản lý khuyến mãi
- **Reports** - Báo cáo

## Variables

Collection sử dụng các biến:

- `{{baseUrl}}` - Base URL (mặc định: http://localhost:3000)
- `{{apiPrefix}}` - API prefix (mặc định: api)
- `{{id}}`, `{{productId}}`, `{{orderId}}`, etc. - Path parameters

## Lưu ý

- Script tự động parse các decorators `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`
- Tự động tạo request body mẫu cho các method POST/PUT/PATCH
- Tự động detect query parameters và path parameters
- Cần chạy lại script mỗi khi có thay đổi trong controllers

## Troubleshooting

### Script không tìm thấy controllers

Đảm bảo các file controller có đuôi `.controller.ts` và nằm trong thư mục `src/`.

### Path không đúng

Kiểm tra lại `@Controller()` decorator trong các controller files.

### Request body không đúng

Bạn có thể chỉnh sửa function `generateCreateBody()` và `generateUpdateBody()` trong script để tùy chỉnh request body mẫu.
