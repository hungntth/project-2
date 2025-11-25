import axios from 'axios';

// Use relative path in production, or env variable, or default to localhost for dev
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getInventory: (id: string) => api.get(`/products/${id}/inventory`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.patch(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  getProducts: (id: string) => api.get(`/categories/${id}/products`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Customers API
export const customersApi = {
  getAll: () => api.get('/customers'),
  getById: (id: string) => api.get(`/customers/${id}`),
  getOrders: (id: string) => api.get(`/customers/${id}/orders`),
  getStatistics: (id: string) => api.get(`/customers/${id}/statistics`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.patch(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

// Orders API
export const ordersApi = {
  getAll: (params?: any) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  getInvoice: (id: string) => api.get(`/orders/${id}/invoice`),
  create: (data: any) => api.post('/orders', data),
  update: (id: string, data: any) => api.patch(`/orders/${id}`, data),
  updateStatus: (id: string, data: any) =>
    api.patch(`/orders/${id}/status`, data),
  delete: (id: string) => api.delete(`/orders/${id}`),
};

// Inventory API
export const inventoryApi = {
  getAll: () => api.get('/inventory'),
  getByProductId: (productId: string) => api.get(`/inventory/${productId}`),
  getLowStock: (threshold?: number) =>
    api.get('/inventory/low-stock/list', { params: { threshold } }),
  getHistory: (productId?: string) =>
    api.get('/inventory/history/list', { params: { productId } }),
  getPeriodInventory: (period: string, productId?: string) =>
    api.get(`/inventory/period/${period}`, { params: { productId } }),
  import: (data: any) => api.post('/inventory/import', data),
  export: (data: any) => api.post('/inventory/export', data),
  adjust: (productId: string, data: any) =>
    api.patch(`/inventory/${productId}/adjust`, data),
};

// Payments API
export const paymentsApi = {
  getAll: () => api.get('/payments'),
  getById: (id: string) => api.get(`/payments/${id}`),
  getByOrderId: (orderId: string) => api.get(`/payments/order/${orderId}`),
  getPaymentMethods: () => api.get('/payments/methods'),
  create: (data: any) => api.post('/payments', data),
  update: (id: string, data: any) => api.patch(`/payments/${id}`, data),
};

// Promotions API
export const promotionsApi = {
  getAll: () => api.get('/promotions'),
  getActive: () => api.get('/promotions/active'),
  getById: (id: string) => api.get(`/promotions/${id}`),
  create: (data: any) => api.post('/promotions', data),
  update: (id: string, data: any) => api.patch(`/promotions/${id}`, data),
  apply: (id: string, orderAmount: number) =>
    api.post(`/promotions/${id}/apply`, { orderAmount }),
  delete: (id: string) => api.delete(`/promotions/${id}`),
};

// Suppliers API
export const suppliersApi = {
  getAll: () => api.get('/suppliers'),
  getById: (id: string) => api.get(`/suppliers/${id}`),
  getProducts: (id: string) => api.get(`/suppliers/${id}/products`),
  getPurchaseOrders: (id: string) =>
    api.get(`/suppliers/${id}/purchase-orders`),
  create: (data: any) => api.post('/suppliers', data),
  update: (id: string, data: any) => api.patch(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
};

// Upload API
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;

