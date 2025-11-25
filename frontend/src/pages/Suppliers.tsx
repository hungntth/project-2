import { useEffect, useState } from 'react';
import { suppliersApi } from '../services/api';
import { Truck, Trash2, Plus, Edit2, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });
  const [createForm, setCreateForm] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await suppliersApi.getAll();
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedSupplier) return;

    setSubmitting(true);
    try {
      await suppliersApi.delete(selectedSupplier.id);
      setShowDeleteModal(false);
      setSelectedSupplier(null);
      loadSuppliers();
    } catch (error: any) {
      console.error('Error deleting supplier:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa nhà cung cấp';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (supplier: any) => {
    setSelectedSupplier(supplier);
    setEditForm({
      name: supplier.name || '',
      companyName: supplier.companyName || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      country: supplier.country || '',
    });
    setShowEditModal(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    setSubmitting(true);
    try {
      await suppliersApi.update(selectedSupplier.id, {
        name: editForm.name,
        companyName: editForm.companyName || undefined,
        email: editForm.email || undefined,
        phone: editForm.phone || undefined,
        address: editForm.address || undefined,
        city: editForm.city || undefined,
        country: editForm.country || undefined,
      });
      setShowEditModal(false);
      setSelectedSupplier(null);
      loadSuppliers();
    } catch (error: any) {
      console.error('Error updating supplier:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật nhà cung cấp';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateClick = () => {
    setCreateForm({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
    });
    setShowCreateModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      await suppliersApi.create({
        name: createForm.name,
        companyName: createForm.companyName || undefined,
        email: createForm.email || undefined,
        phone: createForm.phone || undefined,
        address: createForm.address || undefined,
        city: createForm.city || undefined,
        country: createForm.country || undefined,
      });
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
      });
      loadSuppliers();
    } catch (error: any) {
      console.error('Error creating supplier:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tạo nhà cung cấp';
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
        <div className="flex items-center gap-2">
          <Truck className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Nhà cung cấp</h1>
        </div>
        <button
          onClick={handleCreateClick}
          className="btn bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Thêm nhà cung cấp
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Tên nhà cung cấp</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Số điện thoại</th>
                <th className="text-left py-3 px-4">Địa chỉ</th>
                <th className="text-left py-3 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Không có nhà cung cấp nào
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{supplier.name}</td>
                    <td className="py-3 px-4">{supplier.email || 'N/A'}</td>
                    <td className="py-3 px-4">{supplier.phone || 'N/A'}</td>
                    <td className="py-3 px-4">{supplier.address || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(supplier)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(supplier)}
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
                    setSelectedSupplier(null);
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
                Bạn có chắc chắn muốn xóa nhà cung cấp{' '}
                <span className="font-bold text-red-600">
                  "{selectedSupplier?.name}"
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
                    setSelectedSupplier(null);
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Edit2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Chỉnh sửa nhà cung cấp</h2>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSupplier(null);
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Tên nhà cung cấp *</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="input"
                      placeholder="Nhập tên nhà cung cấp"
                    />
                  </div>
                  <div>
                    <label className="label">Tên công ty</label>
                    <input
                      type="text"
                      value={editForm.companyName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, companyName: e.target.value })
                      }
                      className="input"
                      placeholder="Nhập tên công ty (tùy chọn)"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="input"
                      placeholder="Nhập email (tùy chọn)"
                    />
                  </div>
                  <div>
                    <label className="label">Số điện thoại</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="input"
                      placeholder="Nhập số điện thoại (tùy chọn)"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Địa chỉ</label>
                    <textarea
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      className="input"
                      rows={2}
                      placeholder="Nhập địa chỉ (tùy chọn)"
                    />
                  </div>
                  <div>
                    <label className="label">Thành phố</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) =>
                        setEditForm({ ...editForm, city: e.target.value })
                      }
                      className="input"
                      placeholder="Nhập thành phố (tùy chọn)"
                    />
                  </div>
                  <div>
                    <label className="label">Quốc gia</label>
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) =>
                        setEditForm({ ...editForm, country: e.target.value })
                      }
                      className="input"
                      placeholder="Nhập quốc gia (tùy chọn)"
                    />
                  </div>
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
                      setSelectedSupplier(null);
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Thêm nhà cung cấp mới</h2>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({
                      name: '',
                      companyName: '',
                      email: '',
                      phone: '',
                      address: '',
                      city: '',
                      country: '',
                    });
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Tên nhà cung cấp *</label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, name: e.target.value })
                      }
                      className="input"
                      placeholder="Nhập tên nhà cung cấp"
                    />
                  </div>
                  <div>
                    <label className="label">Tên công ty</label>
                    <input
                      type="text"
                      value={createForm.companyName}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, companyName: e.target.value })
                      }
                      className="input"
                      placeholder="Nhập tên công ty (tùy chọn)"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, email: e.target.value })
                      }
                      className="input"
                      placeholder="Nhập email (tùy chọn)"
                    />
                  </div>
                  <div>
                    <label className="label">Số điện thoại</label>
                    <input
                      type="tel"
                      value={createForm.phone}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, phone: e.target.value })
                      }
                      className="input"
                      placeholder="Nhập số điện thoại (tùy chọn)"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Địa chỉ</label>
                    <textarea
                      value={createForm.address}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, address: e.target.value })
                      }
                      className="input"
                      rows={2}
                      placeholder="Nhập địa chỉ (tùy chọn)"
                    />
                  </div>
                  <div>
                    <label className="label">Thành phố</label>
                    <input
                      type="text"
                      value={createForm.city}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, city: e.target.value })
                      }
                      className="input"
                      placeholder="Nhập thành phố (tùy chọn)"
                    />
                  </div>
                  <div>
                    <label className="label">Quốc gia</label>
                    <input
                      type="text"
                      value={createForm.country}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, country: e.target.value })
                      }
                      className="input"
                      placeholder="Nhập quốc gia (tùy chọn)"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 flex-1"
                  >
                    {submitting ? 'Đang tạo...' : 'Tạo nhà cung cấp'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateForm({
                        name: '',
                        companyName: '',
                        email: '',
                        phone: '',
                        address: '',
                        city: '',
                        country: '',
                      });
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

