import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ordersApi,
  productsApi,
  customersApi,
  promotionsApi,
} from '../services/api';
import { ArrowLeft, Plus, X } from 'lucide-react';

export default function OrderCreate() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<string>('');
  const [promotionDiscount, setPromotionDiscount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
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
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
  });
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadProducts();
    loadPromotions();
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
      setProducts(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };


  const loadPromotions = async () => {
    try {
      const response = await promotionsApi.getActive();
      setPromotions(response.data || []);
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  };

  const handlePromotionChange = async (promotionId: string) => {
    setSelectedPromotion(promotionId);
    if (!promotionId) {
      setPromotionDiscount(0);
      return;
    }

    try {
      const subtotal = getTotal();
      const response = await promotionsApi.apply(promotionId, subtotal);
      setPromotionDiscount(response.data.discount || 0);
    } catch (error: any) {
      console.error('Error applying promotion:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Không thể áp dụng voucher này';
      alert(`⚠️ ${errorMessage}`);
      setSelectedPromotion('');
      setPromotionDiscount(0);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim()) {
      alert('Vui lòng nhập tên khách hàng');
      return;
    }

    setCreatingCustomer(true);
    try {
      const response = await customersApi.create(customerForm);
      await loadCustomers(); // Reload customers list
      setFormData({ ...formData, customerId: response.data.id }); // Auto-select new customer
      setShowCustomerModal(false);
      setCustomerForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        country: '',
      });
    } catch (error: any) {
      console.error('Error creating customer:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Có lỗi xảy ra khi tạo khách hàng';
      alert(errorMessage);
    } finally {
      setCreatingCustomer(false);
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

  const getSubtotal = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const discount = item.discount || 0;
      return sum + (itemTotal - discount);
    }, 0);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    return subtotal - promotionDiscount;
  };

  // Recalculate promotion discount when items change
  useEffect(() => {
    if (selectedPromotion && items.length > 0) {
      const subtotal = getSubtotal();
      promotionsApi
        .apply(selectedPromotion, subtotal)
        .then((response) => {
          setPromotionDiscount(response.data.discount || 0);
        })
        .catch((error) => {
          console.error('Error recalculating promotion:', error);
          setPromotionDiscount(0);
        });
    } else {
      setPromotionDiscount(0);
    }
  }, [items, selectedPromotion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('⚠️ Vui lòng thêm ít nhất một sản phẩm vào đơn hàng');
      return;
    }

    if (!formData.customerId) {
      alert('⚠️ Vui lòng chọn khách hàng cho đơn hàng');
      return;
    }

    // Validate items
    for (const item of items) {
      if (!item.productId) {
        alert('⚠️ Có sản phẩm không hợp lệ trong đơn hàng');
        return;
      }
      if (!item.quantity || item.quantity < 1) {
        alert('⚠️ Số lượng sản phẩm phải lớn hơn 0');
        return;
      }
      if (!item.price || item.price <= 0) {
        alert('⚠️ Giá sản phẩm không hợp lệ');
        return;
      }
    }

    setLoading(true);
    try {
      const data = {
        customerId: formData.customerId,
        notes: formData.notes || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price),
          discount: item.discount ? Number(item.discount) : undefined,
        })),
      };
      console.log('Sending order data:', data);
      const response = await ordersApi.create(data);
      alert('✅ Tạo đơn hàng thành công!');
      navigate(`/orders/${response.data.id}`);
    } catch (error: any) {
      console.error('Error creating order:', error);
      let errorMessage = 'Có lỗi xảy ra khi tạo đơn hàng';
      
      if (error.response?.data) {
        // Handle validation errors
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('\n');
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}`);
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
              <div className="space-y-3">
                <div>
                  <label className="label">Chọn sản phẩm *</label>
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
                    className="input"
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} -{' '}
                        {new Intl.NumberFormat('vi-VN').format(product.price)} đ
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Số lượng *</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) =>
                      setItemQuantity(parseInt(e.target.value) || 1)
                    }
                    placeholder="Nhập số lượng"
                    className="input"
                    required
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addItem}
                disabled={!selectedProduct || itemQuantity < 1}
                className="btn btn-primary w-full mt-4"
              >
                Thêm sản phẩm vào đơn hàng
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
                <div className="flex items-center justify-between mb-2">
                  <label className="label">Khách hàng *</label>
                  <button
                    type="button"
                    onClick={() => setShowCustomerModal(true)}
                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm mới
                  </button>
                </div>
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
                      {customer.phone ? ` - ${customer.phone}` : ''}
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
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label">Voucher / Khuyến mãi</label>
                  <button
                    type="button"
                    onClick={() => navigate('/promotions')}
                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Tạo voucher
                  </button>
                </div>
                {promotions.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Chưa có voucher nào đang hoạt động. 
                      <button
                        type="button"
                        onClick={() => navigate('/promotions')}
                        className="text-primary-600 hover:text-primary-700 font-medium ml-1 underline"
                      >
                        Tạo voucher mới
                      </button>
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedPromotion}
                      onChange={(e) => handlePromotionChange(e.target.value)}
                      className="input"
                    >
                      <option value="">-- Không sử dụng voucher --</option>
                      {promotions.map((promotion) => (
                        <option key={promotion.id} value={promotion.id}>
                          {promotion.name}
                          {promotion.type === 'PERCENTAGE'
                            ? ` - ${promotion.value}%`
                            : ` - ${new Intl.NumberFormat('vi-VN').format(promotion.value)} đ`}
                          {promotion.minPurchaseAmount &&
                            ` (Tối thiểu ${new Intl.NumberFormat('vi-VN').format(promotion.minPurchaseAmount)} đ)`}
                        </option>
                      ))}
                    </select>
                    {selectedPromotion && promotionDiscount > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ Đã giảm:{' '}
                        {new Intl.NumberFormat('vi-VN').format(promotionDiscount)} đ
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('vi-VN').format(getSubtotal())} đ
                  </span>
                </div>
                {promotionDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span className="font-medium">
                      -{new Intl.NumberFormat('vi-VN').format(promotionDiscount)} đ
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Tổng tiền:</span>
                  <span className="text-primary-600">
                    {new Intl.NumberFormat('vi-VN').format(getTotal())} đ
                  </span>
                </div>
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

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Thêm khách hàng mới</h2>
                </div>
                <button
                  onClick={() => {
                    setShowCustomerModal(false);
                    setCustomerForm({
                      name: '',
                      phone: '',
                      email: '',
                      address: '',
                      city: '',
                      country: '',
                    });
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div>
                  <label className="label">Tên khách hàng *</label>
                  <input
                    type="text"
                    required
                    value={customerForm.name}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, name: e.target.value })
                    }
                    className="input"
                    placeholder="Nhập tên khách hàng"
                  />
                </div>
                <div>
                  <label className="label">Số điện thoại</label>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, phone: e.target.value })
                    }
                    className="input"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, email: e.target.value })
                    }
                    className="input"
                    placeholder="Nhập email"
                  />
                </div>
                <div>
                  <label className="label">Địa chỉ</label>
                  <textarea
                    value={customerForm.address}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, address: e.target.value })
                    }
                    className="input"
                    rows={2}
                    placeholder="Nhập địa chỉ"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Thành phố</label>
                    <input
                      type="text"
                      value={customerForm.city}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, city: e.target.value })
                      }
                      className="input"
                      placeholder="Thành phố"
                    />
                  </div>
                  <div>
                    <label className="label">Quốc gia</label>
                    <input
                      type="text"
                      value={customerForm.country}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, country: e.target.value })
                      }
                      className="input"
                      placeholder="Quốc gia"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomerModal(false);
                      setCustomerForm({
                        name: '',
                        phone: '',
                        email: '',
                        address: '',
                        city: '',
                        country: '',
                      });
                    }}
                    className="btn btn-secondary flex-1"
                    disabled={creatingCustomer}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={creatingCustomer}
                  >
                    {creatingCustomer ? 'Đang tạo...' : 'Tạo khách hàng'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

