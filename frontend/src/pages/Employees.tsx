import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { employeesApi } from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await employeesApi.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;

    try {
      await employeesApi.delete(id);
      loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Có lỗi xảy ra khi xóa nhân viên');
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
        <h1 className="text-3xl font-bold">Nhân viên</h1>
        <Link
          to="/employees/create"
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm nhân viên
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
                <th className="text-left py-3 px-4">Chức vụ</th>
                <th className="text-left py-3 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Không có nhân viên nào
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{employee.name}</td>
                    <td className="py-3 px-4">{employee.email || 'N/A'}</td>
                    <td className="py-3 px-4">{employee.phone || 'N/A'}</td>
                    <td className="py-3 px-4">{employee.position || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(employee.id)}
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

