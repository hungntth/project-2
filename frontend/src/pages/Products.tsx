import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../services/api';
import { Plus, Edit, Trash2, Eye, Package } from 'lucide-react';

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
      // API returns { data: [...], total, page, limit, totalPages }
      setProducts(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Sản phẩm
          </h1>
          <p className="text-gray-600">Quản lý danh mục sản phẩm</p>
        </div>
        <Link
          to="/products/create"
          className="btn btn-primary flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Thêm sản phẩm
        </Link>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadProducts()}
              className="input pl-12"
            />
            <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <button
            onClick={loadProducts}
            className="btn btn-primary"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Danh sách sản phẩm</h2>
          </div>
          <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full"></div>
        </div>
        <div className="overflow-x-auto rounded-xl">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th className="text-right">Giá</th>
                <th>SKU</th>
                <th className="text-center">Thao tác</th>
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
                  <tr key={product.id}>
                    <td className="font-semibold">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary-600" />
                        </div>
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{product.category?.name || 'N/A'}</span>
                    </td>
                    <td className="text-right">
                      <span className="font-bold text-primary-600 text-lg">
                        {new Intl.NumberFormat('vi-VN').format(
                          product.price || 0,
                        )}{' '}
                        đ
                      </span>
                    </td>
                    <td className="font-mono text-xs text-gray-600">{product.sku || 'N/A'}</td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all hover:scale-110"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="p-2.5 text-green-600 hover:bg-green-100 rounded-xl transition-all hover:scale-110"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-all hover:scale-110"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
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

