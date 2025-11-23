import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesApi } from '../services/api';
import { ArrowLeft } from 'lucide-react';

export default function CategoryCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await categoriesApi.create(formData);
      navigate('/categories');
    } catch (error: any) {
      console.error('Error creating category:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo danh mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/categories')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold">Thêm danh mục mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="label">Tên danh mục *</label>
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
            <label className="label">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input"
              rows={4}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Đang tạo...' : 'Tạo danh mục'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/categories')}
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

