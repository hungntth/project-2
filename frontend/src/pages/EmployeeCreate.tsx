import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeesApi } from '../services/api';
import { ArrowLeft } from 'lucide-react';

export default function EmployeeCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    position: '',
    salary: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
      };
      await employeesApi.create(data);
      navigate('/employees');
    } catch (error: any) {
      console.error('Error creating employee:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo nhân viên');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/employees')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold">Thêm nhân viên mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="label">Tên nhân viên *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Số điện thoại</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Địa chỉ</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Chức vụ</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Lương</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.salary}
              onChange={(e) =>
                setFormData({ ...formData, salary: e.target.value })
              }
              className="input"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Đang tạo...' : 'Tạo nhân viên'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="btn btn-secondary"
            >
              Hủy
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

