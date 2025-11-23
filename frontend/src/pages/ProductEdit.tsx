import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi, categoriesApi } from '../services/api';
import { ArrowLeft } from 'lucide-react';

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    costPrice: '',
    sku: '',
    barcode: '',
    unit: '',
    images: '',
  });

  useEffect(() => {
    if (id) {
      loadCategories();
      loadProduct();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProduct = async () => {
    try {
      const response = await productsApi.getById(id!);
      const product = response.data;
      setFormData({
        name: product.name || '',
        description: product.description || '',
        categoryId: product.categoryId || product.category?.id || '',
        price: product.price?.toString() || '',
        costPrice: product.costPrice?.toString() || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        unit: product.unit || '',
        images: product.images?.join(', ') || '',
      });
    } catch (error) {
      console.error('Error loading product:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice
          ? parseFloat(formData.costPrice)
          : undefined,
        images: formData.images
          ? formData.images.split(',').map((img) => img.trim())
          : undefined,
      };
      await productsApi.update(id!, data);
      navigate(`/products/${id}`);
    } catch (error: any) {
      console.error('Error updating product:', error);
      alert(
        error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/products/${id}`)}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold">Chỉnh sửa sản phẩm</h1>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="label">Tên sản phẩm *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input"
              rows={4}
            />
          </div>

          <div>
            <label className="label">Danh mục *</label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="input"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Giá bán *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="input"
              />
            </div>

            <div>
              <label className="label">Giá vốn</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({ ...formData, costPrice: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="input"
              />
            </div>

            <div>
              <label className="label">Barcode</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) =>
                  setFormData({ ...formData, barcode: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Đơn vị</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
              className="input"
              placeholder="Ví dụ: cái, kg, lít..."
            />
          </div>

          <div>
            <label className="label">
              Hình ảnh (URL, phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={formData.images}
              onChange={(e) =>
                setFormData({ ...formData, images: e.target.value })
              }
              className="input"
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/products/${id}`)}
              className="btn btn-secondary"
            >
              Hủy
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

