import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customersApi } from '../services/api';
import { Plus, Eye, Trash2 } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customersApi.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return;

    try {
      await customersApi.delete(id);
      loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Có lỗi xảy ra khi xóa khách hàng');
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
        <h1 className="text-3xl font-bold">Khách hàng</h1>
        <Link
          to="/customers/create"
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm khách hàng
        </Link>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Tên</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Số điện thoại</th>
                <th className="text-left py-3 px-4">Địa chỉ</th>
                <th className="text-left py-3 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Không có khách hàng nào
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{customer.name}</td>
                    <td className="py-3 px-4">{customer.email || 'N/A'}</td>
                    <td className="py-3 px-4">{customer.phone || 'N/A'}</td>
                    <td className="py-3 px-4">{customer.address || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/customers/${customer.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(customer.id)}
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

