# Hệ thống Quản lý Bán hàng - Frontend

Ứng dụng React để quản lý hệ thống bán hàng, kết nối với API backend NestJS.

## Cài đặt

```bash
cd frontend
npm install
# hoặc
yarn install
```

## Chạy ứng dụng

```bash
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## Cấu trúc

- `src/services/api.ts` - API service layer
- `src/pages/` - Các trang chính
- `src/components/` - Components tái sử dụng
- `src/App.tsx` - Routing và layout chính

## Tính năng

- Dashboard với thống kê tổng quan
- Quản lý sản phẩm (CRUD)
- Quản lý đơn hàng (tạo, xem, cập nhật trạng thái)
- Quản lý khách hàng
- Quản lý danh mục
- Quản lý nhân viên
- Quản lý kho hàng
- Quản lý thanh toán
- Quản lý khuyến mãi
- Quản lý nhà cung cấp
- Báo cáo và thống kê

## Cấu hình API

Mặc định ứng dụng kết nối với `http://localhost:3000/api`.

Để thay đổi, tạo file `.env`:

```
VITE_API_URL=http://your-api-url/api
```

