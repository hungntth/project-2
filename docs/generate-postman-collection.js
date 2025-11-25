#!/usr/bin/env node

/**
 * Script để tự động tạo Postman Collection từ NestJS Controllers
 * Chạy: node generate-postman-collection.js
 */

const fs = require('fs');
const path = require('path');

// Cấu hình
const BASE_URL = 'http://localhost:3000';
const API_PREFIX = 'api';
const CONTROLLERS_DIR = path.join(__dirname, 'src');
const OUTPUT_FILE = path.join(
  __dirname,
  'postman',
  'Sales-Management-API.postman_collection.json',
);

// Tạo thư mục postman nếu chưa có
const postmanDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(postmanDir)) {
  fs.mkdirSync(postmanDir, { recursive: true });
}

/**
 * Parse controller file để tìm các routes
 */
function parseController(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const routes = [];

  // Tìm @Controller decorator để lấy base path
  const controllerMatch = content.match(/@Controller\(['"]([^'"]+)['"]\)/);
  if (!controllerMatch) return null;

  const basePath = controllerMatch[1];
  const moduleName = path.basename(path.dirname(filePath));

  // Tìm tất cả các method handlers - parse từng method riêng biệt
  const methodHandlers = [];

  // Pattern để tìm decorator và method handler
  // Tìm @Get/@Post/etc và method name ngay sau đó
  const decoratorPattern =
    /@(Get|Post|Put|Patch|Delete)\(['"]?([^'"]*)['"]?\)/g;
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const decoratorMatch = line.match(
      /@(Get|Post|Put|Patch|Delete)\(['"]?([^'"]*)['"]?\)/,
    );

    if (decoratorMatch) {
      const method = decoratorMatch[1].toUpperCase();
      const routePath = decoratorMatch[2] || '';

      // Tìm method name ở dòng tiếp theo
      let handlerName = 'unknown';
      let methodContent = '';
      let j = i + 1;

      // Tìm method handler (có thể trên nhiều dòng)
      while (j < lines.length && j < i + 10) {
        methodContent += lines[j] + '\n';
        const handlerMatch = lines[j].match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
        if (handlerMatch && !lines[j].includes('constructor')) {
          handlerName = handlerMatch[1];
          break;
        }
        // Dừng nếu gặp decorator mới hoặc closing brace
        if (lines[j].trim().startsWith('@') && j > i + 1) break;
        if (lines[j].trim() === '}' && j > i + 2) break;
        j++;
      }

      // Tìm query parameters trong method content
      const queryParams = [];
      const queryMatches = methodContent.matchAll(
        /@Query\(['"]?([^'"]*)['"]?\)/g,
      );
      for (const queryMatch of queryMatches) {
        const paramName = queryMatch[1] || 'param';
        queryParams.push({
          key: paramName,
          value: '',
          description: '',
        });
      }

      // Tìm path parameters
      const pathParams = [];
      const pathParamMatches = methodContent.matchAll(
        /@Param\(['"]?([^'"]*)['"]?\)/g,
      );
      for (const pathParamMatch of pathParamMatches) {
        const paramName = pathParamMatch[1] || 'id';
        pathParams.push({
          key: paramName,
          value: `{{${paramName}}}`,
          description: '',
        });
      }

      // Xây dựng full path
      let fullPath = basePath;
      if (routePath) {
        if (routePath.startsWith('/')) {
          fullPath = routePath.substring(1);
        } else {
          fullPath = basePath + (routePath ? '/' + routePath : '');
        }
      }

      // Xử lý path parameters trong route path
      const pathParamRegex = /:(\w+)/g;
      let pathParamMatch;
      while ((pathParamMatch = pathParamRegex.exec(routePath)) !== null) {
        const paramName = pathParamMatch[1];
        if (!pathParams.find((p) => p.key === paramName)) {
          pathParams.push({
            key: paramName,
            value: `{{${paramName}}}`,
            description: '',
          });
        }
      }

      methodHandlers.push({
        method,
        path: fullPath,
        handlerName,
        queryParams,
        pathParams,
      });
    }
  }

  return {
    moduleName,
    basePath,
    routes: methodHandlers,
  };
}

/**
 * Tạo request body mẫu dựa trên DTO
 */
function generateRequestBody(moduleName, handlerName, method) {
  if (method !== 'POST' && method !== 'PATCH' && method !== 'PUT') {
    return null;
  }

  // Tạo body mẫu dựa trên handler name
  const bodyExamples = {
    create: generateCreateBody(moduleName),
    update: generateUpdateBody(moduleName),
  };

  if (handlerName.toLowerCase().includes('create')) {
    return bodyExamples.create;
  } else if (handlerName.toLowerCase().includes('update')) {
    return bodyExamples.update;
  }

  return bodyExamples.create || {};
}

/**
 * Tạo body mẫu cho create
 */
function generateCreateBody(moduleName) {
  const examples = {
    categories: {
      name: 'Danh mục mới',
      description: 'Mô tả danh mục',
      parentId: null,
    },
    products: {
      name: 'Sản phẩm mới',
      description: 'Mô tả sản phẩm',
      categoryId: '{{categoryId}}',
      price: 100000,
      costPrice: 80000,
      sku: 'SKU-001',
      barcode: '1234567890123',
      unit: 'cái',
    },
    customers: {
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      phone: '0901234567',
      address: '123 Đường ABC',
      city: 'Hồ Chí Minh',
      country: 'Việt Nam',
    },
    employees: {
      name: 'Nguyễn Văn B',
      email: 'nguyenvanb@store.com',
      phone: '0912345678',
      role: 'SALES',
      address: '456 Đường XYZ',
    },
    suppliers: {
      name: 'Nhà cung cấp ABC',
      companyName: 'ABC Company',
      email: 'contact@abc.com',
      phone: '0281234567',
      address: '123 Đường ABC',
      city: 'Hồ Chí Minh',
      country: 'Việt Nam',
    },
    orders: {
      customerId: '{{customerId}}',
      employeeId: '{{employeeId}}',
      items: [
        {
          productId: '{{productId}}',
          quantity: 2,
          price: 100000,
          discount: 0,
        },
      ],
      discount: 0,
      tax: 0,
      notes: 'Ghi chú đơn hàng',
    },
    payments: {
      orderId: '{{orderId}}',
      amount: 100000,
      method: 'CASH',
      transactionId: 'TXN-001',
      notes: 'Thanh toán tiền mặt',
    },
    promotions: {
      name: 'Khuyến mãi mới',
      description: 'Mô tả khuyến mãi',
      type: 'PERCENTAGE',
      value: 10,
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      productId: null,
      categoryId: null,
      minPurchaseAmount: 1000000,
    },
    inventory: {
      productId: '{{productId}}',
      quantity: 100,
      supplierId: '{{supplierId}}',
      reason: 'Nhập hàng mới',
      notes: 'Ghi chú nhập kho',
    },
  };

  return examples[moduleName] || {};
}

/**
 * Tạo body mẫu cho update
 */
function generateUpdateBody(moduleName) {
  const examples = {
    categories: {
      name: 'Danh mục đã cập nhật',
      description: 'Mô tả mới',
    },
    products: {
      name: 'Sản phẩm đã cập nhật',
      price: 120000,
    },
    customers: {
      name: 'Tên mới',
      phone: '0901234568',
    },
    employees: {
      name: 'Tên mới',
      role: 'MANAGER',
    },
    suppliers: {
      name: 'Tên mới',
      phone: '0281234568',
    },
    orders: {
      status: 'CONFIRMED',
      notes: 'Ghi chú mới',
    },
    payments: {
      status: 'COMPLETED',
      notes: 'Đã thanh toán',
    },
    promotions: {
      isActive: false,
      value: 15,
    },
  };

  return examples[moduleName] || {};
}

/**
 * Tạo Postman Collection
 */
function generatePostmanCollection() {
  const collection = {
    info: {
      name: 'Sales Management API',
      description: 'API Collection cho hệ thống quản lý bán hàng',
      schema:
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    variable: [
      {
        key: 'baseUrl',
        value: BASE_URL,
        type: 'string',
      },
      {
        key: 'apiPrefix',
        value: API_PREFIX,
        type: 'string',
      },
    ],
    item: [],
  };

  // Tìm tất cả các controller files
  const controllerFiles = [];
  function findControllers(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        findControllers(filePath);
      } else if (file.endsWith('.controller.ts') && !file.includes('.spec.')) {
        controllerFiles.push(filePath);
      }
    }
  }

  findControllers(CONTROLLERS_DIR);

  // Parse từng controller
  const modules = {};
  for (const filePath of controllerFiles) {
    const controller = parseController(filePath);
    if (controller) {
      if (!modules[controller.moduleName]) {
        modules[controller.moduleName] = [];
      }
      modules[controller.moduleName].push(controller);
    }
  }

  // Tạo collection items
  for (const [moduleName, controllers] of Object.entries(modules)) {
    const folder = {
      name: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
      item: [],
    };

    for (const controller of controllers) {
      for (const route of controller.routes) {
        const url = {
          raw: `{{baseUrl}}/{{apiPrefix}}/${route.path}`,
          host: ['{{baseUrl}}'],
          path: ['{{apiPrefix}}', ...route.path.split('/')],
          query: route.queryParams,
        };

        // Xử lý path parameters
        if (route.pathParams.length > 0) {
          url.variable = route.pathParams.map((p) => ({
            key: p.key,
            value: p.value,
            description: p.description,
          }));
        }

        const request = {
          method: route.method,
          header: [
            {
              key: 'Content-Type',
              value: 'application/json',
            },
          ],
          url: url,
        };

        // Thêm body nếu là POST/PUT/PATCH
        const body = generateRequestBody(
          controller.moduleName,
          route.handlerName,
          route.method,
        );
        if (body && Object.keys(body).length > 0) {
          request.body = {
            mode: 'raw',
            raw: JSON.stringify(body, null, 2),
            options: {
              raw: {
                language: 'json',
              },
            },
          };
        }

        const item = {
          name: `${route.method} ${route.path} - ${route.handlerName}`,
          request: request,
          response: [],
        };

        folder.item.push(item);
      }
    }

    collection.item.push(folder);
  }

  // Ghi file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(collection, null, 2), 'utf-8');
  console.log(`✅ Đã tạo Postman Collection tại: ${OUTPUT_FILE}`);
  console.log(`📦 Tổng số modules: ${Object.keys(modules).length}`);
  console.log(
    `📋 Tổng số requests: ${collection.item.reduce((sum, folder) => sum + folder.item.length, 0)}`,
  );
}

// Chạy script
try {
  generatePostmanCollection();
} catch (error) {
  console.error('❌ Lỗi khi tạo Postman Collection:', error);
  process.exit(1);
}
