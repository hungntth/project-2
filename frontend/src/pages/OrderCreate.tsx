import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ordersApi,
  productsApi,
  customersApi,
  employeesApi,
} from '../services/api';
import { ArrowLeft } from 'lucide-react';

export default function OrderCreate() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    employeeId: '',
    notes: '',
  });
  const [items, setItems] = useState<
    Array<{
      productId: string;
      quantity: number;
      price: number;
      discount?: number;
    }>
  >([]);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    price: number;
  } | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemDiscount, setItemDiscount] = useState(0);

  useEffect(() => {
    loadCustomers();
    loadProducts();
    loadEmployees();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customersApi.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeesApi.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const addItem = () => {
    if (!selectedProduct) return;

    const existingIndex = items.findIndex(
      (item) => item.productId === selectedProduct.id,
    );
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += itemQuantity;
      setItems(newItems);
    } else {
      setItems([
        ...items,
        {
          productId: selectedProduct.id,
          quantity: itemQuantity,
          price: selectedProduct.price,
          discount: itemDiscount || undefined,
        },
      ]);
    }

    setSelectedProduct(null);
    setItemQuantity(1);
    setItemDiscount(0);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getTotal = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const discount = item.discount || 0;
      return sum + (itemTotal - discount);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    setLoading(true);
    try {
      const data = {
        customerId: formData.customerId,
        employeeId: formData.employeeId || undefined,
        notes: formData.notes || undefined,
        items: items,
      };
      const response = await ordersApi.create(data);
      navigate(`/orders/${response.data.id}`);
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold">Tạo đơn hàng mới</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Sản phẩm</h2>

            {/* Add Item */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-4 gap-2 mb-2">
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const product = products.find(
                      (p) => p.id === e.target.value,
                    );
                    setSelectedProduct(
                      product ? { id: product.id, price: product.price } : null,
                    );
                  }}
                  className="input col-span-2"
                >
                  <option value="">Chọn sản phẩm</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} -{' '}
                      {new Intl.NumberFormat('vi-VN').format(product.price)} đ
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) =>
                    setItemQuantity(parseInt(e.target.value) || 1)
                  }
                  placeholder="Số lượng"
                  className="input"
                />
                <input
                  type="number"
                  min="0"
                  value={itemDiscount}
                  onChange={(e) =>
                    setItemDiscount(parseFloat(e.target.value) || 0)
                  }
                  placeholder="Giảm giá"
                  className="input"
                />
              </div>
              <button
                type="button"
                onClick={addItem}
                disabled={!selectedProduct}
                className="btn btn-primary w-full"
              >
                Thêm sản phẩm
              </button>
            </div>

            {/* Items List */}
            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Chưa có sản phẩm nào
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => {
                  const product = products.find((p) => p.id === item.productId);
                  const itemTotal =
                    item.price * item.quantity - (item.discount || 0);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{product?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">
                          {new Intl.NumberFormat('vi-VN').format(item.price)} đ
                          × {item.quantity}
                          {item.discount
                            ? ` - Giảm: ${new Intl.NumberFormat('vi-VN').format(item.discount)} đ`
                            : ''}
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-medium">
                          {new Intl.NumberFormat('vi-VN').format(itemTotal)} đ
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Xóa
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Order Info */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Khách hàng *</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) =>
                    setFormData({ ...formData, customerId: e.target.value })
                  }
                  className="input"
                >
                  <option value="">Chọn khách hàng</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Nhân viên</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                  className="input"
                >
                  <option value="">Không chọn</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="input"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Tổng kết</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tổng tiền:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('vi-VN').format(getTotal())} đ
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="btn btn-primary w-full mt-4"
            >
              {loading ? 'Đang tạo...' : 'Tạo đơn hàng'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

