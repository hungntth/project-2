import { useEffect, useState } from 'react';
import { promotionsApi } from '../services/api';
import { Tag, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Promotions() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const response = await promotionsApi.getAll();
      setPromotions(response.data);
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) return;

    try {
      await promotionsApi.delete(id);
      loadPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      alert('Có lỗi xảy ra khi xóa khuyến mãi');
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
        <Tag className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Khuyến mãi</h1>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Tên khuyến mãi</th>
                <th className="text-left py-3 px-4">Mô tả</th>
                <th className="text-left py-3 px-4">Giảm giá</th>
                <th className="text-left py-3 px-4">Ngày bắt đầu</th>
                <th className="text-left py-3 px-4">Ngày kết thúc</th>
                <th className="text-left py-3 px-4">Trạng thái</th>
                <th className="text-left py-3 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Không có khuyến mãi nào
                  </td>
                </tr>
              ) : (
                promotions.map((promotion) => {
                  const isActive = promotion.isActive !== false;
                  const now = new Date();
                  const startDate = promotion.startDate
                    ? new Date(promotion.startDate)
                    : null;
                  const endDate = promotion.endDate
                    ? new Date(promotion.endDate)
                    : null;
                  const isCurrentlyActive =
                    isActive &&
                    (!startDate || startDate <= now) &&
                    (!endDate || endDate >= now);

                  return (
                    <tr
                      key={promotion.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium">
                        {promotion.name}
                      </td>
                      <td className="py-3 px-4">
                        {promotion.description || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {promotion.discountType === 'percentage'
                          ? `${promotion.discountValue}%`
                          : `${new Intl.NumberFormat('vi-VN').format(promotion.discountValue || 0)} đ`}
                      </td>
                      <td className="py-3 px-4">
                        {startDate ? format(startDate, 'dd/MM/yyyy') : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {endDate ? format(endDate, 'dd/MM/yyyy') : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            isCurrentlyActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {isCurrentlyActive
                            ? 'Đang hoạt động'
                            : 'Không hoạt động'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDelete(promotion.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

