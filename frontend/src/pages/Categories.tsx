import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriesApi } from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

    try {
      await categoriesApi.delete(id);
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Có lỗi xảy ra khi xóa danh mục');
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
        <h1 className="text-3xl font-bold">Danh mục</h1>
        <Link
          to="/categories/create"
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm danh mục
        </Link>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Tên danh mục</th>
                <th className="text-left py-3 px-4">Mô tả</th>
                <th className="text-left py-3 px-4">Số sản phẩm</th>
                <th className="text-left py-3 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    Không có danh mục nào
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{category.name}</td>
                    <td className="py-3 px-4">
                      {category.description || 'N/A'}
                    </td>
                    <td className="py-3 px-4">{category.productCount || 0}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

