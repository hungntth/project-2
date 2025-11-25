-- Script SQL để insert dữ liệu mock vào PostgreSQL database
-- Chạy: psql -U postgres -d sales_management -f insert_mock_data.sql
-- Hoặc: \i insert_mock_data.sql trong psql

-- Lưu ý: Script này giả định các bảng đã được tạo bởi TypeORM synchronize
-- Nếu chưa có, cần chạy ứng dụng NestJS trước để tạo schema

-- Xóa dữ liệu cũ (nếu cần)
-- TRUNCATE TABLE order_items, payments, inventory_transactions, inventory, orders, promotions, products, categories, customers, employees, suppliers CASCADE;

-- ============================================
-- 1. CATEGORIES (Danh mục - cần insert trước vì có foreign key tự tham chiếu)
-- ============================================
INSERT INTO categories (id, name, description, "parentId", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Điện tử', 'Thiết bị điện tử và công nghệ', NULL, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Điện thoại', 'Điện thoại thông minh', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Laptop', 'Máy tính xách tay', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Thời trang', 'Quần áo và phụ kiện', NULL, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Áo nam', 'Áo sơ mi, áo thun nam', '550e8400-e29b-41d4-a716-446655440004', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'Quần nam', 'Quần jean, quần âu', '550e8400-e29b-41d4-a716-446655440004', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Thực phẩm', 'Đồ ăn và thức uống', NULL, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'Đồ uống', 'Nước ngọt, nước suối', '550e8400-e29b-41d4-a716-446655440007', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'Bánh kẹo', 'Bánh, kẹo, snack', '550e8400-e29b-41d4-a716-446655440007', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. CUSTOMERS (Khách hàng)
-- ============================================
INSERT INTO customers (id, name, email, phone, address, city, country, "createdAt", "updatedAt") VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Nguyễn Văn A', 'nguyenvana@email.com', '0901234567', '123 Đường ABC, Phường 1', 'Hồ Chí Minh', 'Việt Nam', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'Trần Thị B', 'tranthib@email.com', '0901234568', '456 Đường XYZ, Phường 2', 'Hà Nội', 'Việt Nam', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'Lê Văn C', 'levanc@email.com', '0901234569', '789 Đường DEF, Phường 3', 'Đà Nẵng', 'Việt Nam', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'Phạm Thị D', 'phamthid@email.com', '0901234570', '321 Đường GHI, Phường 4', 'Hồ Chí Minh', 'Việt Nam', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440005', 'Hoàng Văn E', 'hoangvane@email.com', '0901234571', '654 Đường JKL, Phường 5', 'Hải Phòng', 'Việt Nam', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440006', 'Võ Thị F', 'vothif@email.com', '0901234572', '987 Đường MNO, Phường 6', 'Cần Thơ', 'Việt Nam', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440007', 'Đặng Văn G', 'dangvang@email.com', '0901234573', '147 Đường PQR, Phường 7', 'Hồ Chí Minh', 'Việt Nam', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. EMPLOYEES (Nhân viên)
-- ============================================
INSERT INTO employees (id, name, email, phone, role, address, "createdAt", "updatedAt") VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Nguyễn Thị Quản lý', 'manager@store.com', '0912345678', 'MANAGER', '123 Đường Quản lý, Quận 1', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440002', 'Trần Văn Bán hàng', 'sales@store.com', '0912345679', 'SALES', '456 Đường Bán hàng, Quận 2', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440003', 'Lê Thị Thu ngân', 'cashier@store.com', '0912345680', 'CASHIER', '789 Đường Thu ngân, Quận 3', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440004', 'Phạm Văn Kho', 'warehouse@store.com', '0912345681', 'WAREHOUSE', '321 Đường Kho, Quận 4', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440005', 'Hoàng Thị Bán hàng 2', 'sales2@store.com', '0912345682', 'SALES', '654 Đường Bán hàng 2, Quận 5', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440006', 'Võ Văn Bán hàng 3', 'sales3@store.com', '0912345683', 'SALES', '987 Đường Bán hàng 3, Quận 6', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. SUPPLIERS (Nhà cung cấp)
-- ============================================
INSERT INTO suppliers (id, name, "companyName", email, phone, address, city, country, "createdAt", "updatedAt") VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Công ty Điện tử ABC', 'ABC Electronics Co., Ltd', 'contact@abcelectronics.com', '0281234567', '123 Đường Điện tử, Quận 1', 'Hồ Chí Minh', 'Việt Nam', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440002', 'Công ty Thời trang XYZ', 'XYZ Fashion Co., Ltd', 'contact@xyzfashion.com', '0241234567', '456 Đường Thời trang, Quận Hoàn Kiếm', 'Hà Nội', 'Việt Nam', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440003', 'Công ty Thực phẩm DEF', 'DEF Food Co., Ltd', 'contact@deffood.com', '0236123456', '789 Đường Thực phẩm, Quận Hải Châu', 'Đà Nẵng', 'Việt Nam', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440004', 'Nhà cung cấp GHI', 'GHI Supplier', 'contact@ghi.com', '0225123456', '321 Đường GHI, Quận Hồng Bàng', 'Hải Phòng', 'Việt Nam', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440005', 'Công ty Điện tử JKL', 'JKL Tech Co., Ltd', 'contact@jkltech.com', '0292123456', '654 Đường JKL, Quận Ninh Kiều', 'Cần Thơ', 'Việt Nam', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. PRODUCTS (Sản phẩm)
-- ============================================
INSERT INTO products (id, name, description, "categoryId", price, "costPrice", sku, barcode, unit, images, "createdAt", "updatedAt") VALUES
('990e8400-e29b-41d4-a716-446655440001', 'iPhone 15 Pro Max', 'Điện thoại iPhone 15 Pro Max 256GB màu Titan tự nhiên', '550e8400-e29b-41d4-a716-446655440002', 29990000, 25000000, 'IP15PM-256', '1234567890123', 'cái', ARRAY['https://example.com/iphone15-1.jpg', 'https://example.com/iphone15-2.jpg'], NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440002', 'Samsung Galaxy S24 Ultra', 'Điện thoại Samsung Galaxy S24 Ultra 512GB màu đen', '550e8400-e29b-41d4-a716-446655440002', 27990000, 23000000, 'SGS24U-512', '1234567890124', 'cái', ARRAY['https://example.com/s24-1.jpg'], NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440003', 'MacBook Pro 14" M3', 'Laptop MacBook Pro 14 inch chip M3, 16GB RAM, 512GB SSD', '550e8400-e29b-41d4-a716-446655440003', 49990000, 42000000, 'MBP14-M3', '1234567890125', 'cái', ARRAY['https://example.com/mbp14-1.jpg'], NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440004', 'Dell XPS 15', 'Laptop Dell XPS 15 inch, Intel i7, 16GB RAM, 512GB SSD', '550e8400-e29b-41d4-a716-446655440003', 34990000, 30000000, 'DLLXPS15', '1234567890126', 'cái', NULL, NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440005', 'Áo sơ mi trắng nam', 'Áo sơ mi trắng form slim, chất liệu cotton 100%', '550e8400-e29b-41d4-a716-446655440005', 350000, 200000, 'ASM-TRANG', '1234567890127', 'cái', NULL, NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440006', 'Quần jean nam', 'Quần jean nam màu xanh, size 30-36', '550e8400-e29b-41d4-a716-446655440006', 450000, 250000, 'QJ-NAM', '1234567890128', 'cái', NULL, NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440007', 'Coca Cola 1.5L', 'Nước ngọt Coca Cola chai 1.5L', '550e8400-e29b-41d4-a716-446655440008', 25000, 15000, 'COKE-1.5L', '1234567890129', 'chai', NULL, NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440008', 'Pepsi 1.5L', 'Nước ngọt Pepsi chai 1.5L', '550e8400-e29b-41d4-a716-446655440008', 25000, 15000, 'PEPSI-1.5L', '1234567890130', 'chai', NULL, NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440009', 'Snack khoai tây', 'Snack khoai tây vị phô mai, gói 150g', '550e8400-e29b-41d4-a716-446655440009', 15000, 8000, 'SNACK-KT', '1234567890131', 'gói', NULL, NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440010', 'Bánh quy bơ', 'Bánh quy bơ thơm ngon, hộp 200g', '550e8400-e29b-41d4-a716-446655440009', 30000, 18000, 'BANH-BO', '1234567890132', 'hộp', NULL, NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440011', 'iPhone 14 Pro', 'Điện thoại iPhone 14 Pro 128GB', '550e8400-e29b-41d4-a716-446655440002', 24990000, 21000000, 'IP14P-128', '1234567890133', 'cái', NULL, NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440012', 'Áo thun nam', 'Áo thun nam màu đen, cotton 100%', '550e8400-e29b-41d4-a716-446655440005', 200000, 120000, 'AT-NAM', '1234567890134', 'cái', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. INVENTORY (Tồn kho)
-- ============================================
INSERT INTO inventory (id, "productId", quantity, "reservedQuantity", "availableQuantity", "lastUpdated") VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 50, 5, 45, NOW()),
('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440002', 30, 2, 28, NOW()),
('aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440003', 20, 1, 19, NOW()),
('aa0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440004', 25, 0, 25, NOW()),
('aa0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440005', 100, 10, 90, NOW()),
('aa0e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440006', 80, 5, 75, NOW()),
('aa0e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440007', 200, 20, 180, NOW()),
('aa0e8400-e29b-41d4-a716-446655440008', '990e8400-e29b-41d4-a716-446655440008', 200, 15, 185, NOW()),
('aa0e8400-e29b-41d4-a716-446655440009', '990e8400-e29b-41d4-a716-446655440009', 150, 10, 140, NOW()),
('aa0e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440010', 120, 5, 115, NOW()),
('aa0e8400-e29b-41d4-a716-446655440011', '990e8400-e29b-41d4-a716-446655440011', 40, 3, 37, NOW()),
('aa0e8400-e29b-41d4-a716-446655440012', '990e8400-e29b-41d4-a716-446655440012', 90, 8, 82, NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. ORDERS (Đơn hàng)
-- ============================================
INSERT INTO orders (id, "orderNumber", "customerId", "employeeId", subtotal, discount, tax, total, status, notes, "createdAt", "updatedAt") VALUES
('bb0e8400-e29b-41d4-a716-446655440001', 'ORD-2024-001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 29990000, 0, 2999000, 32989000, 'CONFIRMED', 'Khách hàng VIP', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
('bb0e8400-e29b-41d4-a716-446655440002', 'ORD-2024-002', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 350000, 0, 35000, 385000, 'PROCESSING', NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
('bb0e8400-e29b-41d4-a716-446655440003', 'ORD-2024-003', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440005', 25000, 0, 2500, 27500, 'DELIVERED', NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
('bb0e8400-e29b-41d4-a716-446655440004', 'ORD-2024-004', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 49990000, 1000000, 4899000, 53889000, 'SHIPPED', 'Giảm giá 1 triệu', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
('bb0e8400-e29b-41d4-a716-446655440005', 'ORD-2024-005', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440005', 700000, 50000, 65000, 715000, 'PENDING', 'Áo + Quần', NOW() - INTERVAL '1 day', NOW()),
('bb0e8400-e29b-41d4-a716-446655440006', 'ORD-2024-006', '660e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', 45000, 0, 4500, 49500, 'DELIVERED', NULL, NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days'),
('bb0e8400-e29b-41d4-a716-446655440007', 'ORD-2024-007', '660e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440006', 24990000, 0, 2499000, 27489000, 'CONFIRMED', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
('bb0e8400-e29b-41d4-a716-446655440008', 'ORD-2024-008', '660e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440002', 400000, 0, 40000, 440000, 'PROCESSING', 'Mua 2 áo', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 8. ORDER_ITEMS (Chi tiết đơn hàng)
-- ============================================
INSERT INTO order_items (id, "orderId", "productId", quantity, price, discount, subtotal) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 1, 29990000, 0, 29990000),
('cc0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440005', 1, 350000, 0, 350000),
('cc0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440007', 1, 25000, 0, 25000),
('cc0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440003', 1, 49990000, 1000000, 48990000),
('cc0e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440005', 1, 350000, 0, 350000),
('cc0e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440006', 1, 450000, 50000, 400000),
('cc0e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440009', 3, 15000, 0, 45000),
('cc0e8400-e29b-41d4-a716-446655440008', 'bb0e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440011', 1, 24990000, 0, 24990000),
('cc0e8400-e29b-41d4-a716-446655440009', 'bb0e8400-e29b-41d4-a716-446655440008', '990e8400-e29b-41d4-a716-446655440012', 2, 200000, 0, 400000)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. INVENTORY_TRANSACTIONS (Giao dịch kho)
-- ============================================
INSERT INTO inventory_transactions (id, "productId", type, quantity, "previousQuantity", "newQuantity", "supplierId", "orderId", reason, notes, "createdBy", "createdAt") VALUES
('dd0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'IMPORT', 50, 0, 50, '880e8400-e29b-41d4-a716-446655440001', NULL, 'Nhập hàng mới', 'Nhập hàng lần đầu', '770e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '30 days'),
('dd0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440002', 'IMPORT', 30, 0, 30, '880e8400-e29b-41d4-a716-446655440001', NULL, 'Nhập hàng mới', 'Nhập hàng lần đầu', '770e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '30 days'),
('dd0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440003', 'IMPORT', 20, 0, 20, '880e8400-e29b-41d4-a716-446655440001', NULL, 'Nhập hàng mới', 'Nhập hàng lần đầu', '770e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '30 days'),
('dd0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440005', 'IMPORT', 100, 0, 100, '880e8400-e29b-41d4-a716-446655440002', NULL, 'Nhập hàng mới', 'Nhập hàng lần đầu', '770e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '30 days'),
('dd0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440007', 'IMPORT', 200, 0, 200, '880e8400-e29b-41d4-a716-446655440003', NULL, 'Nhập hàng mới', 'Nhập hàng lần đầu', '770e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '30 days'),
('dd0e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440001', 'EXPORT', 1, 50, 49, NULL, 'bb0e8400-e29b-41d4-a716-446655440001', 'Bán hàng', 'Xuất bán cho đơn hàng ORD-2024-001', '770e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '5 days'),
('dd0e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440005', 'EXPORT', 2, 100, 98, NULL, 'bb0e8400-e29b-41d4-a716-446655440002', 'Bán hàng', 'Xuất bán cho đơn hàng ORD-2024-002 và ORD-2024-005', '770e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '4 days'),
('dd0e8400-e29b-41d4-a716-446655440008', '990e8400-e29b-41d4-a716-446655440003', 'EXPORT', 1, 20, 19, NULL, 'bb0e8400-e29b-41d4-a716-446655440004', 'Bán hàng', 'Xuất bán cho đơn hàng ORD-2024-004', '770e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '2 days'),
('dd0e8400-e29b-41d4-a716-446655440009', '990e8400-e29b-41d4-a716-446655440001', 'ADJUSTMENT', -4, 49, 45, NULL, NULL, 'Kiểm kê', 'Điều chỉnh sau kiểm kê', '770e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '1 day'),
('dd0e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440011', 'IMPORT', 40, 0, 40, '880e8400-e29b-41d4-a716-446655440001', NULL, 'Nhập hàng mới', 'Nhập hàng iPhone 14 Pro', '770e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '10 days'),
('dd0e8400-e29b-41d4-a716-446655440011', '990e8400-e29b-41d4-a716-446655440011', 'EXPORT', 1, 40, 39, NULL, 'bb0e8400-e29b-41d4-a716-446655440007', 'Bán hàng', 'Xuất bán cho đơn hàng ORD-2024-007', '770e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 10. PAYMENTS (Thanh toán)
-- ============================================
INSERT INTO payments (id, "orderId", amount, method, status, "transactionId", notes, "createdAt", "updatedAt") VALUES
('ee0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', 32989000, 'BANK_TRANSFER', 'COMPLETED', 'TXN-2024-001', 'Chuyển khoản ngân hàng', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('ee0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440002', 385000, 'CASH', 'COMPLETED', NULL, 'Thanh toán tiền mặt', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('ee0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440003', 27500, 'E_WALLET', 'COMPLETED', 'TXN-2024-003', 'Thanh toán ví điện tử', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('ee0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440004', 53889000, 'CARD', 'COMPLETED', 'TXN-2024-004', 'Thanh toán thẻ tín dụng', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('ee0e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440005', 715000, 'CASH', 'PENDING', NULL, 'Chưa thanh toán', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('ee0e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440006', 49500, 'E_WALLET', 'COMPLETED', 'TXN-2024-006', 'Thanh toán ví điện tử', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('ee0e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440007', 27489000, 'BANK_TRANSFER', 'COMPLETED', 'TXN-2024-007', 'Chuyển khoản ngân hàng', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('ee0e8400-e29b-41d4-a716-446655440008', 'bb0e8400-e29b-41d4-a716-446655440008', 440000, 'CARD', 'PENDING', NULL, 'Đang xử lý', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 11. PROMOTIONS (Khuyến mãi)
-- ============================================
INSERT INTO promotions (id, name, description, type, value, "startDate", "endDate", "productId", "categoryId", "minPurchaseAmount", "isActive", "createdAt", "updatedAt") VALUES
('ff0e8400-e29b-41d4-a716-446655440001', 'Giảm 10% điện thoại', 'Giảm 10% cho tất cả điện thoại', 'PERCENTAGE', 10, '2024-01-01 00:00:00', '2024-12-31 23:59:59', NULL, '550e8400-e29b-41d4-a716-446655440002', NULL, true, NOW() - INTERVAL '30 days', NOW()),
('ff0e8400-e29b-41d4-a716-446655440002', 'Giảm 50k cho áo sơ mi', 'Giảm 50.000đ cho áo sơ mi trắng', 'FIXED_AMOUNT', 50000, '2024-01-01 00:00:00', '2024-12-31 23:59:59', '990e8400-e29b-41d4-a716-446655440005', NULL, NULL, true, NOW() - INTERVAL '30 days', NOW()),
('ff0e8400-e29b-41d4-a716-446655440003', 'Giảm 5% đơn hàng trên 1 triệu', 'Giảm 5% cho đơn hàng từ 1 triệu trở lên', 'PERCENTAGE', 5, '2024-01-01 00:00:00', '2024-12-31 23:59:59', NULL, NULL, 1000000, true, NOW() - INTERVAL '30 days', NOW()),
('ff0e8400-e29b-41d4-a716-446655440004', 'Mua 2 tặng 1 nước ngọt', 'Mua 2 chai nước ngọt tặng 1 chai', 'BUY_X_GET_Y', 1, '2024-01-01 00:00:00', '2024-12-31 23:59:59', NULL, '550e8400-e29b-41d4-a716-446655440008', NULL, true, NOW() - INTERVAL '30 days', NOW()),
('ff0e8400-e29b-41d4-a716-446655440005', 'Giảm 15% laptop', 'Giảm 15% cho tất cả laptop', 'PERCENTAGE', 15, '2024-06-01 00:00:00', '2024-06-30 23:59:59', NULL, '550e8400-e29b-41d4-a716-446655440003', NULL, true, NOW() - INTERVAL '10 days', NOW()),
('ff0e8400-e29b-41d4-a716-446655440006', 'Giảm 20k snack', 'Giảm 20.000đ cho snack khoai tây', 'FIXED_AMOUNT', 20000, '2024-01-01 00:00:00', '2024-12-31 23:59:59', '990e8400-e29b-41d4-a716-446655440009', NULL, NULL, false, NOW() - INTERVAL '30 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Kết thúc script
-- ============================================
-- Kiểm tra số lượng bản ghi đã insert
SELECT 
    'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'promotions', COUNT(*) FROM promotions;

