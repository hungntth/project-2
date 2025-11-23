import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../services/api';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsApi.getAll({ search: searchTerm });
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      await productsApi.delete(id);
      loadProducts();
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sản phẩm</h1>
        <Link
          to="/products/create"
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm sản phẩm
        </Link>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && loadProducts()}
          className="input"
        />
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Tên sản phẩm</th>
                <th className="text-left py-3 px-4">Danh mục</th>
                <th className="text-left py-3 px-4">Giá</th>
                <th className="text-left py-3 px-4">SKU</th>
                <th className="text-left py-3 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Không có sản phẩm nào
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">
                      {product.category?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      {new Intl.NumberFormat('vi-VN').format(
                        product.price || 0,
                      )}{' '}
                      đ
                    </td>
                    <td className="py-3 px-4">{product.sku || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

