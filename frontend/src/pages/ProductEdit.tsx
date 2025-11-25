import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi, categoriesApi, uploadApi } from '../services/api';
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:3000');

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    costPrice: '',
    sku: '',
    barcode: '',
    unit: '',
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
      });
      // Load existing images
      if (product.images && Array.isArray(product.images)) {
        setUploadedImages(product.images);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const response = await uploadApi.uploadImage(file);
        return response.data.url;
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedImages((prev) => [...prev, ...urls]);
      toast.success(`Đã upload ${urls.length} ảnh thành công`);
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi upload ảnh');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: any = {
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        costPrice: formData.costPrice
          ? parseFloat(formData.costPrice)
          : undefined,
        sku: formData.sku || undefined,
        barcode: formData.barcode || undefined,
        unit: formData.unit || undefined,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      };
      await productsApi.update(id!, data);
      toast.success('Cập nhật sản phẩm thành công!');
      navigate(`/products/${id}`);
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(
        error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="w-full max-w-4xl px-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/products/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">Chỉnh sửa sản phẩm</h1>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <div className="space-y-6">
            {/* Tên sản phẩm */}
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
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="label">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input"
                rows={4}
                placeholder="Nhập mô tả sản phẩm"
              />
            </div>

            {/* Danh mục */}
            <div>
              <label className="label">Danh mục</label>
              <select
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

            {/* Giá bán và Giá vốn */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Giá bán</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="input"
                  placeholder="0"
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
                  placeholder="0"
                />
              </div>
            </div>

            {/* SKU và Barcode */}
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
                  placeholder="Mã SKU"
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
                  placeholder="Mã vạch"
                />
              </div>
            </div>

            {/* Đơn vị */}
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

            {/* Upload ảnh */}
            <div>
              <label className="label">Hình ảnh sản phẩm</label>
              <div className="space-y-4">
                {/* Upload button */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors ${
                      uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600">
                      {uploading ? 'Đang upload...' : 'Chọn ảnh để upload'}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Chấp nhận: JPEG, PNG, GIF, WebP (tối đa 5MB mỗi ảnh)
                  </p>
                </div>

                {/* Preview images */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          <img
                            src={`${API_BASE_URL}${url}`}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadedImages.length === 0 && (
                  <div className="flex items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Chưa có ảnh nào được upload</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/products/${id}`)}
                className="btn btn-secondary"
                disabled={loading || uploading}
              >
                Hủy
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
