import { useEffect, useState } from 'react';
import { categoriesApi } from '../services/api';
import { Plus, Trash2, Edit2, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    parentId: '',
  });
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    parentId: '',
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleDeleteClick = (category: any) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    setSubmitting(true);
    try {
      await categoriesApi.delete(selectedCategory.id);
      setShowDeleteModal(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa danh mục';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (category: any) => {
    setSelectedCategory(category);
    setEditForm({
      name: category.name || '',
      description: category.description || '',
      parentId: category.parentId || '',
    });
    setShowEditModal(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    setSubmitting(true);
    try {
      await categoriesApi.update(selectedCategory.id, {
        name: editForm.name,
        description: editForm.description || undefined,
        parentId: editForm.parentId || undefined,
      });
      setShowEditModal(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (error: any) {
      console.error('Error updating category:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật danh mục';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateClick = () => {
    setCreateForm({
      name: '',
      description: '',
      parentId: '',
    });
    setShowCreateModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      await categoriesApi.create({
        name: createForm.name,
        description: createForm.description || undefined,
        parentId: createForm.parentId || undefined,
      });
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', parentId: '' });
      loadCategories();
    } catch (error: any) {
      console.error('Error creating category:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tạo danh mục';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
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
        <button
          onClick={handleCreateClick}
          className="btn bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Thêm danh mục
        </button>
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Xác nhận xóa</h2>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCategory(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  disabled={submitting}
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Bạn có chắc chắn muốn xóa danh mục{' '}
                <span className="font-bold text-red-600">
                  "{selectedCategory?.name}"
                </span>
                ?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="btn bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 flex-1"
                >
                  {submitting ? 'Đang xóa...' : 'Xóa'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCategory(null);
                  }}
                  disabled={submitting}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Edit2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Chỉnh sửa danh mục</h2>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCategory(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  disabled={submitting}
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="label">Tên danh mục *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="input"
                    placeholder="Nhập tên danh mục"
                  />
                </div>
                <div>
                  <label className="label">Mô tả</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="input"
                    rows={3}
                    placeholder="Nhập mô tả danh mục (tùy chọn)"
                  />
                </div>
                <div>
                  <label className="label">Danh mục cha</label>
                  <select
                    value={editForm.parentId}
                    onChange={(e) =>
                      setEditForm({ ...editForm, parentId: e.target.value })
                    }
                    className="input"
                  >
                    <option value="">Không có (danh mục gốc)</option>
                    {categories
                      .filter((cat) => cat.id !== selectedCategory?.id)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary flex-1"
                  >
                    {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedCategory(null);
                    }}
                    disabled={submitting}
                    className="btn btn-secondary"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Thêm danh mục mới</h2>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({ name: '', description: '', parentId: '' });
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  disabled={submitting}
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label">Tên danh mục *</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    className="input"
                    placeholder="Nhập tên danh mục"
                  />
                </div>
                <div>
                  <label className="label">Mô tả</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, description: e.target.value })
                    }
                    className="input"
                    rows={3}
                    placeholder="Nhập mô tả danh mục (tùy chọn)"
                  />
                </div>
                <div>
                  <label className="label">Danh mục cha</label>
                  <select
                    value={createForm.parentId}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, parentId: e.target.value })
                    }
                    className="input"
                  >
                    <option value="">Không có (danh mục gốc)</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 flex-1"
                  >
                    {submitting ? 'Đang tạo...' : 'Tạo danh mục'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateForm({ name: '', description: '', parentId: '' });
                    }}
                    disabled={submitting}
                    className="btn btn-secondary"
                  >
                    Hủy
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

