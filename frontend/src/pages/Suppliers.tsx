import { useEffect, useState } from 'react';
import { suppliersApi } from '../services/api';
import { Truck, Trash2 } from 'lucide-react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) return;

    try {
      await suppliersApi.delete(id);
      loadSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Có lỗi xảy ra khi xóa nhà cung cấp');
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
      <div className="flex items-center gap-2 mb-6">
        <Truck className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Nhà cung cấp</h1>
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
                      <button
                        onClick={() => handleDelete(supplier.id)}
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

