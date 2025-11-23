import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersApi } from '../services/api';
import { ArrowLeft } from 'lucide-react';

export default function CustomerCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await customersApi.create(formData);
      navigate('/customers');
    } catch (error: any) {
      console.error('Error creating customer:', error);
      alert(
        error.response?.data?.message || 'Có lỗi xảy ra khi tạo khách hàng',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold">Thêm khách hàng mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="label">Tên khách hàng *</label>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Thành phố</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="input"
              />
            </div>

            <div>
              <label className="label">Quốc gia</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Đang tạo...' : 'Tạo khách hàng'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/customers')}
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

