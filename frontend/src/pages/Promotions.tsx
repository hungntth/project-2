import { useEffect, useState } from 'react';
import { promotionsApi, productsApi, categoriesApi } from '../services/api';
import { Tag, Trash2, Plus, Edit, X } from 'lucide-react';
import { format } from 'date-fns';

export default function Promotions() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y',
    value: '',
    startDate: '',
    endDate: '',
    productId: '',
    categoryId: '',
    minPurchaseAmount: '',
    isActive: true,
  });

  useEffect(() => {
    loadPromotions();
    loadProducts();
    loadCategories();
  }, []);

  const loadPromotions = async () => {
    try {
      const response = await promotionsApi.getAll();
      setPromotions(response.data);
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
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

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) return;

    try {
      await promotionsApi.delete(id);
      loadPromotions();
      alert('✅ Xóa voucher thành công!');
    } catch (error: any) {
      console.error('Error deleting promotion:', error);
      alert(
        `❌ ${error.response?.data?.message || 'Có lỗi xảy ra khi xóa voucher'}`,
      );
    }
  };

  const handleEdit = (promotion: any) => {
    setEditingPromotion(promotion);
    const startDate = promotion.startDate
      ? format(new Date(promotion.startDate), "yyyy-MM-dd'T'HH:mm")
      : '';
    const endDate = promotion.endDate
      ? format(new Date(promotion.endDate), "yyyy-MM-dd'T'HH:mm")
      : '';
    setFormData({
      name: promotion.name || '',
      description: promotion.description || '',
      type: promotion.type || 'PERCENTAGE',
      value: promotion.value?.toString() || '',
      startDate,
      endDate,
      productId: promotion.productId || '',
      categoryId: promotion.categoryId || '',
      minPurchaseAmount: promotion.minPurchaseAmount?.toString() || '',
      isActive: promotion.isActive !== false,
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingPromotion(null);
    setFormData({
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: '',
      startDate: '',
      endDate: '',
      productId: '',
      categoryId: '',
      minPurchaseAmount: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('⚠️ Vui lòng nhập tên voucher');
      return;
    }
    if (!formData.value || parseFloat(formData.value) < 0) {
      alert('⚠️ Vui lòng nhập giá trị hợp lệ');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      alert('⚠️ Vui lòng chọn ngày bắt đầu và kết thúc');
      return;
    }

    setSaving(true);
    try {
      const data: any = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        value: parseFloat(formData.value),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        productId: formData.productId || undefined,
        categoryId: formData.categoryId || undefined,
        minPurchaseAmount: formData.minPurchaseAmount
          ? parseFloat(formData.minPurchaseAmount)
          : undefined,
      };

      if (editingPromotion) {
        await promotionsApi.update(editingPromotion.id, data);
        alert('✅ Cập nhật voucher thành công!');
      } else {
        await promotionsApi.create(data);
        alert('✅ Tạo voucher thành công!');
      }
      setShowModal(false);
      loadPromotions();
    } catch (error: any) {
      console.error('Error saving promotion:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Có lỗi xảy ra khi lưu voucher';
      alert(`❌ ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Tag className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Khuyến mãi</h1>
        </div>
        <button onClick={handleCreate} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Thêm voucher mới
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full table-modern">
            <thead>
              <tr>
                <th>Tên voucher</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Điều kiện</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Chưa có voucher nào. Nhấn "Thêm voucher mới" để tạo.
                  </td>
                </tr>
              ) : (
                promotions.map((promotion) => {
                  const isActive = promotion.isActive !== false;
                  const now = new Date();
                  const startDate = promotion.startDate
                    ? new Date(promotion.startDate)
                    : null;
                  const endDate = promotion.endDate
                    ? new Date(promotion.endDate)
                    : null;
                  const isCurrentlyActive =
                    isActive &&
                    (!startDate || startDate <= now) &&
                    (!endDate || endDate >= now);

                  return (
                    <tr key={promotion.id} className="hover:bg-gray-50">
                      <td className="font-medium">{promotion.name}</td>
                      <td>
                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium whitespace-nowrap">
                          {promotion.type === 'PERCENTAGE'
                            ? 'Phần trăm'
                            : promotion.type === 'FIXED_AMOUNT'
                              ? 'Số tiền cố định'
                              : 'Mua X tặng Y'}
                        </span>
                      </td>
                      <td>
                        {promotion.type === 'PERCENTAGE'
                          ? `${promotion.value}%`
                          : `${new Intl.NumberFormat('vi-VN').format(promotion.value)} đ`}
                      </td>
                      <td>
                        {startDate ? format(startDate, 'dd/MM/yyyy HH:mm') : 'N/A'}
                      </td>
                      <td>
                        {endDate ? format(endDate, 'dd/MM/yyyy HH:mm') : 'N/A'}
                      </td>
                      <td className="text-sm">
                        {promotion.minPurchaseAmount ? (
                          <span>
                            Tối thiểu:{' '}
                            {new Intl.NumberFormat('vi-VN').format(
                              promotion.minPurchaseAmount,
                            )}{' '}
                            đ
                          </span>
                        ) : (
                          <span className="text-gray-400">Không có</span>
                        )}
                        {promotion.product && (
                          <div className="text-xs text-gray-500 mt-1">
                            SP: {promotion.product.name}
                          </div>
                        )}
                        {promotion.category && (
                          <div className="text-xs text-gray-500 mt-1">
                            DM: {promotion.category.name}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            isCurrentlyActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {isCurrentlyActive ? 'Đang hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(promotion)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(promotion.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 rounded-t-2xl sticky top-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingPromotion ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Tên voucher *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="input"
                      placeholder="Nhập tên voucher"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="input"
                      rows={2}
                      placeholder="Nhập mô tả (tùy chọn)"
                    />
                  </div>
                  <div>
                    <label className="label">Loại giảm giá *</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as any,
                        })
                      }
                      className="input"
                    >
                      <option value="PERCENTAGE">Phần trăm (%)</option>
                      <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
                      <option value="BUY_X_GET_Y">Mua X tặng Y</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">
                      Giá trị *{' '}
                      {formData.type === 'PERCENTAGE' ? '(%)' : '(đ)'}
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({ ...formData, value: e.target.value })
                      }
                      className="input"
                      placeholder={
                        formData.type === 'PERCENTAGE'
                          ? 'Ví dụ: 10'
                          : 'Ví dụ: 50000'
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Ngày bắt đầu *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Ngày kết thúc *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Sản phẩm áp dụng</label>
                    <select
                      value={formData.productId}
                      onChange={(e) =>
                        setFormData({ ...formData, productId: e.target.value })
                      }
                      className="input"
                    >
                      <option value="">-- Tất cả sản phẩm --</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Danh mục áp dụng</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      className="input"
                    >
                      <option value="">-- Tất cả danh mục --</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Giá trị đơn hàng tối thiểu (đ)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minPurchaseAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minPurchaseAmount: e.target.value,
                        })
                      }
                      className="input"
                      placeholder="Không bắt buộc"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Đơn hàng phải đạt mức này mới được áp dụng voucher
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary flex-1"
                    disabled={saving}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={saving}
                  >
                    {saving
                      ? 'Đang lưu...'
                      : editingPromotion
                        ? 'Cập nhật'
                        : 'Tạo voucher'}
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
