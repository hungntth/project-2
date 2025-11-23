import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsApi } from '../services/api';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [inventory, setInventory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct();
      loadInventory();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await productsApi.getById(id!);
      setProduct(response.data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await productsApi.getInventory(id!);
      setInventory(response.data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      await productsApi.delete(id!);
      navigate('/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không tìm thấy sản phẩm</p>
        <Link
          to="/products"
          className="text-primary-600 hover:underline mt-4 inline-block"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">{product.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/products/${id}/edit`}
            className="btn btn-primary flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Chỉnh sửa
          </Link>
          <button
            onClick={handleDelete}
            className="btn btn-danger flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Xóa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Info */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Thông tin sản phẩm</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Tên sản phẩm</label>
              <p className="font-medium">{product.name}</p>
            </div>
            {product.description && (
              <div>
                <label className="text-sm text-gray-600">Mô tả</label>
                <p>{product.description}</p>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-600">Danh mục</label>
              <p className="font-medium">{product.category?.name || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Giá bán</label>
                <p className="font-medium text-lg text-primary-600">
                  {new Intl.NumberFormat('vi-VN').format(product.price || 0)} đ
                </p>
              </div>
              {product.costPrice && (
                <div>
                  <label className="text-sm text-gray-600">Giá vốn</label>
                  <p className="font-medium">
                    {new Intl.NumberFormat('vi-VN').format(product.costPrice)} đ
                  </p>
                </div>
              )}
            </div>
            {product.sku && (
              <div>
                <label className="text-sm text-gray-600">SKU</label>
                <p className="font-mono">{product.sku}</p>
              </div>
            )}
            {product.barcode && (
              <div>
                <label className="text-sm text-gray-600">Barcode</label>
                <p className="font-mono">{product.barcode}</p>
              </div>
            )}
            {product.unit && (
              <div>
                <label className="text-sm text-gray-600">Đơn vị</label>
                <p>{product.unit}</p>
              </div>
            )}
          </div>
        </div>

        {/* Inventory Info */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Tồn kho</h2>
          {inventory ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Số lượng tồn</label>
                <p className="text-3xl font-bold text-primary-600">
                  {inventory.quantity || 0}
                </p>
              </div>
              {inventory.reservedQuantity && (
                <div>
                  <label className="text-sm text-gray-600">
                    Số lượng đã đặt
                  </label>
                  <p className="font-medium">{inventory.reservedQuantity}</p>
                </div>
              )}
              {inventory.availableQuantity !== undefined && (
                <div>
                  <label className="text-sm text-gray-600">
                    Số lượng khả dụng
                  </label>
                  <p className="font-medium text-green-600">
                    {inventory.availableQuantity}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Chưa có thông tin tồn kho</p>
          )}
        </div>
      </div>
    </div>
  );
}

