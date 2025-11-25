# Yêu Cầu Đặt Ra Trong Đợt Thực Tập

Trong quá trình thực tập, dự án phải đáp ứng các yêu cầu cụ thể về mặt kỹ thuật, chức năng và chất lượng:

## Yêu Cầu Về Công Nghệ

Dự án yêu cầu sử dụng các công nghệ và framework hiện đại trong phát triển backend:

- **NestJS Framework** - Framework chính cho việc xây dựng ứng dụng server-side
- **TypeScript** - Ngôn ngữ lập trình với type safety và các tính năng hiện đại
- **TypeORM** - ORM để quản lý database một cách hiệu quả
- **PostgreSQL** - Hệ quản trị cơ sở dữ liệu quan hệ
- Tuân thủ các best practices và design patterns trong phát triển phần mềm

## Yêu Cầu Về Chức Năng

Hệ thống phải cung cấp đầy đủ các module chức năng cơ bản và nâng cao:

- Quản lý danh mục sản phẩm với cấu trúc đa cấp
- Quản lý sản phẩm với đầy đủ thông tin (giá, tồn kho, hình ảnh, v.v.)
- Quản lý khách hàng và lịch sử mua hàng
- Quản lý đơn hàng với quy trình xử lý hoàn chỉnh
- Quản lý kho hàng với theo dõi nhập xuất và tồn kho
- Quản lý nhân viên và phân quyền
- Quản lý nhà cung cấp
- Xử lý thanh toán với nhiều phương thức
- Quản lý khuyến mãi và chương trình giảm giá
- Báo cáo và thống kê doanh số

## Yêu Cầu Về Kiến Trúc và Code Quality

- Kiến trúc module rõ ràng, dễ bảo trì và mở rộng
- Code được tổ chức tốt, tuân thủ các nguyên tắc SOLID
- Sử dụng DTOs (Data Transfer Objects) cho validation và transformation
- Xử lý lỗi và exception handling đầy đủ
- Code được format và lint đúng chuẩn

## Yêu Cầu Về Database Design

- Thiết kế database schema hợp lý với các quan hệ rõ ràng
- Sử dụng các ràng buộc (constraints) và indexes phù hợp
- Đảm bảo tính toàn vẹn dữ liệu (data integrity)
- Hỗ trợ các quan hệ: One-to-Many, Many-to-One, và self-referencing

## Yêu Cầu Về Tài Liệu

- Tài liệu mô tả dự án đầy đủ (README.md)
- Tài liệu về khung cảnh thực hiện đề tài
- Tài liệu hướng dẫn cài đặt và sử dụng
- Code comments và documentation cho các module quan trọng

## Yêu Cầu Về Testing và Quality Assurance

- Viết unit tests cho các service và controller
- Thực hiện integration tests cho các API endpoints
- Đảm bảo code coverage ở mức hợp lý
- Kiểm thử các chức năng chính của hệ thống

## Yêu Cầu Về Version Control

- Sử dụng Git để quản lý phiên bản code
- Commit messages rõ ràng và có ý nghĩa
- Quản lý branches hợp lý
- Code được push lên remote repository (GitHub/GitLab)
