# Hệ Thống Quản Lý Bán Hàng (Sales Management System)

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## 📋 Giới thiệu

Hệ thống Quản Lý Bán Hàng là một ứng dụng backend API được xây dựng bằng NestJS, cung cấp các chức năng quản lý toàn diện cho cửa hàng và doanh nghiệp. Hệ thống hỗ trợ quản lý sản phẩm, khách hàng, đơn hàng, kho hàng, thanh toán, khuyến mãi và báo cáo thống kê.

## 🛠️ Công nghệ sử dụng

### Backend Framework

- **NestJS** (v11.0.1) - Progressive Node.js framework cho việc xây dựng các ứng dụng server-side hiệu quả và có thể mở rộng

### Database & ORM

- **PostgreSQL** - Hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở, mạnh mẽ và đáng tin cậy
- **TypeORM** (v0.3.27) - ORM (Object-Relational Mapping) cho TypeScript và JavaScript

### Ngôn ngữ lập trình

- **TypeScript** (v5.7.3) - Superset của JavaScript với type safety và các tính năng hiện đại

### Thư viện chính

- **@nestjs/typeorm** (v11.0.0) - Tích hợp TypeORM với NestJS
- **@nestjs/config** (v4.0.2) - Quản lý cấu hình ứng dụng
- **class-validator** (v0.14.2) - Validation decorators cho DTOs
- **class-transformer** (v0.5.1) - Transform plain objects to class instances
- **pg** (v8.16.3) - PostgreSQL client cho Node.js
- **uuid** (v13.0.0) - Tạo unique identifiers

### Công cụ phát triển

- **Jest** (v30.0.0) - Testing framework
- **ESLint** (v9.18.0) - Linting tool
- **Prettier** (v3.4.2) - Code formatter

## 📦 Yêu cầu hệ thống

- **Node.js**: v22.x trở lên (khuyến nghị v22.10.7+)
- **PostgreSQL**: v12 trở lên
- **Yarn** hoặc **npm** để quản lý dependencies

## 🏗️ Cấu trúc dự án

Dự án được tổ chức theo kiến trúc module của NestJS, mỗi module bao gồm:

- `controller.ts` - Xử lý HTTP requests
- `service.ts` - Business logic
- `module.ts` - Module configuration
- `entities/` - Database entities
- `dto/` - Data Transfer Objects

### Các module chính:

1. **Categories** - Quản lý danh mục sản phẩm
2. **Products** - Quản lý sản phẩm
3. **Customers** - Quản lý khách hàng
4. **Orders** - Quản lý đơn hàng
5. **Inventory** - Quản lý kho hàng
6. **Employees** - Quản lý nhân viên
7. **Suppliers** - Quản lý nhà cung cấp
8. **Payments** - Quản lý thanh toán
9. **Promotions** - Quản lý khuyến mãi
10. **Reports** - Báo cáo và thống kê

## 🗄️ Database Entities và Quan hệ

### 1. **Category** (Danh mục)

- **Quan hệ tự tham chiếu**:
  - `parent` (ManyToOne) → `Category` - Danh mục cha
  - `children` (OneToMany) → `Category[]` - Các danh mục con
- Hỗ trợ cấu trúc danh mục đa cấp

### 2. **Product** (Sản phẩm)

- **Quan hệ**:
  - `category` (ManyToOne) → `Category` - Thuộc danh mục nào
- **Thuộc tính**: name, description, price, costPrice, sku, barcode, unit, images

### 3. **Customer** (Khách hàng)

- Không có quan hệ trực tiếp với entity khác
- **Thuộc tính**: name, email, phone, address, city, country

### 4. **Employee** (Nhân viên)

- Không có quan hệ trực tiếp với entity khác
- **Thuộc tính**: name, email, phone, role, address

### 5. **Order** (Đơn hàng)

- **Quan hệ**:
  - `customer` (ManyToOne) → `Customer` - Khách hàng đặt hàng
  - `employee` (ManyToOne) → `Employee` - Nhân viên xử lý (nullable)
  - `items` (OneToMany) → `OrderItem[]` - Chi tiết đơn hàng
- **Thuộc tính**: orderNumber, subtotal, discount, tax, total, status, notes

### 6. **OrderItem** (Chi tiết đơn hàng)

- **Quan hệ**:
  - `order` (ManyToOne) → `Order` - Thuộc đơn hàng nào
- **Thuộc tính**: productId, quantity, price, discount, subtotal

### 7. **Inventory** (Tồn kho)

- **Quan hệ**:
  - `product` (ManyToOne) → `Product` - Sản phẩm trong kho
- **Thuộc tính**: quantity, reservedQuantity, availableQuantity

### 8. **InventoryTransaction** (Giao dịch kho)

- **Quan hệ**:
  - `product` (ManyToOne) → `Product` - Sản phẩm được giao dịch
- **Thuộc tính**: type (IMPORT/EXPORT/ADJUSTMENT), quantity, previousQuantity, newQuantity, supplierId, orderId, reason, notes

### 9. **Supplier** (Nhà cung cấp)

- Không có quan hệ trực tiếp với entity khác
- **Thuộc tính**: name, companyName, email, phone, address, city, country

### 10. **Payment** (Thanh toán)

- **Quan hệ**:
  - `order` (ManyToOne) → `Order` - Thanh toán cho đơn hàng nào
- **Thuộc tính**: amount, method, status, transactionId, notes

### 11. **Promotion** (Khuyến mãi)

- **Quan hệ**:
  - `product` (ManyToOne) → `Product` - Áp dụng cho sản phẩm (nullable)
  - `category` (ManyToOne) → `Category` - Áp dụng cho danh mục (nullable)
- **Thuộc tính**: name, description, type, value, startDate, endDate, minPurchaseAmount, isActive

## 📊 Sơ đồ quan hệ tổng quan

```
Category (self-referencing)
  └── Product (ManyToOne)
       ├── Inventory (OneToOne)
       ├── InventoryTransaction (ManyToOne)
       └── OrderItem (references via productId)
            └── Order (OneToMany)
                 ├── Customer (ManyToOne)
                 ├── Employee (ManyToOne, nullable)
                 └── Payment (OneToMany)

Promotion
  ├── Product (ManyToOne, nullable)
  └── Category (ManyToOne, nullable)

Supplier (standalone)
```

## 🚀 Cài đặt và chạy dự án

### 1. Cài đặt dependencies

```bash
yarn install
```

### 2. Cấu hình database

Tạo file `.env` trong thư mục gốc:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database_name
DB_SYNCHRONIZE=false
DB_LOGGING=true
```

### 3. Chạy ứng dụng

```bash
# Development mode
yarn start

# Watch mode (tự động reload khi có thay đổi)
yarn dev

# Production mode
yarn start:prod
```

### 4. Build dự án

```bash
yarn build
```

## 🧪 Testing

```bash
# Unit tests
yarn test

# Watch mode
yarn test:watch

# Test coverage
yarn test:cov

# E2E tests
yarn test:e2e
```

## 📝 Scripts có sẵn

- `yarn build` - Build dự án
- `yarn format` - Format code với Prettier
- `yarn start` - Chạy ứng dụng
- `yarn dev` - Chạy ở chế độ watch
- `yarn start:debug` - Chạy ở chế độ debug
- `yarn start:prod` - Chạy ở production mode
- `yarn lint` - Lint code và tự động fix
- `yarn test` - Chạy unit tests
- `yarn test:watch` - Chạy tests ở watch mode
- `yarn test:cov` - Chạy tests với coverage report
- `yarn test:e2e` - Chạy E2E tests

## 📚 Tài liệu tham khảo

Xem thêm các tài liệu chi tiết:

- `INTRODUCTION.md` - Giới thiệu chi tiết về dự án
- API documentation (nếu có)
- Database setup guide (nếu có)

## 🔮 Hướng phát triển tương lai

- [ ] Authentication & Authorization (JWT, RBAC)
- [ ] Real-time features với WebSocket
- [ ] Advanced reporting và dashboard
- [ ] Integration với payment gateways
- [ ] Email/SMS notifications
- [ ] Caching với Redis
- [ ] API rate limiting
- [ ] Unit tests và Integration tests đầy đủ

## 📄 License

UNLICENSED

---

<p align="center">Được xây dựng với ❤️ bằng NestJS</p>
